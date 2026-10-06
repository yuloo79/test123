---
description: Publish this project to a GitHub repo. Scans for sensitive data, writes the README with a screenshot of the site, sets up the CI/CD workflow and GitHub Pages, and fills in the repo About section with the live link.
argument-hint: <github-repo-url>
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(gh *) mcp__playwright__* Read Write Edit Grep Glob
---

# Publish this project to GitHub

Target repository: **$ARGUMENTS**

## Current state

```!
git rev-parse --abbrev-ref HEAD 2>&1 || true
git remote -v 2>&1 || true
git status --short 2>&1 || true
ls -A 2>&1 || true
```

## What to do

Work through the steps in order. The security scan is a gate: it runs before
anything is pushed, because a secret that reaches GitHub has to be treated as
leaked even if it is deleted a minute later.

### 1. Resolve the target

- Take the repo from the argument above. Accept `https://github.com/OWNER/REPO`,
  the same with `.git`, or `git@github.com:OWNER/REPO.git`. If no repo was given,
  ask for the link and stop until you have it.
- Read the repo: `gh api repos/OWNER/REPO --jq '{private, default_branch, description, homepage, size, owner: .owner.type}'`.
  Use `gh api` REST calls throughout rather than `gh repo view` / `gh repo edit`:
  some environments, including Claude cloud sessions, block GitHub's GraphQL API
  that those two depend on.
  If the call fails, report the exact error (missing repo, no access, `gh` not
  signed in) and stop. Do not create the repo or change its visibility.
- If this folder is not a git repo, run `git init -b main`.
- If there is no `origin`, add it. If `origin` already points at a different
  repo, stop and ask which one is right; do not overwrite it silently.
- If the remote has commits the local branch lacks, `git pull --rebase` first.
  If that conflicts, stop and report.

### 2. Security scan (gate, before any push)

Scan two things: every file that would be committed, and every commit that is
not on the remote yet (`git log -p origin/BRANCH..HEAD`, or the whole history
when the remote is empty). Use `gitleaks` if it is installed; otherwise search
with Grep and `git log -p -G`.

**Blockers. Stop and do not push if any of these turn up:**

- Private keys (`-----BEGIN ... PRIVATE KEY-----`), `.pem`, `.key`, `.p12`, `.pfx`, `id_rsa*`
- Cloud and service credentials: `AKIA`/`ASIA` AWS keys, `ghp_` / `github_pat_` /
  `gho_` tokens, `xox[abprs]-` Slack tokens, `AIza` Google keys, `sk_live_` /
  `rk_live_` Stripe keys, `sk-ant-` / `sk-` API keys, JWTs, connection strings
  with a password in them
- `.env` files, `credentials.json`, `secrets.*`, service-account JSON, kubeconfig,
  `.npmrc` / `.pypirc` with a token, database dumps
- Any `password`, `secret`, `token`, `api_key` assignment whose value looks real
  rather than a placeholder

**Needs a yes from the user before pushing:**

- Personal email addresses, phone numbers, national ID numbers, home addresses
  (for example a real address in a form endpoint or config constant)
- Internal hostnames, private IP addresses, internal URLs
- Names, logos or data of a real company or real people in something described
  as a demo or as fictitious
- Files over 50 MB, or build output and dependency folders that should be ignored

Then:

- Make sure `.gitignore` exists and covers what this project needs kept out
  (`.env*`, key files, `node_modules/`, build output, OS and editor files). Add
  missing entries; never remove existing ones.
- Report findings as `file:line` with the value redacted. Never print a secret.
- For a blocker in the working tree: stop, say what to remove or move to an
  environment variable or GitHub secret.
- For a blocker already in history: stop. Do not rewrite history or force-push
  unless the user asks for exactly that. If it has already been pushed, say the
  credential must be rotated.
- If the scan is clean, say so in one line and continue.

### 3. Work out what kind of project this is

- **Static site**: an `index.html` at the root or in `docs/`, `public/` or `site/`,
  with no build step. The site is those files as they are.
- **Built site**: a `package.json` (or similar) with a build script that produces
  `dist/`, `build/`, `out/` or `_site/`.
- **No web output**: a library, CLI or service. Set up CI only, skip the Pages
  steps, and say so in the final report.

### 4. Turn on GitHub Pages

- Use GitHub Actions as the Pages source:
  `gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow`.
  If Pages already exists (HTTP 409), switch it with `-X PUT` instead.
- If GitHub refuses because the repo is still empty, do this step straight after
  the first push and then start the workflow by hand with `gh workflow run`.
- If the repo is private, stop and ask first: the published site is public even
  when the repo is not, and private-repo Pages needs a paid plan.
- Read the address from `gh api repos/OWNER/REPO/pages --jq .html_url`. Use that
  value everywhere below; do not guess it, because custom domains and
  `OWNER.github.io` repos differ from the usual pattern.

### 5. README

Create `README.md`, or update the one that exists. Read the project first and
describe what is actually there.

- Keep anything the user wrote. Edit sections in place; do not replace the file.
- Cover: what the project is in one or two sentences, the live link (from
  step 4), how to run it locally, how to configure it (name the real settings
  and where they live), how it is deployed, and known limits.
- State only what the code does. No invented features, badges for things that
  do not exist, or placeholder sections.
