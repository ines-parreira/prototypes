# Tabs

Navigation component for organizing content into multiple panels with tab-based switching.

## Import

```typescript
import { TabItem, TabList, TabPanel, Tabs } from '@gorgias/axiom'
```

## Props

### TabsProps

```typescript
type TabsProps = {
    // Required
    children: ReactNode // TabList and TabPanel components

    // Selection (controlled/uncontrolled)
    defaultSelectedItem?: string // Initial selected tab (uncontrolled)
    selectedItem?: string // Controlled selected tab
    onSelectionChange?: (item: Key) => void // Selection change callback
}
```

### TabItemProps

```typescript
type TabItemProps = {
    // Required
    id: string // Unique identifier for the tab
    children: ReactNode // Tab label content

    // Slots
    leadingSlot?: IconName | ReactNode // Content before label
    trailingSlot?: IconName | ReactNode // Content after label

    // State
    isDisabled?: boolean // Whether tab is disabled
}
```

### TabPanelProps

```typescript
type TabPanelProps = {
    // Required
    id: string // Must match TabItem id
    children: ReactNode // Panel content
}
```

## Usage

### Basic Tabs

```typescript
<Tabs>
  <TabList>
    <TabItem id="overview">Overview</TabItem>
    <TabItem id="settings">Settings</TabItem>
    <TabItem id="help">Help</TabItem>
  </TabList>

  <TabPanel id="overview">
    <Text>Overview content</Text>
  </TabPanel>
  <TabPanel id="settings">
    <Text>Settings content</Text>
  </TabPanel>
  <TabPanel id="help">
    <Text>Help content</Text>
  </TabPanel>
</Tabs>
```

### With Icons

```typescript
<Tabs>
  <TabList>
    <TabItem id="inbox" leadingSlot="mail">
      Inbox
    </TabItem>
    <TabItem id="sent" leadingSlot="send">
      Sent
    </TabItem>
    <TabItem id="drafts" leadingSlot="file-document">
      Drafts
    </TabItem>
  </TabList>

  <TabPanel id="inbox">
    <InboxContent />
  </TabPanel>
  <TabPanel id="sent">
    <SentContent />
  </TabPanel>
  <TabPanel id="drafts">
    <DraftsContent />
  </TabPanel>
</Tabs>
```

### With Trailing Slots (Counts)

```typescript
<Tabs>
  <TabList>
    <TabItem
      id="unread"
      leadingSlot="mail"
      trailingSlot={<Quantity quantity={15} isActive />}
    >
      Unread
    </TabItem>
    <TabItem
      id="flagged"
      leadingSlot="nav-flag"
      trailingSlot={<Quantity quantity={3} />}
    >
      Flagged
    </TabItem>
    <TabItem id="all" leadingSlot="inbox">
      All
    </TabItem>
  </TabList>

  <TabPanel id="unread">
    <UnreadMessages />
  </TabPanel>
  <TabPanel id="flagged">
    <FlaggedMessages />
  </TabPanel>
  <TabPanel id="all">
    <AllMessages />
  </TabPanel>
</Tabs>
```

### With Default Selection (Uncontrolled)

```typescript
<Tabs defaultSelectedItem="settings">
  <TabList>
    <TabItem id="overview">Overview</TabItem>
    <TabItem id="settings">Settings</TabItem>
    <TabItem id="help">Help</TabItem>
  </TabList>

  <TabPanel id="overview">
    <OverviewContent />
  </TabPanel>
  <TabPanel id="settings">
    <SettingsContent />
  </TabPanel>
  <TabPanel id="help">
    <HelpContent />
  </TabPanel>
</Tabs>
```

### Controlled Tabs

```typescript
function ControlledTabs() {
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <Tabs
      selectedItem={selectedTab}
      onSelectionChange={(key) => setSelectedTab(key.toString())}
    >
      <TabList>
        <TabItem id="overview">Overview</TabItem>
        <TabItem id="settings">Settings</TabItem>
        <TabItem id="help">Help</TabItem>
      </TabList>

      <TabPanel id="overview">
        <OverviewContent />
      </TabPanel>
      <TabPanel id="settings">
        <SettingsContent />
      </TabPanel>
      <TabPanel id="help">
        <HelpContent />
      </TabPanel>
    </Tabs>
  )
}
```

