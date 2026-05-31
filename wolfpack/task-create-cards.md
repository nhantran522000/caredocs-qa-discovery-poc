# TASK — Create Discovery Cards (Task 2 of 2-part Path B split)

**Purpose:** Read `/tmp/qa-discovery-results.json` produced by Task 1, dedup against existing work items, and create discovery cards in Wolfpack for NEW and CHANGED routes.

**Name:** `Create Discovery Cards`

**Prompt:**

````text
You are the card-creation worker for the QA discovery PoC. This is TASK 2 of a 2-part split:
- **Task 1 (done):** Discovered page changes and wrote /tmp/qa-discovery-results.json
- **This task (2):** Read JSON, dedup, create Wolfpack cards.

PROJECT
- project_slug: agent-incubator
- Input file: /tmp/qa-discovery-results.json (from Task 1)

STEPS

0. **Prerequisite check** (Bash):
   ```bash
   if [ ! -f /tmp/qa-discovery-results.json ]; then
     echo "ERROR: /tmp/qa-discovery-results.json not found. Run Task 1 (Discover Routes) first."
     exit 1
   fi
   ```

1. **Read discovery results** (Bash):
   ```bash
   cat /tmp/qa-discovery-results.json | jq .
   ```

2. **Dedup** (Work Items MCP):
   Call `list_work_items` ONCE:
   - project_slug: agent-incubator
   - Filter for statuses: new, doing, blocked
   - A route is "covered" if any card title starts with `[<feature>] `
   - Skip UNCHANGED routes entirely (no card needed)

3. **Create cards for NEW and CHANGED routes** (Work Items MCP):
   For each route entry in the JSON with status NEW or CHANGED:
   
   - **Skip if already covered** (title already starts `[<feature>] `)
   
   - **Create card:**
     ```
     project_slug: agent-incubator
     title: "[<feature>] New feature: <name>" (NEW)
            or "[<feature>] Change detected: <name>" (CHANGED)
     status: new
     priority: 3 (NEW) or 2 (CHANGED)
     description (markdown):
       **What changed**
       <diff_summary from JSON>
       
       **Proposed Gherkin**
       <proposed_gherkin from JSON>
       
       **Observed at**
       file:///tmp/qa-site/docs/<path>
       
       ## candidate-snapshot
       ```yaml
       <current_aria from JSON (full YAML string)>
       ```
     ```

4. **Report results** (stdout):
   - Count of cards created
   - List of routes skipped (already covered or unchanged)
   - Any errors (timeouts, failures)

HARD RULES (prevent hangs)
- **Dedup once, create once per route** — at most 1 list_work_items call, 1 create_work_item call per NEW/CHANGED route
- If list_work_items hangs → retry ≤2x, then STOP with "transient-mcp-timeout"
- If create_work_item hangs → retry ≤2x, then STOP with "transient-mcp-timeout" (do NOT duplicate; next run retries)
- NEVER use Playwright in this task (no browser calls)
- NEVER use Bash to call `jq` in a loop — parse the JSON once and iterate programmatically

OUTPUT
- Cards created in project (visible in Agent Incubator work items)
- Stdout report: count + card IDs created, routes skipped
- On error: "transient-mcp-timeout" + which route failed

EXPECTED (v2 changeset validation)
- 4 cards should be created: Login (CHANGED), Dashboard (CHANGED), Profile (CHANGED), Activity Log (NEW)
- 2 routes skipped: Settings (UNCHANGED), Residents (UNCHANGED)
- 0 false positives
````

**Model:** Kimi K2.5

**Tools:** Bash ✓, Work Items MCP ✓. Disable: Skills, Wiki, Playwright, Agent, Organisations, Diagnostics, Edit, Download, Glob, Grep, Sourceraph, View, Write.

**Scheduling:** Manual only — run after Task 1 completes successfully.

---

## Expected Behavior

- ✅ Runs < 2 min, uses < 10K tokens (minimal MCP)
- ✅ Reads `/tmp/qa-discovery-results.json` (from Task 1)
- ✅ Creates 4 cards: Login, Dashboard, Profile, Activity Log (matching v2 changeset)
- ✅ Skips 2: Settings, Residents (unchanged)
- ✅ Cards include full candidate-snapshot for later approval/write-back
- ✅ Dedup check prevents duplicate cards
- ✅ On completion: "4 cards created. Phase 3 validation ready."

If `/tmp/qa-discovery-results.json` is missing: fail immediately with clear error message.
If an MCP call times out: stop, log which route failed, user can re-run Task 2 (results still in `/tmp`).
