---
name: linear-project-update
description: Scans all Linear projects for a given date range and generates a structured status report — milestone completion rates, done/in-progress/blocked tickets, ETA risk signals, ticket details grouped by frontend and backend, and a weekly standup digest (what was done, what's left, blockers, scope changes, timeline changes).
argument-hint: '[date-range] [audience: em|pm|fe|be] (e.g. "this week em", "March 10 to today fe")'
allowed-tools: AskUserQuestion, Bash, Read, Write, Edit, Glob, Grep
---

# linear-project-update

Generates a clean, audience-aware weekly project status report — including a
standup-format digest — by querying Linear's GraphQL API directly and saving
a Markdown file to `~/Desktop/linear-updates/`.

No MCP server required. Uses `LINEAR_API_KEY` from the environment.

---

## Step 0 — Verify API key

The key must be set in `~/.claude/settings.json` → `env.LINEAR_API_KEY`.

```bash
echo "Key set: ${LINEAR_API_KEY:0:10}..."
```

If the output shows `Key set: ...` (blank after colon), the key is missing.
Tell the user:

> "Please add LINEAR_API_KEY to `~/.claude/settings.json` under the `env` block,
> then restart Claude Code."

```json
{
    "env": {
        "LINEAR_API_KEY": "lin_api_YOUR_KEY_HERE"
    }
}
```

---

## Step 1 — Gather inputs

**Defaults (apply silently when not specified):**
- **Project**: "AI Agent Analytics Revamp"
- **Date range**: current week (Monday to today)
- **Audience**: em

If the user's message contains no inputs at all, apply all three defaults and
proceed directly to Step 2 — do NOT ask.

If the user specifies some but not all inputs, fill in the missing ones with the
defaults above — do NOT ask for the missing ones.

Only use AskUserQuestion if the user explicitly asks for a project you cannot
find in Linear (see Step 2 fallback).

---

## Step 2 — Fetch all team projects and find the requested one

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ projects(first: 50) { nodes { id name description state targetDate updatedAt } } }"
  }'
```

Find the project whose `name` matches (case-insensitive, partial match OK) the
name the user provided in Step 1.

If **no match** is found, list all available project names and ask the user to
pick one using AskUserQuestion. Do not proceed until a match is confirmed.

If **multiple matches** are found, show them and ask the user to confirm which
one. Do not guess.

For the matched project, collect:

- `id` (needed for issue queries — must be a full UUID)
- `name`
- `state` (on track / at risk / off track / paused / completed)
- `targetDate`
- `description` (first line only)

---

## Step 3 — Fetch issues for the matched project within the date range

```bash
START_DATE="2026-03-01T00:00:00.000Z"  # replace with actual ISO start
END_DATE="2026-03-19T23:59:59.000Z"    # replace with actual ISO end
PROJECT_ID="<full-uuid-project-id>"

curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"{ issues(filter: { project: { id: { eq: \\\"$PROJECT_ID\\\" } }, updatedAt: { gte: \\\"$START_DATE\\\", lte: \\\"$END_DATE\\\" } }, first: 100) { nodes { id title state { name } assignee { name } priority labels { nodes { name } } description updatedAt } } }\"
  }"
```

For each issue, collect:

- `title`
- `state.name` → categorise as:
    - Done / Completed / Merged → ✅ Done
    - In Progress / In Review → 🔄 In Progress
    - Blocked / On Hold → 🚧 Blocked
    - Todo / Backlog → skip unless explicitly requested
- `assignee.name`
- `priority` (0 = No priority, 1 = Urgent, 2 = High, 3 = Medium, 4 = Low)
- `labels.nodes[*].name` → FE vs BE grouping (see below)
- `description` first line (em/pm = first 80 chars; fe/be = first 150 chars)

**Risk calculation per project:**

```
total     = count of all non-backlog issues in project
done      = count with state Done/Completed
pct       = done / total * 100
days_left = (targetDate - today) in calendar days

if days_left < 7  and pct < 70 → 🔴 At Risk
if days_left < 14 and pct < 50 → 🟡 Watch
else                            → ✅ On Track
```

**FE vs BE grouping:**

- Label contains "frontend" / "fe" / "FE" → **Frontend**
- Label contains "backend" / "be" / "BE" → **Backend**
- No label → infer from assignee's known team, otherwise **General**

---

## Step 4 — Build the standup digest

Before the full project breakdown, generate the standup section.
This answers the team's 5 standard questions. Answer "N/A" if no data
supports a non-trivial answer.

```markdown
## 📋 Weekly Standup Digest

