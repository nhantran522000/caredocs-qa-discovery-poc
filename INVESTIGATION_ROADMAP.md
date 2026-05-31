# QA Discovery PoC — Production Debugging Roadmap

**Status:** 30-day failure analysis complete. Root cause isolated to **platform environmental + model context issues**. Moving to systematic fix cycle.

**Goal:** Restore Wolfpack production run to completion within 5–10 min, < 50K tokens per route.

---

## Current Situation

| Aspect | Local | Wolfpack |
|--------|-------|----------|
| Precision/Recall | 4/4 ✅ | Unknown ❌ |
| Route latency | 30–60 sec | 5–12+ min |
| Tokens/route | 10–15K | 50–540K |
| Reliability | Stable ✅ | Variable ❌ |
| Blocker | None | MCP hangs + context blow-up |

---

## Phase 1: Isolate the Bottleneck (THIS WEEK)

### 1a. Deploy debug task and run manually
- **Artifact:** `wolfpack/task-discovery-debug.md`
- **What:** Test Login page only. Measure timing + tokens per step.
- **Expected:** Complete in < 5 min, < 30K tokens. Clear step-by-step report.
- **If timeout/bloat:** We've isolated whether it's MCP, model, or script logic.

### 1b. Compare model performance on same task
Run the debug task with three models:
- **Kimi K2.5** (current — OpenRouter, £0.08/run)
- **Claude Sonnet 4.6** (Anthropic, proven stable)
- **Claude Opus 4.8** (if budget allows; heavyweight)

| Model | Kimi | Sonnet | Opus |
|-------|------|--------|------|
| Capability | Moderate | High | Highest |
| Cost/run (estimate) | £0.08 | £0.30 | £1.20 |
| Wolfpack timeout risk | Medium | Low | Very Low |
| Recommendation | Drop if Sonnet is stable | Try this | Fallback |

### 1c. Verify v3 inlined prompt is deployed
- Check the actual Wolfpack task's Prompt field
- Should be the v3 content (no `get_skill`, no `get_wiki_page`)
- If not, update it

### 1d. Add MCP-level diagnostics
Modify the debug task to log:
```
[MCP] Calling list_work_items...
[MCP] → Response received in Xs (status: ok/timeout/error)
[MCP] Calling create_work_item...
[MCP] → Response received in Xs
```

This tells us if the hang is at MCP call-time or elsewhere.

---

## Phase 2: Apply Targeted Fixes (WEEKS 2–3)

**Based on Phase 1 findings, choose one:**

### Path A: Model swap (if Sonnet is stable)
- **Change:** Switch from Kimi K2.5 → Claude Sonnet 4.6
- **Cost:** ~4× per run (acceptable for production)
- **Risk:** Low (Sonnet is proven in other Wolfpack pipelines)
- **Timeline:** 1 day
- **Success rate:** 70% (fixes context blow-up if model was the issue)

### Path B: Split the loop (if Wolfpack MCP is the blocker)
- **Idea:** Instead of one Wolfpack task discovering + creating cards, split into:
  1. **Discover** — Bash + Playwright only (no MCP calls, local Git baselines)
  2. **Create cards** — Bash + Work Items MCP (reads discovered changes from /tmp)
- **Benefit:** Isolates MCP call volume, forces explicit batching
- **Cost:** Two task runs instead of one (but much faster each)
- **Timeline:** 3–5 days
- **Success rate:** 90% (fixes MCP latency if that's the issue)

### Path C: Simplify the prompt (if context is growing)
- **Idea:** Remove the discovery loop logic, make it a one-route-per-prompt task
  - Task 1: discover index.html
  - Task 2: discover dashboard.html
  - ...and so on (6 tasks instead of 1 smart loop)
- **Benefit:** Eliminates model state bloat, super-simple prompts
- **Cost:** 6× task runs (but each trivial)
- **Timeline:** 2 days
- **Success rate:** 95% (bulletproof, but operational overhead)

---

## Phase 3: Validate at Scale (WEEKS 4–5)

Once a single route works reliably:

1. **Re-enable 6-route loop** (or use 6 tasks, depending on Path)
2. **Run end-to-end:** Initialize baselines, inject v2 changes, detect them
3. **Measure:** Precision/recall against changeset-v2/CHANGES.md
4. **Expected:** 4/4 precision/recall (same as local), 100% completion rate

---

## Fallback Options

If all else fails:

### Option 1: Use local test runner as the source of truth
- Keep Wolfpack disabled; run `snapshot.mjs` on a schedule (local CI/CD)
- Commit baselines + detected changes to a branch
- Humans review PRs instead of Wolfpack cards

### Option 2: Investigate Wolfpack container limits
- Ask platform team: "Why do MCP calls hang in this container?"
- Check container resource allocation (CPU, memory, network)
- May require platform-side fixes

---

## Next Action

**Today:**
1. Apply the debug task to Wolfpack (copy-paste `task-discovery-debug.md` into a new task)
2. Run it manually (no schedule)
3. Record: tokens used, time taken, any errors/hangs
4. Report findings

**If debug task completes in < 5 min:**
→ Move to Phase 1b (model comparison)

**If debug task times out or balloons:**
→ Check exact failure point (browser? MCP? model spinning?)
→ Decide on Path A/B/C

---

## Repository State

- ✅ Baselines committed (v1 ground truth)
- ✅ v3 inlined prompt ready (minimal MCP)
- ✅ Local snapshot tooling proven (4/4 precision/recall)
- ⏳ Wolfpack deployment TBD (debug task → full v3 loop)

---

## Contacts

- **Wolfpack Platform Issues:** Platform team
- **MCP Timeout Investigation:** Platform team (container resource allocation)
- **Model Performance Questions:** Anthropic Support (if using Claude models) / OpenRouter Support (Kimi)
