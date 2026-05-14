# Side Panel — AI Agent Actions V2

This directory hosts the building blocks for the **AI Agent Actions V2 side panel** — the right-hand surface where users browse the action library, configure an action, and inspect its performance.

The folder is organized around the panel's UX zones plus a couple of cross-cutting buckets:

```
sidePanel/
├── shell/         # Frame: rail, header, scrollable body, footer
├── library/       # Browse / search apps and actions
├── actionForm/    # Configure an action (name, store, steps, conditions…)
├── performance/   # Inspect KPIs and recent tickets for an action
├── shared/        # Reusable primitives (icons, badges, tooltips, highlighter)
├── types.ts       # Cross-cutting types (modes, statuses, providers, …)
└── index.ts       # Public barrel — re-exports shared + types
```

Each component lives in its own folder with the `.tsx` source, `.less` styles, an `index.ts` barrel, and a `.spec.tsx` test where relevant.

---

## `shell/` — Panel chrome

The structural pieces every variant of the side panel composes.

### `SidePanelShell`

The outer frame. Renders a vertical **rail** of icon buttons on the right and a collapsible **panel section** on the left. Owns:

- Open/collapse toggle (`isOpen`, `onToggleOpen`)
- Active mode (`mode`, `onModeChange`, `railItems` of `SidePanelRailItem`)
- An `OverlayStateProvider` so popovers inside the panel share open state
- Accessibility plumbing: `aria-pressed` on the active rail item, `aria-labelledby` on the section, `aria-orientation="vertical"` on the rail

### `PanelHeader`

Title + optional description + optional back link. Used at the top of any panel mode. Exposes `titleId` so callers can wire `aria-labelledby` from `SidePanelShell`.

### `ScrollableBody`

A `<div>` wrapper that scrolls vertically. Accepts `padding: 'md' | 'none'` and an extra `className`. This is the only place inside the panel that scrolls — header/footer stay pinned.

### `PanelFooter`

Sticky footer with **Dismiss** (tertiary) and **Submit** (primary) buttons. Supports `submitLabel`, `dismissLabel`, `isSubmitting` (drives loading state and disables Dismiss), and `isSubmitDisabled`.

---

## `library/` — Browse & search

Used when `mode === 'library'`: pick an app, pick an action, drop it into the editor.

### `LibrarySearchInput`

A thin wrapper around axiom's `SearchField`. Adds default `placeholder`, `aria-label`, optional autofocus, and an `onClear` that resets the value via `onChange('')`.

### `SectionHeader`

Section label with optional pluralized result count ("1 result" / "N results"). Used above the "Connected", "Suggested", "Other" lists.

### `AppRow`

A row representing a connectable app/provider. Shows the provider icon, name (with highlighted search match), and action count. The trailing slot is:

- `<StatusBadge status="configured" />` when already configured, or
- A **Connect** button (`onConnect`) when not yet connected.

The whole row is clickable (`role="button"`, keyboard-activated via Enter/Space).

### `ActionRow`

A row for a single action inside an app. Renders an optional drag handle (`grip` icon), provider icon, action name with highlighted match, and a provider sub-label. Trailing slot can be a tertiary `Edit` icon button. Click/Enter/Space fires `onInsert`. Supports native `draggable` for drag-and-drop into the editor.

### `LibraryEmptyState`

"No actions found" panel with a heading, description, and **Request app** button (defaults to `https://link.gorgias.com/actions`, opens in a new tab).

---

## `actionForm/` — Configure a single action

Used when authoring/editing an action. Sub-pieces fall into three groups: container/footer, individual fields, and the steps + conditions builders.

### Container

#### `ActionFormSidePanel`

Axiom `SidePanel` (`SidePanelSize.Md`, `isDismissable={false}`) with an `OverlayHeader` (title + description), a vertical `OverlayContent` for children, and the shared `PanelFooter`. This is the "orchestrator" component for the form mode — it forwards every footer prop (`onDismiss`, `onSubmit`, `submitLabel`, etc.).

