import { useMemo, useState } from 'react'
import {
    Button,
    ButtonGroup,
    ButtonGroupItem,
    Icon,
    ListItem,
    Menu,
    MenuItem,
    Modal,
    SearchField,
    SelectField,
    Tag,
    TabItem,
    TabList,
    Tabs,
    Text,
    TextField,
    toast,
    ToggleField,
} from '@gorgias/axiom'

import { PageHeader } from 'pages/common/components/PageHeader'

import css from './ScheduledRunsPage.less'

type Category = 'Automation' | 'Revenue' | 'Support'
type Delivery = 'slack' | 'email'
type RunStatus = 'delivered' | 'failed' | 'loading'

type Run = { id: number; date: string; status: RunStatus }

type Automation = {
    id: number
    title: string
    description: string
    category: Category
    schedule: string
    delivery: Delivery
    channel?: string
    emails?: string[]
    enabled: boolean
    failure?: string
    runs?: Run[]
}

type LibraryItem = {
    title: string
    category: Category
    description: string
}

// Map each category to a semantic Tag color.
const CATEGORY_COLOR: Record<Category, 'purple' | 'fuchsia' | 'orange'> = {
    Automation: 'purple',
    Revenue: 'fuchsia',
    Support: 'orange',
}

const INITIAL_AUTOMATIONS: Automation[] = [
    {
        id: 1,
        title: 'Automation rate report',
        description:
            'Automation % this period, the trend versus last period, and which intents are driving or dragging it.',
        category: 'Automation',
        schedule: 'Every Monday, 8:00 AM',
        delivery: 'slack',
        channel: 'cx-leadership',
        enabled: true,
    },
    {
        id: 2,
        title: 'Revenue impact report',
        description:
            'Revenue influenced by automation this period, broken down by the drivers behind the change.',
        category: 'Revenue',
        schedule: 'Every Monday, 8:00 AM',
        delivery: 'slack',
        channel: 'cx-executives',
        enabled: true,
        failure: "Couldn't post to #mkt-leadership. The channel was archived.",
        runs: [
            { id: 1, date: 'Jul 14, 8:00 AM', status: 'failed' },
            { id: 2, date: 'Jul 7, 8:00 AM', status: 'delivered' },
            { id: 3, date: 'Jun 30, 8:00 AM', status: 'delivered' },
        ],
    },
    {
        id: 3,
        title: 'Voice of customer report',
        description:
            'What customers are saying in their own words, grouped into the topics coming up most.',
        category: 'Support',
        schedule: 'Bi-weekly on Thursdays, 9:00 AM',
        delivery: 'email',
        emails: ['alma.lawson@gmail.com'],
        enabled: false,
    },
]

const LIBRARY: LibraryItem[] = [
    {
        title: 'Automation rate report',
        category: 'Automation',
        description:
            'Automation % this period, the trend versus last period, and which intents are driving or dragging it.',
    },
    {
        title: 'Revenue impact report',
        category: 'Revenue',
        description:
            'Revenue influenced by automation this period, broken down by the drivers behind the change.',
    },
    {
        title: 'CX insights report',
        category: 'Support',
        description:
            'Themes and sentiment surfaced across conversations this period, with emerging issues flagged early.',
    },
    {
        title: 'Automation opportunity analysis',
        category: 'Automation',
        description:
            "What's holding automation back from its next milestone, and what fixing it is worth.",
    },
    {
        title: 'Handover trend report',
        category: 'Automation',
        description:
            'Handover rate by topic, so you can see which intents still lean on a human.',
    },
    {
        title: 'Voice of customer report',
        category: 'Support',
        description:
            'What customers are saying in their own words, grouped into the topics coming up most.',
    },
]

const SLACK_CHANNELS = [
    'cx-leadership',
    'cx-executives',
    'mkt-leadership',
    'support-insights',
]

let nextId = 100