### Disabled Tabs

```typescript
<Tabs>
  <TabList>
    <TabItem id="available">Available</TabItem>
    <TabItem id="coming-soon" isDisabled>
      Coming Soon
    </TabItem>
    <TabItem id="beta">Beta</TabItem>
  </TabList>

  <TabPanel id="available">
    <AvailableFeatures />
  </TabPanel>
  <TabPanel id="coming-soon">
    <ComingSoonFeatures />
  </TabPanel>
  <TabPanel id="beta">
    <BetaFeatures />
  </TabPanel>
</Tabs>
```

### With Selection Callback

```typescript
function TabsWithCallback() {
  const handleTabChange = (key) => {
    console.log('Selected tab:', key)
    // Track analytics, update URL, etc.
  }

  return (
    <Tabs onSelectionChange={handleTabChange}>
      <TabList>
        <TabItem id="dashboard">Dashboard</TabItem>
        <TabItem id="reports">Reports</TabItem>
        <TabItem id="settings">Settings</TabItem>
      </TabList>

      <TabPanel id="dashboard">
        <DashboardContent />
      </TabPanel>
      <TabPanel id="reports">
        <ReportsContent />
      </TabPanel>
      <TabPanel id="settings">
        <SettingsContent />
      </TabPanel>
    </Tabs>
  )
}
```

## Common Patterns

### Page Navigation

```typescript
function PageTabs() {
  return (
    <Tabs defaultSelectedItem="tickets">
      <TabList>
        <TabItem id="tickets" leadingSlot="inbox">
          Tickets
        </TabItem>
        <TabItem id="customers" leadingSlot="users">
          Customers
        </TabItem>
        <TabItem id="analytics" leadingSlot="chart-bar-vertical">
          Analytics
        </TabItem>
      </TabList>

      <TabPanel id="tickets">
        <TicketsPage />
      </TabPanel>
      <TabPanel id="customers">
        <CustomersPage />
      </TabPanel>
      <TabPanel id="analytics">
        <AnalyticsPage />
      </TabPanel>
    </Tabs>
  )
}
```

### With Dynamic Counts

```typescript
function MessageTabs({ unreadCount, flaggedCount }) {
  return (
    <Tabs>
      <TabList>
        <TabItem
          id="all"
          leadingSlot="inbox"
        >
          All
        </TabItem>
        <TabItem
          id="unread"
          leadingSlot="mail"
          trailingSlot={
            unreadCount > 0 && (
              <Quantity quantity={unreadCount} isActive />
            )
          }
        >
          Unread
        </TabItem>
        <TabItem
          id="flagged"
          leadingSlot="nav-flag"
          trailingSlot={
            flaggedCount > 0 && (
              <Quantity quantity={flaggedCount} />
            )
          }
        >
          Flagged
        </TabItem>
      </TabList>

      <TabPanel id="all">
        <AllMessages />
      </TabPanel>
      <TabPanel id="unread">
        <UnreadMessages />
      </TabPanel>
      <TabPanel id="flagged">
        <FlaggedMessages />
      </TabPanel>
    </Tabs>
  )
}
```

### Settings Sections

```typescript
function SettingsTabs() {
  return (
    <Tabs defaultSelectedItem="general">
      <TabList>
        <TabItem id="general" leadingSlot="settings">
          General
        </TabItem>
        <TabItem id="notifications" leadingSlot="bell">
          Notifications
        </TabItem>
        <TabItem id="security" leadingSlot="check-shield">
          Security
        </TabItem>
        <TabItem id="billing" leadingSlot="credit-card">
          Billing
        </TabItem>
      </TabList>

      <TabPanel id="general">
        <GeneralSettings />
      </TabPanel>
      <TabPanel id="notifications">
        <NotificationSettings />
      </TabPanel>
      <TabPanel id="security">
        <SecuritySettings />
      </TabPanel>
      <TabPanel id="billing">
        <BillingSettings />
      </TabPanel>
    </Tabs>
  )
}
```

### URL-Synced Tabs