### Individual fields

#### `ActionNameField`

Required `TextField` for the action's name. Supports `error`, `caption`, `autoFocus`, and `onBlur` for validation flows.

#### `StoreSelector`

`SelectField` of `Store`s. Each item renders the store name with a small `ProviderIcon` (leading slot). Auto-selects the single store when `stores.length === 1` and nothing is selected yet.

#### `StoreReadonly`

Disabled `TextField` showing the store name with the store icon in the trailing slot. Used when the store can't be changed (e.g., predetermined by context).

#### `ConfirmationToggle`

Axiom `ToggleField` for "Customer confirmation". Default copy nudges users to enable it for irreversible actions.

### Steps builder

#### `AddStepDropdown`

Trigger button that opens a `Popover` menu of apps grouped into **Connected**, **Relevant for you**, **Other apps**. Selecting an app drills into a second view that lists its `ActionOption`s. Optional **Build advanced action** entry at the top (`onBuildAdvanced`) opens the advanced flow. Tracks its own `isOpen` and `activeApp` state.

#### `StepRow`

A configured step inside the form: shows the app cell (icon + provider name), action cell (action name), and a destructive trash icon button. Renders `validationError` underneath in error color when set.

### Conditions builder (`ConditionBuilder/`)

Self-contained subsystem for "Run this action only when…" rules. Has its own `types.ts` (a stricter superset of the top-level types: `LogicOperator` includes `'none'`, `Condition.value` is always `string`).

#### `ConditionBuilder`

The orchestrator. Renders the mode dropdown; if mode ≠ `none`, renders the list of `ConditionRow`s with `LogicConnector`s between them, plus the **Add condition** entry point. Owns the picker's open state, generates blank conditions (`makeBlankCondition` using `Date.now()` + random id), and exposes a hidden `aria-live="polite"` region announcing the current condition count.

#### `ConditionModeDropdown`

Three-option `Select`: "No conditions required" (`none`), "All conditions are met" (`all`), "Any condition is met" (`any`).

#### `ConditionRow`

A single condition: field label (read-only `Text`) → operator `Select` → value control → destructive remove button. The value control adapts to the field type:

- `valueOptions` provided → `Select` of options
- `selectedField.type === 'date'` → axiom `DatePicker` (uses `@internationalized/date`'s `parseAbsoluteToLocal`, persists as ISO string)
- otherwise → plain `TextField`

#### `AddConditionLink`

Tertiary button with a leading `add` icon. The visual trigger for opening `ConditionVariablePicker`.

#### `ConditionVariablePicker`

Popover-backed field picker. Two modes:

- **Categorized** — when `categories` are provided and no search is active, shows a category list; clicking drills into that category's fields.
- **Flat** — when searching, when a category is active, or when there are no categories. Search filters by case-insensitive `label.includes`.

Resets search + active category whenever `isOpen` flips to `false`. Honors `maxFlatResults` for the uncategorized top-level list (kept bounded for the playground; production has no cap).

#### `LogicConnector`

Tiny visual element rendering "AND" (for `all`) or "OR" (for `any`) between rows. Decorative (`aria-hidden`).

### Confirmations

#### `SaveChangesConfirmModal` (top-level)

"Save changes?" modal with three actions: **Discard Changes** (tertiary/destructive), **Back To Editing** (secondary), **Save Changes** (primary). Used when the user tries to leave the form with unsaved edits.

#### `AdvancedActionConfirmModal`

Modal that pitches the **Advanced View** before converting. Lists three benefits with check icons, an optional `learnMoreHref` link, and a warning `Banner` explaining the conversion is irreversible. CTAs: **Back To Editing** (secondary) and **Convert To Advanced View** (primary/destructive).

#### `PanelBanner`

In-panel banner with three variants (`info`, `warning`, `error`), each mapped to a leading icon (`info`, `warning-triangle`, `error-octagon`). Renders a title, message, optional link (auto-`external-link` slot + `target="_blank"` when `href` is set), and an optional close button. Body uses `role="status"` + `aria-live="polite"`.

### Advanced editor (`AdvancedStepsBuilder/`)

#### `AdvancedStepsBuilder`

Bridges the V2 side panel into the **legacy WorkflowVisualBuilder**. Wraps the inner builder in three providers (`StoreTrackstarProvider`, `GuidanceReferenceProvider`, `StoreAppsProvider`), bootstraps an empty `WorkflowConfiguration` via `WorkflowConfigurationBuilder`, transforms it into a visual-builder graph, runs `useVisualBuilderGraphReducer`, and feeds the context with `useVisualBuilder`. The default canvas view shows the builder in mini-map-hidden, disabled mode with an **edit pencil** that swaps in `FullScreenEditor`.

##### `FullScreenEditor` (internal)

Renders the workflow builder full-screen via `createPortal` into a sibling `<div data-name="advanced-editor-portal">` attached to `<body>`. Two notable concerns it handles:

- **Theme class**: the portal root must carry `axiom` so primary/tertiary buttons style correctly outside the React tree.
- **react-aria interference**: axiom's `SidePanel` calls `ariaHideOutside`, which sets `inert` / `aria-hidden="true"` on all `<body>` children (including new popover/tooltip portals). The component installs a `MutationObserver` chain that strips those attributes on the portal root and on any newly added sibling overlays — and a second observer that re-strips them if react-aria reapplies them.
- **Escape**: captured at the document level to prevent it from bubbling up and closing the host `SidePanel`. Instead it toggles the local "Save changes?" confirmation.

##### `SaveChangesConfirmModal` (inside `AdvancedStepsBuilder/`)

Variant of the top-level save modal scoped to the advanced editor. Uses `ModalSize.Sm`, three buttons (**Cancel**, **Discard changes**, **Save changes**), and copy specific to the advanced action context. Not exported via the public barrel — internal to `AdvancedStepsBuilder`.

---

## `performance/` — Metrics & recent tickets

Used when `mode === 'performance'`.

### `MetricCard`

Axiom `Card` for a single KPI. Shows label, large value, optional `MetricTrend` ({ value, direction }) with a `trending-up` / `trending-down` / `arrow-right` icon, optional inline `ProgressBar` (0–100), and an optional `Tag` chip for the related action (with provider icon in the leading slot). Renders a `Skeleton` placeholder when `isLoading`.

### `TicketRow`

Compact `Card` representing a recent ticket: icon, title (ellipsized), date, a status `Tag` (`automated` → green, `handover` → orange), and a pluralized message count. Wraps itself in a `<button>` when `onClick` is provided, otherwise renders as a static card.

---

## `shared/` — Reusable primitives

Exported through the top-level `index.ts`.

### `ProviderIcon`

`<img>` tile for app/provider icons. Sizes `'sm' | 'md'`, variants `'tile'` (default — boxed background) and `'plain'` (no box). Marks itself decorative (`aria-hidden`, `role="presentation"`) when no `alt` is supplied.

### `StatusBadge`

Axiom `Tag` mapped from `StatusKind` (`configured`, `enabled`, `connect`, `disabled`, `failing`) to a color (`green`, `grey`, `red`) and a default label. Label can be overridden.

### `HighlightedText`

Returns a string with `<mark>` highlights around case-insensitive matches of `query`. No-ops when `query` is empty or whitespace-only. Used by `AppRow` and `ActionRow` to highlight search hits.

### `Tooltip` (module)

Re-exports axiom's `Tooltip` and `TooltipContent`. Adds a convenience component:

#### `InfoTooltip`

Wraps an `info` icon (size `xs`) as the tooltip trigger. Accepts `content` as a string (rendered via `TooltipContent`'s `caption`) or as a React node (rendered as `TooltipContent`'s children). `ariaLabel` defaults to "More information".

---

## `types.ts` — Shared types

| Type                                                                                                     | Purpose                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `SidePanelMode`                                                                                          | `'library' \| 'performance'` — drives the rail's active item                              |
| `StatusKind`                                                                                             | `'configured' \| 'connect' \| 'enabled' \| 'disabled' \| 'failing'` — fuels `StatusBadge` |
| `ProviderRef`                                                                                            | Provider icon descriptor (URL+alt or providerId)                                          |
| `AppOption` / `ActionOption`                                                                             | App + its actions, used by `AddStepDropdown`                                              |
| `Store`                                                                                                  | `{ id, name, iconUrl? }` for the store selector                                           |
| `LogicOperator`                                                                                          | `'all' \| 'any' \| 'none'`                                                                |
| `ConditionFieldType`                                                                                     | `'string' \| 'number' \| 'date' \| 'boolean' \| 'enum'`                                   |
| `ConditionField` / `ConditionFieldCategory` / `ConditionOperator` / `ConditionValueOption` / `Condition` | Inputs to `ConditionBuilder`                                                              |
| `BannerLink` / `BannerVariant`                                                                           | Inputs to `PanelBanner`                                                                   |
| `MetricTrend`                                                                                            | `{ value: string, direction: 'up' \| 'down' \| 'flat' }` for `MetricCard`                 |
| `TicketStatus` / `TicketEntry`                                                                           | Inputs to `TicketRow`                                                                     |
| `SidePanelChildren`                                                                                      | `{ children: ReactNode }` helper                                                          |

> Note: `actionForm/ConditionBuilder/types.ts` redefines `LogicOperator`, `Condition`, etc. for the builder's stricter contract (e.g. `Condition.value` is always `string` there). When wiring the builder into a screen, convert between the two as needed.

---

## How the pieces fit together

A typical authoring flow composes the pieces like this:

```tsx
<SidePanelShell mode={mode} isOpen={isOpen} onToggleOpen={…} onModeChange={…} railItems={…}>
  {mode === 'library' && (
    <>
      <PanelHeader title="Add action" />
      <ScrollableBody>
        <LibrarySearchInput value={q} onChange={setQ} />
        <SectionHeader label="Connected" resultCount={apps.length} />
        {apps.map(app => <AppRow key={app.id} {...app} searchQuery={q} />)}
        {actions.map(a => <ActionRow key={a.id} {...a} searchQuery={q} />)}
        {empty && <LibraryEmptyState />}
      </ScrollableBody>
    </>
  )}

  {mode === 'form' && (
    <ActionFormSidePanel isOpen onOpenChange={…} title="Configure action" onSubmit={save} onDismiss={cancel}>
      <ActionNameField value={name} onChange={setName} />
      <StoreSelector stores={stores} selectedStoreId={storeId} onSelect={setStoreId} />
      <AddStepDropdown {…} onSelectAction={addStep} onBuildAdvanced={openAdvanced} />
      {steps.map((s, i) => <StepRow key={s.id} index={i} {…s} onDelete={…} />)}
      <ConditionBuilder conditions={conds} logicOperator={op} fields={fields} getOperators={…} onConditionsChange={…} onLogicChange={…} />
      <ConfirmationToggle isEnabled={requiresConfirm} onToggle={setRequiresConfirm} />
    </ActionFormSidePanel>
  )}

  {mode === 'performance' && (
    <ScrollableBody>
      <MetricCard label="Resolution rate" value="82%" trend={{ value: '+4%', direction: 'up' }} />
      {tickets.map(t => <TicketRow key={t.id} {…t} onClick={…} />)}
    </ScrollableBody>
  )}
</SidePanelShell>
```

Confirmation modals (`SaveChangesConfirmModal`, `AdvancedActionConfirmModal`) are mounted at the same level as the panel and gated by local state. The `AdvancedStepsBuilder` is rendered inside the form when the user opts into the advanced view.