// Slack brand mark (not part of the icon set, so inlined at delivery-icon size).
function SlackIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M2.10098 6.31904C2.10098 6.89722 1.62867 7.36953 1.05049 7.36953C0.472314 7.36953 0 6.89722 0 6.31904C0 5.74087 0.472314 5.26855 1.05049 5.26855H2.10098V6.31904Z"
                fill="#E01E5A"
            />
            <path
                d="M2.63086 6.31904C2.63086 5.74087 3.10317 5.26855 3.68135 5.26855C4.25953 5.26855 4.73184 5.74087 4.73184 6.31904V8.94933C4.73184 9.52751 4.25953 9.99982 3.68135 9.99982C3.10317 9.99982 2.63086 9.52751 2.63086 8.94933V6.31904Z"
                fill="#E01E5A"
            />
            <path
                d="M3.68135 2.10098C3.10317 2.10098 2.63086 1.62866 2.63086 1.05049C2.63086 0.472312 3.10317 0 3.68135 0C4.25953 0 4.73184 0.472312 4.73184 1.05049V2.10098H3.68135Z"
                fill="#36C5F0"
            />
            <path
                d="M3.68079 2.63037C4.25897 2.63037 4.73128 3.10268 4.73128 3.68086C4.73128 4.25903 4.25897 4.73135 3.68079 4.73135H1.05049C0.472314 4.73135 0 4.25903 0 3.68086C0 3.10268 0.472314 2.63037 1.05049 2.63037H3.68079Z"
                fill="#36C5F0"
            />
            <path
                d="M7.89844 3.68086C7.89844 3.10268 8.37075 2.63037 8.94893 2.63037C9.52711 2.63037 9.99942 3.10268 9.99942 3.68086C9.99942 4.25903 9.52711 4.73135 8.94893 4.73135H7.89844V3.68086Z"
                fill="#2EB67D"
            />
            <path
                d="M7.37051 3.68078C7.37051 4.25895 6.8982 4.73126 6.32002 4.73126C5.74184 4.73126 5.26953 4.25895 5.26953 3.68078V1.05049C5.26953 0.472312 5.74184 0 6.32002 0C6.8982 0 7.37051 0.472312 7.37051 1.05049V3.68078Z"
                fill="#2EB67D"
            />
            <path
                d="M6.32002 7.89893C6.8982 7.89893 7.37051 8.37124 7.37051 8.94941C7.37051 9.52759 6.8982 9.9999 6.32002 9.9999C5.74184 9.9999 5.26953 9.52759 5.26953 8.94941V7.89893H6.32002Z"
                fill="#ECB22E"
            />
            <path
                d="M6.32002 7.36953C5.74184 7.36953 5.26953 6.89722 5.26953 6.31904C5.26953 5.74087 5.74184 5.26855 6.32002 5.26855H8.95032C9.5285 5.26855 10.0008 5.74087 10.0008 6.31904C10.0008 6.89722 9.5285 7.36953 8.95032 7.36953H6.32002Z"
                fill="#ECB22E"
            />
        </svg>
    )
}

