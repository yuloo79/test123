#!/usr/bin/env node
// PostToolUse hook: after Claude edits index.html, confirm the IT Project Briefing
// reminder is still wired up. The popup itself runs in the browser (inline JS in
// index.html); this hook only guards it against being removed or broken by an edit.
//
// Exit 0: fine, or the edit was to some other file.
// Exit 2: something is missing; stderr is fed back to Claude so it can repair it.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

let input = {};
try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { /* run the check anyway */ }

const edited = String(input.tool_input?.file_path ?? "");
if (edited && !/(^|[\\/])index\.html$/.test(edited)) process.exit(0);

const file = join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), "index.html");
if (!existsSync(file)) process.exit(0);
const html = readFileSync(file, "utf8");

const missing = [];
const need = (ok, what) => { if (!ok) missing.push(what); };

need(/<dialog[^>]*id="briefing-popup"/.test(html), '<dialog id="briefing-popup"> markup');
need(/const BRIEFING = \{/.test(html), "the BRIEFING config constant");
need(/title:\s*"IT Project Briefing"/.test(html), 'title "IT Project Briefing"');
need(/venue:\s*"Town Hall Meeting Room"/.test(html), 'venue "Town Hall Meeting Room"');
need(/time:\s*"2:00 pm"/.test(html), 'time "2:00 pm"');
need(/date:\s*"\d{4}-\d{2}-\d{2}"/.test(html), "a YYYY-MM-DD date");
need(/delayMs:\s*15000\b/.test(html), "delayMs: 15000 (15 seconds)");
need(/setTimeout\(showBriefing,\s*BRIEFING\.delayMs\)/.test(html), "setTimeout(showBriefing, BRIEFING.delayMs)");
need(/\bsetUpBriefing\(\);/.test(html), "the setUpBriefing() call in init()");
need(/id="briefing-close"/.test(html) && /id="briefing-ok"/.test(html), "the Close and Got it buttons");

if (missing.length) {
  console.error("The IT Project Briefing popup in index.html is broken. Missing: " + missing.join("; ") +
    ". Restore it (see section 11b of the script and the BRIEFING constant).");
  process.exit(2);
}