- Add the workflow status badge once the workflow file exists.
- Leave room for the screenshot under the live link. Step 9 captures it.

### 6. CI/CD workflow

Create or update `.github/workflows/deploy.yml`. If a workflow that builds or
deploys already exists, edit it rather than adding a second one.

- Triggers: `push` to the default branch, `pull_request`, and `workflow_dispatch`.
- `check` job, on every trigger: check out with full history, run a secret scan
  (gitleaks), then the project's real checks. For a built site that is install,
  lint, test and build, using whichever of those scripts exist. For a static site,
  confirm the entry page exists and that every local file it references exists.
- `deploy` job: needs `check`, runs only on the default branch and never on pull
  requests. Uses `actions/configure-pages`, `actions/upload-pages-artifact` and
  `actions/deploy-pages`, with the `github-pages` environment.
- Upload only the site. For a static site, copy the site files into `_site/` and
  upload that folder, so the README, `.claude/`, workflow files and anything
  else in the repo are not served. For a built site, upload the build output.
- Permissions: `contents: read` at the top level; `pages: write` and
  `id-token: write` on the deploy job only.
- Add `concurrency: { group: pages, cancel-in-progress: false }` so two deploys
  never overlap.
- Pin each action to its current major version. Look it up
  (`gh api repos/actions/checkout/releases/latest --jq .tag_name`) rather than
  relying on memory.
- Never put a secret in the workflow file. Reference `${{ secrets.NAME }}` and
  tell the user which secrets to add.

### 7. Commit and push

- Stage the specific files you mean to publish. Do not use `git add -A` blindly;
  look at `git status` and leave out anything unexpected.
- Re-run the step 2 scan on the staged diff (`git diff --cached`). The README and
  workflow were written after the first scan.
- Commit with a message that says what changed. Follow the repo's existing
  commit style if it has one.
- Push the current branch with `git push -u origin BRANCH`. Never force-push and
  never use `--no-verify`.
- If the current branch is not the default branch, push it anyway, say that
  Pages only updates once it is merged, and offer to open a pull request.

### 8. Check the deployment

- Watch the run: `gh run watch` on the newest run for this workflow.
- If a job fails, read its log (`gh run view --log-failed`), fix the cause, and
  push again. Stop after two failed attempts and report the error as it is.
- When the deploy job is green, confirm Pages reports a built site:
  `gh api repos/OWNER/REPO/pages --jq '{status, html_url}'`.

### 9. Screenshot for the README

Capture what a visitor sees and show it near the top of the README.

- Use the Playwright MCP tools (`mcp__playwright__browser_resize`,
  `mcp__playwright__browser_navigate`, `mcp__playwright__browser_take_screenshot`).
  Set the window to 1440 by 900, open the page, wait until its content has
  rendered, and take a full-page PNG.
- Capture the live Pages address from step 4 once the deploy in step 8 is green.
- If the live site is not up (Pages not enabled, deploy failed), capture the
  local copy instead and say so in the report. Serve the site folder on
  `localhost` first (for example `python3 -m http.server`), because Playwright
  MCP blocks `file://` addresses by default. Stop the server afterwards.
- If the Playwright MCP tools are not connected in this session, use the
  Playwright library if it is already installed. Otherwise skip this step and
  report it. Do not install packages or browsers to get around it.
- Capture the page as it first loads. Do not type into forms or sign in, and
  look at the image before using it: it must not show personal data, tokens,
  or anything from a signed-in account.
- Save it as `docs/screenshot.png`, replacing the old one. If `docs/` is the
  folder being published as the site, use `.github/screenshot.png` instead so
  the image is not served.
- Reference it once in the README, directly under the live link, with alt text
  that describes the picture: `![...](docs/screenshot.png)`. Update the existing
  line rather than adding a second image.
- If the image changed (`git status --short`), commit it with the README and
  push. That push starts another deploy; there is no need to capture again
  after it.

### 10. About section

- Description: one plain sentence saying what the project is, 120 characters or
  fewer. Keep an existing description unless it is empty or wrong.
- Website: the Pages address from step 4.
- Topics: three to six that match the real stack and subject.

```
gh api -X PATCH repos/OWNER/REPO -f description="..." -f homepage="PAGES_URL"
gh api -X PUT repos/OWNER/REPO/topics -f "names[]=a" -f "names[]=b" -f "names[]=c"
```

The topics call replaces the whole list, so include any existing topics worth
keeping. Then read it back with
`gh api repos/OWNER/REPO --jq '{description, homepage, topics}'` and check it took.

### 11. Report

Finish with a short summary:

- Repo link, branch and commit pushed
- Live Pages link and whether the last deploy succeeded
- Security scan result: clean, or what was found and what was done about it
- What was created or changed: README, screenshot (and whether it shows the
  live site or the local copy), workflow, `.gitignore`, About section
- Anything skipped or still needing the user (a secret to add, a credential to
  rotate, a setting only they can change)

## Rules for the whole run

- If a step cannot be done from here (no permission, `gh` not signed in, a setting
  that needs the web UI), do not work around it. Finish the other steps and list
  it in the report with the exact manual action.
- Never force-push, rewrite history, delete branches, change repo visibility or
  disable a protection rule unless the user asks for that specifically.
- Report what happened, including failures. Do not say a step succeeded unless
  you saw it succeed.