export function ScheduledRunsPage() {
    const [tab, setTab] = useState('my')
    const [automations, setAutomations] =
        useState<Automation[]>(INITIAL_AUTOMATIONS)
    const [search, setSearch] = useState('')
    const [dialog, setDialog] = useState<{
        open: boolean
        editingId?: number
        template?: LibraryItem
    }>({ open: false })

    const toggleEnabled = (id: number) =>
        setAutomations((list) =>
            list.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        )

    const pauseAutomation = (id: number) => {
        setAutomations((list) =>
            list.map((a) => (a.id === id ? { ...a, enabled: false } : a)),
        )
        toast.success('Run paused.')
    }

    const deleteAutomation = (id: number) => {
        setAutomations((list) => list.filter((a) => a.id !== id))
        toast.success('Scheduled run deleted.')
    }

    const submitAutomation = (values: FormValues, editingId?: number) => {
        if (editingId) {
            setAutomations((list) =>
                list.map((a) =>
                    a.id === editingId
                        ? { ...a, ...toAutomation(values, a) }
                        : a,
                ),
            )
            toast.success('Changes saved.')
        } else {
            setAutomations((list) => [
                ...list,
                { id: nextId++, ...toAutomation(values) },
            ])
            toast.success('Scheduled run created.')
            setTab('my')
        }
        setDialog({ open: false })
    }

    const editing = automations.find((a) => a.id === dialog.editingId)

    const filteredLibrary = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return LIBRARY
        return LIBRARY.filter((item) =>
            [item.title, item.category, item.description]
                .join(' ')
                .toLowerCase()
                .includes(q),
        )
    }, [search])

    return (
        <div className={css.page}>
            <div className={css.surface}>
                <PageHeader title="Scheduled runs" className={css.pageHeader}>
                    <Menu
                        aria-label="Create new run"
                        placement="bottom right"
                        trigger={
                            <Button
                                variant="primary"
                                trailingSlot={
                                    <Icon name="arrow-chevron-down" size="sm" />
                                }
                            >
                                Create new run
                            </Button>
                        }
                        onAction={(key) => {
                            if (key === 'gaia') setDialog({ open: true })
                            if (key === 'library') setTab('library')
                        }}
                    >
                        <MenuItem
                            id="gaia"
                            leadingSlot="ai"
                            label="Create with Gaia"
                        />
                        <MenuItem
                            id="library"
                            leadingSlot="book-open"
                            label="Choose from library"
                        />
                    </Menu>
                </PageHeader>

                <div className={css.tabsBar}>
                    <Tabs
                        selectedItem={tab}
                        onSelectionChange={(k) => setTab(String(k))}
                    >
                        <TabList>
                            <TabItem id="my" label="My automations" />
                            <TabItem id="library" label="Library" />
                        </TabList>
                    </Tabs>
                </div>

                <div className={css.scroll}>
                    <div className={css.content}>
                        {tab === 'my' ? (
                            <>
                                {automations.length === 0 ? (
                                    <EmptyState
                                        onBrowse={() => setTab('library')}
                                        onCreate={() =>
                                            setDialog({ open: true })
                                        }
                                    />
                                ) : (
                                    <div className={css.cards}>
                                        {automations.map((automation) => (
                                            <AutomationCard
                                                key={automation.id}
                                                automation={automation}
                                                onToggle={() =>
                                                    toggleEnabled(automation.id)
                                                }
                                                onEdit={() =>
                                                    setDialog({
                                                        open: true,
                                                        editingId:
                                                            automation.id,
                                                    })
                                                }
                                                onDelete={() =>
                                                    deleteAutomation(
                                                        automation.id,
                                                    )
                                                }
                                                onPause={() =>
                                                    pauseAutomation(
                                                        automation.id,
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className={css.librarySearch}>
                                    <SearchField
                                        aria-label="Search reports"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={setSearch}
                                    />
                                </div>
                                <div className={css.libraryGrid}>
                                    {filteredLibrary.map((item) => (
                                        <LibraryCard
                                            key={item.title}
                                            item={item}
                                            onAdd={() =>
                                                setDialog({
                                                    open: true,
                                                    template: item,
                                                })
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {dialog.open && (
                <AutomationDialog
                    editing={editing}
                    template={dialog.template}
                    onClose={() => setDialog({ open: false })}
                    onSubmit={submitAutomation}
                />
            )}
        </div>
    )
}

/* ---------------- My automations card ---------------- */

function AutomationCard({
    automation,
    onToggle,
    onEdit,
    onDelete,
    onPause,
}: {
    automation: Automation
    onToggle: () => void
    onEdit: () => void
    onDelete: () => void
    onPause: () => void
}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className={css.card}>
            <div className={css.cardBody}>
                <div className={css.cardMain}>
                    <Tag size="sm" color={CATEGORY_COLOR[automation.category]}>
                        {automation.category}
                    </Tag>
                    <div className={css.cardTitle}>{automation.title}</div>
                    <div className={css.cardMeta}>
                        <span>{automation.schedule}</span>
                        <span className={css.metaDot}>·</span>
                        <span className={css.cardDest}>
                            {automation.delivery === 'slack' ? (
                                <SlackIcon />
                            ) : (
                                <Icon name="mail" size="xs" />
                            )}
                            {automation.delivery === 'slack'
                                ? automation.channel
                                : formatEmails(automation.emails)}
                        </span>
                    </div>
                </div>

                <div className={css.cardActions}>
                    <ToggleField
                        value={automation.enabled}
                        onChange={onToggle}
                    />
                    <Menu
                        aria-label="Automation actions"
                        placement="bottom right"
                        trigger={
                            <Button
                                variant="tertiary"
                                size="sm"
                                icon="dots-kebab-vertical"
                                aria-label="Automation actions"
                            />
                        }
                        onAction={(key) => {
                            if (key === 'edit') onEdit()
                            if (key === 'delete') onDelete()
                        }}
                    >
                        <MenuItem
                            id="edit"
                            leadingSlot="edit-pencil"
                            label="Edit"
                        />
                        <MenuItem
                            id="delete"
                            leadingSlot="trash-empty"
                            label="Delete"
                            intent="destructive"
                        />
                    </Menu>
                </div>
            </div>

            {automation.failure && (
                <div className={css.failed}>
                    <div className={css.failedHeader}>
                        <span className={css.failedIcon}>
                            <Icon name="error-octagon" size="sm" />
                        </span>
                        <span className={css.failedText}>
                            <strong>
                                {automation.failure.split('. ')[0]}.
                            </strong>{' '}
                            {automation.failure.split('. ').slice(1).join('. ')}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            leadingSlot={<Icon name="add-plus" size="sm" />}
                            onClick={onEdit}
                        >
                            Add a new Slack channel
                        </Button>
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon={
                                expanded
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                            aria-label="Toggle run history"
                            onClick={() => setExpanded((v) => !v)}
                        />
                    </div>

                    {expanded && (
                        <div className={css.runHistory}>
                            <div className={css.runHistoryLabel}>
                                Run history
                            </div>
                            {automation.runs?.map((run) => (
                                <div key={run.id} className={css.runRow}>
                                    <span className={css.runDate}>
                                        {run.date}
                                    </span>
                                    <span className={css.runStatus}>
                                        <RunStatusTag status={run.status} />
                                    </span>
                                    <span className={css.runAction}>
                                        {run.status === 'delivered' ? (
                                            <Button
                                                variant="tertiary"
                                                size="sm"
                                            >
                                                View report
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="tertiary"
                                                size="sm"
                                                leadingSlot={
                                                    <Icon
                                                        name="media-pause-circle"
                                                        size="sm"
                                                    />
                                                }
                                                onClick={onPause}
                                            >
                                                Pause run
                                            </Button>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function RunStatusTag({ status }: { status: RunStatus }) {
    if (status === 'delivered') {
        return (
            <Tag
                size="sm"
                color="green"
                leadingSlot={<Icon name="check" size="xs" />}
            >
                Delivered
            </Tag>
        )
    }
    return (
        <Tag
            size="sm"
            color="red"
            leadingSlot={<Icon name="error-octagon" size="xs" />}
        >
            Failed
        </Tag>
    )
}

/* ---------------- Library card ---------------- */

function LibraryCard({
    item,
    onAdd,
}: {
    item: LibraryItem
    onAdd: () => void
}) {
    return (
        <div className={css.libraryCard}>
            <Tag size="sm" color={CATEGORY_COLOR[item.category]}>
                {item.category}
            </Tag>
            <div className={css.libraryTitle}>{item.title}</div>
            <Text className={css.libraryDescription}>{item.description}</Text>
            <div className={css.libraryFooter}>
                <Button variant="secondary" size="sm" onClick={onAdd}>
                    Add
                </Button>
            </div>
        </div>
    )
}

/* ---------------- Empty state ---------------- */

function EmptyState({
    onBrowse,
    onCreate,
}: {
    onBrowse: () => void
    onCreate: () => void
}) {
    return (
        <div className={css.empty}>
            <Icon name="calendar" size="lg" />
            <div className={css.emptyTitle}>No scheduled runs yet</div>
            <Text className={css.emptyText}>
                Schedule a report to have Gaia deliver it to Slack or email on a
                recurring basis.
            </Text>
            <div className={css.emptyActions}>
                <Button variant="primary" onClick={onCreate}>
                    New scheduled run
                </Button>
                <Button variant="secondary" onClick={onBrowse}>
                    Browse the Library
                </Button>
            </div>
        </div>
    )
}

/* ---------------- Create / edit dialog ---------------- */

type Frequency = 'daily' | 'weekly' | 'monthly'

type FormValues = {
    title: string
    description: string
    category: Category
    frequency: Frequency
    day: string
    dayOfMonth: string
    time: string
    timezone: string
    deliverTo: Delivery
    channel: string
    emails: string[]
}

const DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
]
const DAYS_OF_MONTH = ['1st', '5th', '10th', '15th', '20th', '25th', 'Last day']
const TIMES = [
    '06:00 AM',
    '07:00 AM',
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '12:00 PM',
    '03:00 PM',
    '05:00 PM',
]
const TIMEZONES = [
    'UTC -08:00 Pacific Time',
    'UTC -07:00 Mountain Time',
    'UTC -06:00 Central Time',
    'UTC -05:00 Eastern Time',
    'UTC +00:00 GMT',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toOptions(values: string[]) {
    return values.map((value) => ({ id: value, label: value }))
}

// Shows the first recipient plus a "+N" count when there are several.
function formatEmails(emails?: string[]): string {
    if (!emails || emails.length === 0) return ''
    if (emails.length === 1) return emails[0]
    return `${emails[0]} +${emails.length - 1}`
}

function toAutomation(
    values: FormValues,
    base?: Automation,
): Omit<Automation, 'id'> {
    const dayPart =
        values.frequency === 'daily'
            ? 'Every day'
            : values.frequency === 'weekly'
              ? `Every ${values.day}`
              : `Monthly on the ${values.dayOfMonth}`
    return {
        title: values.title,
        description: values.description,
        category: values.category,
        schedule: `${dayPart}, ${values.time}`,
        delivery: values.deliverTo,
        channel: values.deliverTo === 'slack' ? values.channel : undefined,
        emails:
            values.deliverTo === 'email'
                ? values.emails.map((e) => e.trim()).filter(Boolean)
                : undefined,
        enabled: base?.enabled ?? true,
        failure: base?.failure,
        runs: base?.runs,
    }
}

function AutomationDialog({
    editing,
    template,
    onClose,
    onSubmit,
}: {
    editing?: Automation
    template?: LibraryItem
    onClose: () => void
    onSubmit: (values: FormValues, editingId?: number) => void
}) {
    const source = editing ?? template
    const [values, setValues] = useState<FormValues>({
        title: source?.title ?? 'New scheduled report',
        description: source?.description ?? '',
        category: (source?.category as Category) ?? 'Automation',
        frequency: 'weekly',
        day: 'Monday',
        dayOfMonth: '1st',
        time: '08:00 AM',
        timezone: 'UTC -06:00 Central Time',
        deliverTo: editing?.delivery ?? 'slack',
        channel: editing?.channel ?? '',
        emails: editing?.emails?.length ? editing.emails : [''],
    })
    const [showErrors, setShowErrors] = useState(false)

    const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
        setValues((v) => ({ ...v, [key]: value }))

    const setEmail = (index: number, value: string) =>
        setValues((v) => ({
            ...v,
            emails: v.emails.map((e, i) => (i === index ? value : e)),
        }))
    const addEmail = () =>
        setValues((v) => ({ ...v, emails: [...v.emails, ''] }))
    const removeEmail = (index: number) =>
        setValues((v) => ({
            ...v,
            emails: v.emails.filter((_, i) => i !== index),
        }))

    const filledEmails = values.emails.map((e) => e.trim()).filter(Boolean)
    const emailInvalid =
        values.deliverTo === 'email' &&
        (filledEmails.length === 0 ||
            filledEmails.some((e) => !EMAIL_RE.test(e)))
    const channelMissing = values.deliverTo === 'slack' && !values.channel
    const isValid = !emailInvalid && !channelMissing

    const handleSubmit = () => {
        if (!isValid) {
            setShowErrors(true)
            return
        }
        onSubmit(values, editing?.id)
    }

    return (
        <Modal isOpen onOpenChange={(open) => !open && onClose()} size="sm">
            <div className={css.dialog}>
                <div className={css.dialogHeader}>
                    <div>
                        <div className={css.dialogTitle}>{values.title}</div>
                        {values.description && (
                            <Text className={css.dialogSubtitle}>
                                {values.description}
                            </Text>
                        )}
                    </div>
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon="close"
                        aria-label="Close"
                        onClick={onClose}
                    />
                </div>

                <div className={css.dialogBody}>
                    <div className={css.field}>
                        <span className={css.fieldLabel}>Frequency</span>
                        <ButtonGroup
                            selectedKey={values.frequency}
                            onSelectionChange={(k) =>
                                set('frequency', k as Frequency)
                            }
                        >
                            <ButtonGroupItem id="daily">Daily</ButtonGroupItem>
                            <ButtonGroupItem id="weekly">
                                Weekly
                            </ButtonGroupItem>
                            <ButtonGroupItem id="monthly">
                                Monthly
                            </ButtonGroupItem>
                        </ButtonGroup>
                    </div>

                    {values.frequency === 'weekly' && (
                        <div className={css.field}>
                            <span className={css.fieldLabel}>Day</span>
                            <SelectField
                                aria-label="Day of week"
                                items={toOptions(DAYS)}
                                value={{
                                    id: values.day,
                                    label: values.day,
                                }}
                                onChange={(o) => set('day', o.label)}
                            >
                                {(o) => (
                                    <ListItem
                                        textValue={o.label}
                                        label={o.label}
                                    />
                                )}
                            </SelectField>
                        </div>
                    )}

                    {values.frequency === 'monthly' && (
                        <div className={css.field}>
                            <span className={css.fieldLabel}>Day of month</span>
                            <SelectField
                                aria-label="Day of month"
                                items={toOptions(DAYS_OF_MONTH)}
                                value={{
                                    id: values.dayOfMonth,
                                    label: values.dayOfMonth,
                                }}
                                onChange={(o) => set('dayOfMonth', o.label)}
                            >
                                {(o) => (
                                    <ListItem
                                        textValue={o.label}
                                        label={o.label}
                                    />
                                )}
                            </SelectField>
                        </div>
                    )}

                    <div className={css.fieldRow}>
                        <div className={css.field}>
                            <span className={css.fieldLabel}>Time</span>
                            <SelectField
                                aria-label="Time"
                                items={toOptions(TIMES)}
                                value={{
                                    id: values.time,
                                    label: values.time,
                                }}
                                onChange={(o) => set('time', o.label)}
                            >
                                {(o) => (
                                    <ListItem
                                        textValue={o.label}
                                        label={o.label}
                                    />
                                )}
                            </SelectField>
                        </div>
                        <div className={css.field}>
                            <span className={css.fieldLabel}>Timezone</span>
                            <SelectField
                                aria-label="Timezone"
                                items={toOptions(TIMEZONES)}
                                value={{
                                    id: values.timezone,
                                    label: values.timezone,
                                }}
                                onChange={(o) => set('timezone', o.label)}
                            >
                                {(o) => (
                                    <ListItem
                                        textValue={o.label}
                                        label={o.label}
                                    />
                                )}
                            </SelectField>
                        </div>
                    </div>

                    <div className={css.field}>
                        <span className={css.fieldLabel}>Deliver to</span>
                        <ButtonGroup
                            selectedKey={values.deliverTo}
                            onSelectionChange={(k) =>
                                set('deliverTo', k as Delivery)
                            }
                        >
                            <ButtonGroupItem id="slack">Slack</ButtonGroupItem>
                            <ButtonGroupItem id="email">Email</ButtonGroupItem>
                        </ButtonGroup>
                    </div>

                    {values.deliverTo === 'slack' ? (
                        <div className={css.field}>
                            <SelectField
                                aria-label="Slack channel"
                                placeholder="Select slack channel"
                                items={toOptions(
                                    SLACK_CHANNELS.map((c) => `#${c}`),
                                )}
                                value={
                                    values.channel
                                        ? {
                                              id: `#${values.channel}`,
                                              label: `#${values.channel}`,
                                          }
                                        : undefined
                                }
                                onChange={(o) =>
                                    set('channel', o.label.replace('#', ''))
                                }
                            >
                                {(o) => (
                                    <ListItem
                                        textValue={o.label}
                                        label={o.label}
                                    />
                                )}
                            </SelectField>
                            {showErrors && channelMissing && (
                                <span className={css.fieldError}>
                                    Select a Slack channel.
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className={css.field}>
                            {values.emails.map((email, index) => (
                                <div key={index} className={css.emailRow}>
                                    <div className={css.emailInput}>
                                        <TextField
                                            aria-label={`Recipient email ${
                                                index + 1
                                            }`}
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(v) => setEmail(index, v)}
                                            isInvalid={
                                                showErrors &&
                                                email.trim() !== '' &&
                                                !EMAIL_RE.test(email.trim())
                                            }
                                        />
                                    </div>
                                    {values.emails.length > 1 && (
                                        <Button
                                            variant="tertiary"
                                            size="sm"
                                            icon="close"
                                            aria-label="Remove recipient"
                                            onClick={() => removeEmail(index)}
                                        />
                                    )}
                                </div>
                            ))}
                            <div>
                                <Button
                                    variant="tertiary"
                                    size="sm"
                                    leadingSlot={
                                        <Icon name="add-plus" size="sm" />
                                    }
                                    onClick={addEmail}
                                >
                                    Add email
                                </Button>
                            </div>
                            {showErrors && emailInvalid && (
                                <span className={css.fieldError}>
                                    Enter at least one valid email address.
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className={css.dialogFooter}>
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        isDisabled={!isValid}
                        onClick={handleSubmit}
                    >
                        {editing ? 'Save changes' : 'Create automation'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
