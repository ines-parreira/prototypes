---
name: add-ai-agent-drilldown
description: Add a drilldown modal to an AI Agent TrendCard (Shopping Assistant, All Agents, or Support Agent). Creates the V2 query factory from the backend-validated curl, registers the metric constant, wires the domain config, updates helper routing, and writes tests. Use after the TrendCard itself is merged and the backend curl is available.
argument-hint: <metric-name> (e.g. "Automated Interactions", "CSAT", "Handover Interactions")
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, AskUserQuestion
context: fork
---

# add-ai-agent-drilldown

Add a drilldown modal to an AI Agent TrendCard. When a user clicks the metric value, a modal opens showing the individual tickets behind the number.

---

## Prerequisites — Verify Before Writing Any Code

Stop and ask the user if any of these are missing:

1. **A validated curl from the backend team** — The curl defines the cube name, `metric_name`, dimensions, and `enrichment_fields`. Without it, no factory can be created correctly.
    - Ask the user to paste the curl JSON directly, or share the Linear ticket / Slack thread where the backend team posted it.
    - If no curl is available yet, stop and ask the user to request it from the backend team before proceeding.

2. **Which TrendCard** — Identify the exact string value used as the chart enum (e.g. `'shopping_assistant_success_rate_card'`). The drilldown metric constant value must match this string exactly.

3. **Which tab(s)** — Shopping Assistant / All Agents / Support Agent / all tabs.

> ⚠️ **NEVER use old `aiSalesAgent` query factories.** They force a `storeIntegrationId` filter the new dashboard does not set → data discrepancy with the TrendCard value. All new AI Agent drilldowns must use V2 cubes from the backend-provided curl.

---

## Step 1 — Read the Architecture (in parallel)

Before writing any code, read all of these files simultaneously:

| File                                                                                              | Purpose                                                                                                   |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics.ts`           | Leaf constants file — current registered metric names                                                     |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig.tsx`           | Domain config — current hook pattern and `metricsConfig`                                                  |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/tests/AiAgentDrillDownConfig.spec.ts` | Test pattern to follow                                                                                    |
| `apps/helpdesk/src/domains/reporting/models/queryFactories/ai-sales-agent/metrics.ts` (tail)      | Where the new V2 factory will be added; see `successRateV2DrillDownQueryFactory` as the reference example |
| `apps/helpdesk/src/domains/reporting/pages/common/drill-down/helpers.ts` lines 108–440            | `getDrillDownQuery` switch — exhaustiveness stubs for AI Agent metrics live here                          |
| `apps/helpdesk/src/domains/reporting/pages/common/drill-down/helpers.ts` lines 718–740            | `isAiAgentMetric` guard and `getDrillDownMetricColumn` AI Agent branch                                    |
| Backend curl file for the scope                                                                   | Query shape, cube name, `metric_name`, `enrichment_fields`                                                |

Also note the current state of `AiAgentDrillDownConfig.tsx`:

- **Only one metric registered?** → `drillDownHook` hardcodes one factory. You will switch it to route via `getDrillDownQuery` when adding a second metric.
- **Multiple metrics already registered?** → `drillDownHook` already calls `getDrillDownQuery(metricData)`. Just add a new switch case and `metricsConfig` entry.

---

## Step 2 — Create the V2 Query Factory

### 2a. Parse the backend curl

From the curl JSON, extract:

- `cubeName`: the cube prefix used in `dimensions` and `filters` (e.g. `SuccessRate`, `AIAgentAutomatedInteractionsV2`)
- `metric_name`: the string value in the curl's `metric_name` field
- `dimensions`: all `"CubeName.fieldName"` entries
- `filters`: all filter objects with `member`, `operator`, `values`
- `enrichment_fields`: the array in the curl (e.g. `["Ticket.assignee_user_id", "Ticket.created_datetime", "Ticket.custom_fields"]`)

### 2b. Verify the cube exists

```bash
grep -rn "export.*<CubeName>Cube\|export.*<CubeName>Dimension\|export.*<CubeName>FilterMember" \
  apps/helpdesk/src/domains/reporting/models/cubes/ --include="*.ts" | head -5
