# TASK — `Discover Login Page (Debug)`

**Purpose:** Minimal single-route test to isolate Wolfpack platform bottlenecks.

Only processes the Login page (index.html). Measures:
- Token usage per step
- Wall-clock time per MCP call
- Whether runs complete or timeout

**Name:** `Discover Login Page (Debug)`

**Prompt:**
```
You are debugging why the QA discovery PoC stalls on Wolfpack. This task processes EXACTLY
ONE page (Login) and measures timing. Do NOT call get_skill (it hangs here).

SETUP (Bash):
  rm -rf /tmp/qa-site
  git clone --depth 1 https://github.com/wolf-logic/qa-discovery-poc.git /tmp/qa-site
  cd /tmp/qa-site && git log --oneline -1 && ls -la baselines/index.aria.yaml

OBSERVE (Playwright):
  1. browser_navigate to file:///tmp/qa-site/docs/index.html
  2. browser_snapshot — get the aria YAML tree (ONE snapshot only, no JS)

COMPARE:
  3. Read /tmp/qa-site/baselines/index.aria.yaml (Bash: cat)
  4. Compare semantically: are the aria trees identical?
     - Identical → report "Login unchanged"
     - Different → report the diff and proceed to card creation

CARD (if different):
  5. Call list_work_items ONCE (project_slug: agent-incubator, open statuses)
  6. Check if a card for [authentication-access] already exists (title starts "[authentication-access]")
  7. If no card exists, call create_work_item:
     - project_slug: agent-incubator
     - title: "[authentication-access] Change detected: Login"
     - status: new ; priority: 2 ; (no category)
     - description (markdown):
       **What changed:** button "Submit" → "Sign In" (or whatever you find)
       **Proposed Gherkin:**
       ```gherkin
       Feature: Authentication

       Scenario: User can sign in with email and password
         When I press the "Sign In" button
       ```
       **Observed at:** file:///tmp/qa-site/docs/index.html

REPORT:
  - Total tokens used (check at end)
  - Time taken (from now)
  - Result: "Login unchanged" / "Card created: <id>" / "Error: <reason>"

HARD RULES (prevent timeouts):
  - NEVER loop or retry. If anything fails, STOP and report it.
  - NEVER use JavaScript (browser_evaluate, browser_run_code_unsafe).
  - Only 2 MCP calls: list_work_items + (optionally) create_work_item.
  - If any MCP call times out after 1 retry, STOP with "MCP timeout".
```

**Model:** Kimi K2.5 (keep the same as discovery task)

**Tools:** Bash, Playwright MCP, Work items. Disable the rest.

**Scheduling:** Manual run only (no automation).

---

## Expected Results

| Outcome | Interpretation |
|---------|-----------------|
| ✅ "Login unchanged" | Baselines are good. Move to Phase 2. |
| ✅ "Card created: ID" | Detection works. Check card accuracy. |
| ❌ "MCP timeout" | Platform MCP is unstable. Investigate container. |
| ❌ "Runs 15+ min, >50K tokens" | Model context blow-up. Try different model. |
| ❌ "Browser error: ERR_TUNNEL" | Egress issue. file:// setup failed. |

---

## Success Metrics

- Completes in < 5 minutes
- Uses < 50K tokens
- Produces a clear report showing each step's result
- If MCP hangs, logs the exact call and delay