```typescript
function URLSyncedTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTab = searchParams.get('tab') || 'overview'

  const handleTabChange = (key) => {
    setSearchParams({ tab: key.toString() })
  }

  return (
    <Tabs
      selectedItem={selectedTab}
      onSelectionChange={handleTabChange}
    >
      <TabList>
        <TabItem id="overview">Overview</TabItem>
        <TabItem id="details">Details</TabItem>
        <TabItem id="history">History</TabItem>
      </TabList>

      <TabPanel id="overview">
        <OverviewContent />
      </TabPanel>
      <TabPanel id="details">
        <DetailsContent />
      </TabPanel>
      <TabPanel id="history">
        <HistoryContent />
      </TabPanel>
    </Tabs>
  )
}
```

### Conditional Tab Rendering

```typescript
function ConditionalTabs({ hasAccess }) {
  return (
    <Tabs>
      <TabList>
        <TabItem id="public">Public</TabItem>
        <TabItem id="shared">Shared</TabItem>
        {hasAccess && (
          <TabItem id="private" leadingSlot="lock">
            Private
          </TabItem>
        )}
      </TabList>

      <TabPanel id="public">
        <PublicContent />
      </TabPanel>
      <TabPanel id="shared">
        <SharedContent />
      </TabPanel>
      {hasAccess && (
        <TabPanel id="private">
          <PrivateContent />
        </TabPanel>
      )}
    </Tabs>
  )
}
```

### With Loading States

```typescript
function TabsWithLoading() {
  const [selectedTab, setSelectedTab] = useState('data')
  const { data, isLoading } = useQuery(['tab-data', selectedTab])

  return (
    <Tabs
      selectedItem={selectedTab}
      onSelectionChange={(key) => setSelectedTab(key.toString())}
    >
      <TabList>
        <TabItem id="data">Data</TabItem>
        <TabItem id="charts">Charts</TabItem>
        <TabItem id="export">Export</TabItem>
      </TabList>

      <TabPanel id="data">
        {isLoading ? <Skeleton count={5} /> : <DataTable data={data} />}
      </TabPanel>
      <TabPanel id="charts">
        {isLoading ? <Skeleton height={300} /> : <Charts data={data} />}
      </TabPanel>
      <TabPanel id="export">
        <ExportOptions data={data} />
      </TabPanel>
    </Tabs>
  )
}
```

## Visual Design

Tabs has:

- Horizontal tab list with inline tab items
- Active tab indicator (underline or background)
- Hover states for interactive tabs
- Disabled state with reduced opacity
- Icons and trailing slots aligned with text
- Panel content area below tab list
- Smooth transitions between panels

## Related Components

- **TabList**: Container for tab items
- **TabItem**: Individual tab button
- **TabPanel**: Content panel for each tab
- **Button**: For alternative navigation patterns
- **Breadcrumbs**: For hierarchical navigation

## Testing Queries

```typescript
// Query tabs by role
const tabs = screen.getAllByRole('tab')
expect(tabs).toHaveLength(3)

// Query specific tab
const overviewTab = screen.getByRole('tab', { name: 'Overview' })
const settingsTab = screen.getByRole('tab', { name: 'Settings' })
expect(overviewTab).toBeInTheDocument()

// Query tab with icon
const inboxTab = screen.getByRole('tab', { name: 'Inbox' })
expect(inboxTab).toBeInTheDocument()

// Query tabpanel
const panel = screen.getByRole('tabpanel')
expect(panel).toBeInTheDocument()

// Check selected state
expect(overviewTab).toHaveAttribute('aria-selected', 'true')
expect(settingsTab).toHaveAttribute('aria-selected', 'false')

// Check disabled state
const comingSoonTab = screen.getByRole('tab', { name: 'Coming Soon' })
expect(comingSoonTab).toHaveAttribute('aria-disabled', 'true')

// Interact with tabs
await user.click(settingsTab)
expect(onSelectionChange).toHaveBeenCalledWith('settings')

// Keyboard navigation
await user.keyboard('{tab}') // Focus first tab
await user.keyboard('{arrowright}') // Move to next tab
await user.keyboard('{enter}') // Activate tab

// Query icons in tabs
screen.getByRole('img', { name: 'mail' })
screen.getByRole('img', { name: 'settings' })

// Query panel content
screen.getByText('Overview content')
screen.getByText('Settings content')
```
