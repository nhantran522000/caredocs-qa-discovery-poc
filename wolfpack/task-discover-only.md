# TASK — Discover Routes (Task 1 of 2-part Path B split)

**Purpose:** Browse all 6 routes of the QA discovery site, diff against baselines, write results to `~/qa-discovery-results.json` for Task 2 to consume. **Zero MCP calls** — only Bash + Playwright.

**Name:** `Discover Routes`

**Prompt:**

````text
You are discovering page changes in the QA discovery PoC. This is TASK 1 of a 2-part split:
- **This task (1):** Browse pages, diff, write JSON results to home directory.
- **Task 2 (later):** Read JSON, call Wolfpack MCP to create cards.

This split eliminates MCP hangs from the discovery phase entirely.

PROJECT & SITE
- repo_url (PUBLIC): https://github.com/nhantran522000/qa-discovery-poc.git
- site: /tmp/qa-site/docs/ (files served via file://)
- routes (IN ORDER):
    1. index.html        | Login         | authentication-access
    2. dashboard.html    | Dashboard     | dashboard-homepage
    3. profile.html      | Profile       | user-profile
    4. settings.html     | Settings      | settings
    5. residents.html    | Residents     | residents-register
    6. activity-log.html | Activity Log  | activity-log
- project_slug: agent-incubator

STEPS (NO MCP CALLS)

0. **Setup** (Bash):
   ```bash
   rm -rf /tmp/qa-site
   git clone --depth 1 https://github.com/nhantran522000/qa-discovery-poc.git /tmp/qa-site
   cd /tmp/qa-site && git log --oneline -1
   ls -la baselines/
   ```

1. **Initialize results file** (Bash):
   ```bash
   echo "[]" > ~/qa-discovery-results.json
   ```

2. **Process EACH route** (loop in order above; for each, do steps A–D):

   **A. Navigate & snapshot** (Playwright):
      - browser_navigate to file:///tmp/qa-site/docs/<path>
      - wait for page to load
      - browser_snapshot → get aria YAML tree (ONE snapshot only, no JS)

   **B. Load baseline** (Bash):
      - Read /tmp/qa-site/baselines/<slug>.aria.yaml
      - Semantically compare: are the aria trees identical?
        * Identical → status: `UNCHANGED`
        * Different → status: `CHANGED`, capture diff summary
        * File missing → status: `NEW`

   **C. Draft card content** (if NEW or CHANGED):
      - What changed: plain-English description of the semantic diff
      - Proposed Gherkin: 2–3 scenarios in fenced ```gherkin``` block
      - candidate-snapshot: FULL current aria YAML as multiline string

   **D. Append to JSON** (Bash):
      ```bash
      # Append entry to ~/qa-discovery-results.json
      # Schema: { slug, feature, name, status, diff_summary, current_aria, proposed_gherkin }
      ```

3. **Final report** (Bash):
   ```bash
   # Output summary: each route, its status, diff summary if changed
   # Example:
   # ✓ index (authentication-access):        CHANGED – button 'Submit' → 'Sign In'
   # ✓ dashboard (dashboard-homepage):       CHANGED – new nav link 'Activity Log'
   # ✓ profile (user-profile):               CHANGED – new field 'Date of birth'
   # ✓ settings (settings):                  UNCHANGED
   # ✓ residents (residents-register):       UNCHANGED
   # ✓ activity-log (activity-log):          NEW – entirely new page
   ```

HARD RULES (prevent token bloat)
- NO `get_skill`, NO `get_wiki_page`, NO MCP calls whatsoever
- NEVER use browser_run_code_unsafe, browser_evaluate, or JavaScript
- ONE browser_snapshot per route (no scrolling, no JS, no multiple snapshots)
- If browser_navigate fails after ≤2 retries → status: `not-deployed`, record error, continue
- If a baseline file is missing → status: `NEW` (not an error)
- Write ~/qa-discovery-results.json even on partial failure (partial results are useful)
- Total budget: a few minutes and well under 50K tokens (zero MCP calls = zero hangs)

OUTPUT
- ~/qa-discovery-results.json — JSON array of discovery results
- Print summary report to stdout showing each route + status
- Instruct user: "Task 1 done. Run Task 2 (Create Discovery Cards) to create work items."
````

**Model:** Kimi K2.5

**Tools:** Bash ✓, Playwright MCP ✓. Disable: Skills, Wiki, Work Items, Agent, Organisations, Diagnostics, Edit, Download, Glob, Grep, Sourceraph, View, Write.

**Scheduling:** Manual only (Task 2 depends on this completing).

---

## Expected Behavior

- ✅ Runs < 5 min, uses < 50K tokens (no MCP hangs)
- ✅ Writes `~/qa-discovery-results.json` with all 6 routes (even unchanged ones)
- ✅ JSON includes full `current_aria` and `proposed_gherkin` for all routes (for Task 2 to draft cards)
- ✅ Prints summary: each route + status + diff
- ✅ On completion: "Task 1 done. Run Task 2 next."

If baseline file missing (activity-log.html): status is `NEW` (not an error).
If browser fails: status is `not-deployed` or `site-unreachable`, continue to next route.