```

If the cube types don't exist, stop and tell the user the cube types are missing — they must be added before the factory can be created.

### 2c. Add the factory to `metrics.ts`

**File:** `apps/helpdesk/src/domains/reporting/models/queryFactories/ai-sales-agent/metrics.ts`

Add at the end of the file. Use `successRateV2DrillDownQueryFactory` in the same file as the reference for the V2 pattern:

```typescript
export const <metricNameCamelCase>DrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<<CubeName>Cube> => ({
    measures: [],
    dimensions: [<CubeName>Dimension.TicketId],
    filters: [
        // paste filter objects from the backend curl, converting to TypeScript:
        // { member: CubeName.FilterMember, operator: ReportingFilterOperator.Equals, values: ['...'] },
        ...statsFiltersToReportingFilters(<cubeNameFiltersMembers>, filters),
    ],
    timezone,
    metricName: METRIC_NAMES.<METRIC_NAME_CONSTANT>,
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? { order: [[<CubeName>Dimension.TicketId, sorting]] }
        : { order: [] }),
})
```

**Where `METRIC_NAMES.<METRIC_NAME_CONSTANT>` comes from:**

Check `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts` for the constant matching the `metric_name` string from the backend curl. If it doesn't exist, add it:

```typescript
// In metricNames.ts — find the AI_SALES_AGENT drilldown entries and add nearby:
<SCREAMING_SNAKE_CASE>_DRILL_DOWN: '<metric_name from backend curl>',
```

### 2d. Add a test for the factory

**File:** `apps/helpdesk/src/domains/reporting/models/queryFactories/ai-sales-agent/tests/metrics.spec.ts`

Find the `describe` block for a similar drilldown factory (e.g. `successRateV2DrillDownQueryFactory`) and add a new `describe` block at the END of the file:

```typescript
describe('<metricNameCamelCase>DrillDownQueryFactory', () => {
    it('should return a query with the correct metric name and dimensions', () => {
        const filters = { period: { start_datetime: '2025-01-01T00:00:00.000', end_datetime: '2025-01-07T23:59:59.000' } }
        const result = <metricNameCamelCase>DrillDownQueryFactory(filters as StatsFilters, 'UTC')

        expect(result.metricName).toBe(METRIC_NAMES.<METRIC_NAME_CONSTANT>)
        expect(result.measures).toEqual([])
        expect(result.dimensions).toContain(<CubeName>Dimension.TicketId)
        expect(result.limit).toBe(DRILLDOWN_QUERY_LIMIT)
    })
})
```

---

## Step 3 — Register the Metric Constant

**File:** `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics.ts`

> ⚠️ **This file must stay at zero imports.** It is a leaf in the dependency graph. Adding any import creates a risk of circular dependencies. Never import from `pages/aiAgent/`, `domains/reporting/hooks/`, or any file that imports from `DrillDownTableConfig`.

Add a new entry to the `AiAgentDrillDownMetricName` object:

```typescript
export const AiAgentDrillDownMetricName = {
    ShoppingAssistantSuccessRateCard: 'shopping_assistant_success_rate_card',
    // Add your new entry below — the value MUST match the TrendCard's metricName exactly:
    <PascalCaseMetricName>Card: '<exact_chart_enum_string_value>',
} as const
```

**How to find the exact string value:**

- Open the TrendCard's report config file (e.g. `AnalyticsAiAgentShoppingAssistantReportConfig.ts`)
- Find the chart enum value for this card (e.g. `ShoppingAssistantXxxCard = 'shopping_assistant_xxx_card'`)
- That enum string is what you use here

---

## Step 4 — Wire into `AiAgentDrillDownConfig.tsx`

**File:** `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig.tsx`

### 4a. Import the new factory

```typescript
import { <metricNameCamelCase>DrillDownQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
```

### 4b. Update `drillDownHook`

**If this is the SECOND metric** (the hook currently hardcodes one factory):

Switch from hardcoded to routing:

```typescript
// Before (hardcoded):
const useAiAgentTicketDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        successRateV2DrillDownQueryFactory,
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )

// After (routed):
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'

const useAiAgentTicketDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )
```

**If this is the THIRD metric or later:** No change to `drillDownHook` — it already routes via `getDrillDownQuery`.

### 4c. Add the metric to `metricsConfig`

```typescript
metricsConfig: {
    [AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard]: {
        showMetric: false,
        domain: Domain.AiAgent,
    },
    // Add:
    [AiAgentDrillDownMetricName.<PascalCaseMetricName>Card]: {
        showMetric: false,  // true only if the modal should display a metric column
        domain: Domain.AiAgent,
    },
},
```

---

## Step 5 — Update `helpers.ts`

**File:** `apps/helpdesk/src/domains/reporting/pages/common/drill-down/helpers.ts`

### 5a. `getDrillDownQuery` — add the routing case

Find the existing AI Agent stub case (around line 424) and add a new case **below it**:

```typescript
// Existing stub:
case AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard:
    return successRateV2DrillDownQueryFactory

// Add below:
case AiAgentDrillDownMetricName.<PascalCaseMetricName>Card:
    return <metricNameCamelCase>DrillDownQueryFactory