**Period:** {start_date} – {end_date}

### ✅ What was done this week

- [Bullet per Done ticket — title + assignee. Group by project. Max 10 bullets per project.]

### 🔄 What is left to do

- [Bullet per In Progress ticket + any assigned Todo tickets. Include priority if High/Urgent.]

### 🚧 Blockers encountered this week

- [Each blocked ticket + reason from description. If none: N/A]

### 📐 Important decisions that led to a scope change

- [Any ticket whose description or label indicates scope change, cancellation, or de-scoping. If none: N/A]

### 📅 Changes to the initial timelines

- [Any project where targetDate changed, milestone slipped, or tickets were deprioritised. If none: N/A]
```

---

## Step 5 — Build the full project report

Append the full breakdown after the standup digest.

```markdown
# Linear Project Update

**Period:** {start_date} – {end_date}
**Generated:** {today's date}
**Audience:** {em | pm | fe | be}

---

## 📋 Weekly Standup Digest

[... standup section from Step 4 ...]

---

## Summary

| Project      | Status   | Progress    | Deadline | Risk        |
| ------------ | -------- | ----------- | -------- | ----------- |
| Project Name | 🟡 Watch | 42% (15/36) | Mar 24   | 5 days left |

---

## [Project Name]

**Status:** 🟡 Watch / ✅ On Track / 🔴 At Risk
**Deadline:** [date] ([N] days remaining)
**Overall progress:** X% (N done / M total)

#### ✅ Done ([N])

**Frontend**

- [Ticket title] — @assignee
  [One-line description]

**Backend**

- [Ticket title] — @assignee
  [One-line description]

**General**

- [Ticket title] — @assignee

#### 🔄 In Progress ([N])

**Frontend**

- [Ticket title] — @assignee (priority: high)

**Backend**

- [Ticket title] — @assignee

#### 🚧 Blocked ([N])

- [Ticket title] — @assignee
  Blocker: [reason if available in ticket description]

---

## Blockers & Risks (All Projects)

- **[Project]** — [blocker description] — Owner: @assignee
```

**Audience rules:**

| Section                 | EM           | PM           | FE      | BE      |
| ----------------------- | ------------ | ------------ | ------- | ------- |
| Standup digest          | ✅ full      | ✅ full      | ✅ full | ✅ full |
| Summary table           | ✅           | ✅           | ✅      | ✅      |
| Milestone completion %  | ✅           | ✅           | ✅      | ✅      |
| Done ticket list        | ✅ brief     | ✅ brief     | ✅ full | ✅ full |
| In-progress ticket list | ✅           | ✅           | ✅ full | ✅ full |
| Assignees shown         | ✅           | ✅           | ✅      | ✅      |
| Blocked section         | ✅ prominent | ✅ prominent | FE only | BE only |
| Ticket descriptions     | summary only | summary only | full    | full    |

---

## Step 6 — Save the report

```bash
TODAY=$(date +%Y-%m-%d)
AUDIENCE="em"   # replace with actual audience value
mkdir -p ~/Desktop/linear-updates
# Write report content to ~/Desktop/linear-updates/${TODAY}-${AUDIENCE}.md
```

Save to: `~/Desktop/linear-updates/{TODAY}-{audience}.md`

---

## Step 7 — Confirm to the user

```
✅ Report saved to ~/Desktop/linear-updates/{filename}.md

Quick standup summary:
✅ Done this week: [N] tickets across [M] projects
🔄 In progress: [N] tickets
🚧 Blockers: [N] (or N/A)
📐 Scope changes: [summary or N/A]
📅 Timeline changes: [summary or N/A]

Project health:
- [Project 1]: 🔴 At Risk — X% done, N days to deadline
- [Project 2]: ✅ On Track — X% done

Open the file to see the full ticket breakdown.
```

---

## Important notes

- **Never fabricate ticket data.** Only report what Linear returns.
- **If a project returns no issues in the date range**, say so explicitly: "No tickets updated in this period."
- **Projects with no targetDate** → show "No deadline set" in the summary table.
- **Date range filter**: Applied to `updatedAt` — captures all tickets touched in the range (not just created).
- **Run one curl per project** — never batch all projects into one query.
- **Standup N/A rule**: If there is genuinely nothing to report for a standup question (e.g. no blocked tickets, no scope changes), answer "N/A" — do not invent content.
- **PROJECT_ID must be a full UUID** (e.g. `4297897f-2700-4f80-89a2-0ba55ae1bde1`). Short IDs cause `isUuid: eq must be a UUID` errors. Always fetch full IDs from the Step 2 projects query.
