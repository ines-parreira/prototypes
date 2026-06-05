# /qa-editor — Guidance & Ticket Editor QA Runner

Fetch the latest test spec from Notion, run a manual browser QA session against the flywheel-test environment, and produce a final test report.

## Usage

```
/qa-editor [options]
```

## Options

- `--guidance-only` — Run only the Guidance Editor test cases (skip ticket editor)
- `--ticket-only` — Run only the Ticket Reply Editor test cases (skip guidance editor)
- `--tc <numbers>` — Run specific TCs only, e.g. `--tc TC-12,TC-37,TC-40`
- `--skip-notion` — Skip fetching the spec; use the cached TC list from the last run
- `--url <url>` — Override the default guidance editor URL

## Instructions

When the user runs this command, invoke the `editor-qa` skill. Follow its workflow exactly:

### Step 1: Load browser tools

Use ToolSearch to load all required Chrome MCP tools before calling any of them:

```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__get_screenshot,mcp__claude-in-chrome__shortcuts_execute,mcp__claude-in-chrome__find,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__computer
```

### Step 2: Get tab context

Call `tabs_context_mcp`. If no flywheel-test or Notion tabs exist, create them.

### Step 3: Fetch spec from Notion

Unless `--skip-notion` is passed, navigate to:
`https://www.notion.so/gorgias/Guidance-Editor-Behaviour-Spec-Browser-Test-Checklist-3101ae2178f580af89caf3d215e57e2e`

Use `get_page_text` to read all test cases. Parse the TC list before starting any browser testing.

If `--tc` is specified, filter to only those TCs.

### Step 4: Run tests

Follow the `editor-qa` skill workflow for each TC:
- Guidance editor tests first (unless `--ticket-only`)
- Ticket editor tests second (unless `--guidance-only`)

For each TC:
1. Perform the steps described in the spec
2. Collect evidence (JS inspection + screenshot)
3. Record PASS / FAIL / PARTIAL / SKIP with a brief note

### Step 5: Output the report

Print the full structured report as described in the `editor-qa` skill.
The report must appear in the conversation — do not save it to a file unless the user asks.

Format:

```markdown
## QA Test Report — Guidance Editor & Ticket Reply Editor
**Branch:** ...
**Date:** ...

### Summary table
### Per-TC results table
### Bug findings (for each FAIL)
### Not tested list
```

## Examples

```
/qa-editor
```
Runs all TCs against both editors.

```
/qa-editor --guidance-only
```
Runs only guidance editor TCs.

```
/qa-editor --tc TC-12,TC-37,TC-40,TC-43,TC-44
```
Runs only the five specified TCs — useful for regression-checking a specific bug fix.

```
/qa-editor --ticket-only
```
Runs only TC-41 through the last ticket-editor TC in the spec.