```

Also add the import at the top of the file:

```typescript
import { <metricNameCamelCase>DrillDownQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
```

### 5b. `getDrillDownMetricColumn` — update the AI Agent format block

Find the `isAiAgentMetric` block (around line 896):

```typescript
} else if (isAiAgentMetric(metricData)) {
    metricTitle = metricData.title || ''
    metricValueFormat = 'decimal-to-percent'  // ← currently hardcoded to success rate format
}
```

**If your new metric uses a DIFFERENT format than `decimal-to-percent`**, add a specific check ABOVE the generic `isAiAgentMetric` block:

```typescript
// Add before the isAiAgentMetric block:
} else if (metricData.metricName === AiAgentDrillDownMetricName.<PascalCaseMetricName>Card) {
    metricTitle = metricData.title || ''
    metricValueFormat = '<correct-format>'  // e.g. 'decimal', 'percent', 'currency'
```

**If your new metric uses `decimal-to-percent`** (same as success rate), the existing `isAiAgentMetric` fallback already handles it correctly — no change needed here.

---

## Step 6 — Update Tests

### 6a. `AiAgentDrillDownConfig.spec.ts`

**File:** `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/tests/AiAgentDrillDownConfig.spec.ts`

If this is the second metric (you migrated `drillDownHook` to use `getDrillDownQuery`), update the existing test to assert that `getDrillDownQuery` is called correctly, not a hardcoded factory.

Add a new `it` block for the new metric:

```typescript
it('should call useEnrichedDrillDownData with the correct arguments for <PascalCaseMetricName>', () => {
    const metricData = {
        metricName: AiAgentDrillDownMetricName.<PascalCaseMetricName>Card,
        title: '<metric title>',
    } as DrillDownMetric

    renderHook(() => AiAgentDrillDownConfig.drillDownHook(metricData))

    expect(useEnrichedDrillDownData).toHaveBeenCalledWith(
        <metricNameCamelCase>DrillDownQueryFactory,
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )
})
```

### 6b. `helpers.spec.ts` — `getDrillDownQuery` test

**File:** `apps/helpdesk/src/domains/reporting/pages/common/drill-down/tests/helpers.spec.ts`

Find the `getDrillDownQuery` describe block and add a test:

```typescript
it('should return <metricNameCamelCase>DrillDownQueryFactory for <PascalCaseMetricName>Card', () => {
    const result = getDrillDownQuery({
        metricName: AiAgentDrillDownMetricName.<PascalCaseMetricName>Card,
    } as DrillDownMetric)

    expect(result).toBe(<metricNameCamelCase>DrillDownQueryFactory)
})
```

---

## Step 7 — Verify

Run all checks in this exact order. Do not declare done until every check is green.

### 7a. Pre-commit gate — frozen layer check

```bash
# MUST return zero matches. Any match means you touched a frozen V1 file.
git diff --name-only | grep "aiSalesAgent\|AiSalesAgent"
```

If any output appears, stop and verify you haven't modified old report behavior.

### 7b. Tests

```bash
pnpm test @repo/helpdesk "AiAgentDrillDownConfig|helpers.spec|metrics.spec"
```

100% coverage on new/changed code is required.

### 7c. TypeScript

```bash
pnpm typecheck @repo/helpdesk
```

### 7d. Lint — run on changed files only

```bash
npx oxlint \
  apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics.ts \
  apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig.tsx \
  apps/helpdesk/src/domains/reporting/pages/common/drill-down/helpers.ts \
  apps/helpdesk/src/domains/reporting/models/queryFactories/ai-sales-agent/metrics.ts
```

### 7e. Format

```bash
cd apps/helpdesk && pnpm format:fix && pnpm format:check
```

### 7f. Build

```bash
pnpm build
```

---

## Hard Rules

| Rule                                                                               | Why                                                                                                            |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Never import anything into `aiAgentDrillDownMetrics.ts`                            | It's a leaf file. Any import risks recreating the circular dependency chain.                                   |
| Never modify `pages/automate/aiSalesAgent/` or `domains/reporting/hooks/automate/` | These are frozen V1 layers for the old Shopping Assistant report. New AI Agent work is isolated in `aiAgent/`. |
| Always use the metric name string from the backend curl exactly                    | If `metric_name` doesn't match, the backend returns empty results.                                             |
| `metricName` in the constants must match the TrendCard's chart enum value exactly  | The drilldown is triggered by the TrendCard's `metricName` — the constant must be the same string.             |
| Add a test for every new exported function                                         | `metrics.ts` has `metrics.spec.ts`. Every new exported factory needs a test there.                             |

---

## Common Mistakes

| Mistake                                                                 | Symptom                                                                                      | Fix                                                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Using an old `aiSalesAgent` factory                                     | TrendCard shows X but drilldown shows different tickets (storeIntegrationId filter mismatch) | Create a new V2 factory from the backend curl                                                |
| `aiAgentDrillDownMetrics.ts` constant value doesn't match chart enum    | Clicking TrendCard opens no modal / wrong modal                                              | Match the string exactly to the chart enum value                                             |
| Added constant to leaf file but forgot `getDrillDownQuery` case         | TypeScript error: Type '...' is not assignable to... or runtime: wrong factory called        | Add the `case` in `getDrillDownQuery`                                                        |
| Forgot to migrate `drillDownHook` from hardcoded to `getDrillDownQuery` | New metric uses wrong factory (old hardcoded one)                                            | Replace hardcoded factory with `getDrillDownQuery(metricData)`                               |
| Added import to `aiAgentDrillDownMetrics.ts`                            | Circular import error at build time                                                          | Remove it — this file must have zero imports                                                 |
| Wrong `metricValueFormat` in `getDrillDownMetricColumn`                 | Metric column shows wrong number format in the modal                                         | Add a specific else-if block for the new metric above the generic `isAiAgentMetric` fallback |
| Forgot test for new factory in `metrics.spec.ts`                        | Codecov reports uncovered lines                                                              | Add `describe` block at end of `metrics.spec.ts`                                             |

---

## Reference Files

| File                                                                                              | Role                                                                  |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics.ts`           | Leaf constants — add new metric name here                             |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig.tsx`           | Domain config — drillDownHook + metricsConfig                         |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiAgent/tests/AiAgentDrillDownConfig.spec.ts` | Config spec — add test per metric                                     |
| `apps/helpdesk/src/domains/reporting/models/queryFactories/ai-sales-agent/metrics.ts`             | Query factories — add new factory at end                              |
| `apps/helpdesk/src/domains/reporting/models/queryFactories/ai-sales-agent/tests/metrics.spec.ts`  | Factory tests — add describe block at end                             |
| `apps/helpdesk/src/domains/reporting/pages/common/drill-down/helpers.ts`                          | `getDrillDownQuery` switch + `getDrillDownMetricColumn`               |
| `apps/helpdesk/src/domains/reporting/pages/common/drill-down/tests/helpers.spec.ts`               | Helper tests                                                          |
| `apps/helpdesk/src/domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentDrillDownConfig.tsx` | Canonical reference for how a mature multi-metric domain config looks |
| Backend curl (pasted by user or from Linear/Slack)                                                | Query shape, cube name, `metric_name`, `enrichment_fields`            |

---

## Naming Conventions

| Concept                            | Convention                            | Example                                      |
| ---------------------------------- | ------------------------------------- | -------------------------------------------- |
| `AiAgentDrillDownMetricName` key   | PascalCase + "Card" suffix            | `AutomatedInteractionsCard`                  |
| `AiAgentDrillDownMetricName` value | Exact chart enum string               | `'automated_interactions_card'`              |
| Query factory function name        | camelCase + "DrillDownQueryFactory"   | `automatedInteractionsDrillDownQueryFactory` |
| `METRIC_NAMES` constant key        | SCREAMING_SNAKE_CASE + "\_DRILL_DOWN" | `AI_AGENT_AUTOMATED_INTERACTIONS_DRILL_DOWN` |

---

## Architecture Diagram

```
User clicks TrendCard metric value
    ↓
useDrillDownModalTrigger dispatches Redux action with { metricName, domain: Domain.AiAgent }
    ↓
DrillDownTableConfig.ts looks up DomainsConfig[Domain.AiAgent]
    ↓
AiAgentDrillDownConfig.drillDownHook(metricData) is called
    ↓
getDrillDownQuery(metricData) routes by metricName → returns the V2 factory
    ↓
useEnrichedDrillDownData(factory, metricData, ...) fires the query
    ↓
Backend returns tickets for that metric → modal renders TicketDrillDownTableContent

Key files and their dependency direction:
aiAgentDrillDownMetrics.ts    [ZERO imports — leaf]
        ↑ imported by
AiAgentDrillDownConfig.tsx    → imports leaf + getDrillDownQuery + V2 factories
helpers.ts                    → imports leaf (for getDrillDownQuery switch + isAiAgentMetric)
DrillDownTableConfig.ts       → registers AiAgentDrillDownConfig under Domain.AiAgent
metrics.ts                    → V2 query factories (one per metric)
```
