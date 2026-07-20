import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Button,
    Icon,
    List,
    ListItem,
    ListSection,
    Menu,
    MenuItem,
    SearchField,
} from '@gorgias/axiom'

import css from './GaiaConversationsPage.less'

type ChatGroup = 'Today' | 'Yesterday' | 'Last week' | 'Last month'

type Conversation = {
    id: number
    title: string
    summary: string
    time: string
    group: ChatGroup
}

// A mix of knowledge- and analytics-related Gaia chats, grouped by recency.
const CONVERSATIONS: Conversation[] = [
    {
        id: 0,
        title: 'Why did automation rate drop last week?',
        summary:
            'Traced the 4-point dip to the returns skill and suggested a fix.',
        time: 'Just now',
        group: 'Today',
    },
    {
        id: 1,
        title: 'Refund policy article has gaps',
        summary:
            "Reviewed which refund questions the help center doesn't answer yet.",
        time: '1h ago',
        group: 'Today',
    },
    {
        id: 2,
        title: 'Top intents by volume this month',
        summary:
            'Broke down the highest-volume intents and their resolution rates.',
        time: '4:30 PM',
        group: 'Yesterday',
    },
    {
        id: 3,
        title: 'Draft a shipping-delay macro',
        summary:
            'Turned repeated shipping-delay replies into a reusable macro.',
        time: '10:15 AM',
        group: 'Yesterday',
    },
    {
        id: 4,
        title: 'CSAT trend after the May update',
        summary: 'Compared CSAT before and after the May skill changes.',
        time: 'Monday',
        group: 'Last week',
    },
    {
        id: 5,
        title: 'Sync return window across skills',
        summary:
            'Aligned the return window between Returns and Holiday policy.',
        time: 'Sunday',
        group: 'Last week',
    },
    {
        id: 6,
        title: 'Agent hours saved this quarter',
        summary: 'Summarized time saved by the AI Agent over the last 90 days.',
        time: 'Saturday',
        group: 'Last week',
    },
    {
        id: 7,
        title: 'Order-tracking resolution rate',
        summary: 'Analyzed why order-tracking resolves below your average.',
        time: 'May 28',
        group: 'Last month',
    },
    {
        id: 8,
        title: 'Missing sizing-guide answers',
        summary:
            'Explored why sizing questions escalate and drafted new guidance.',
        time: 'May 27',
        group: 'Last month',
    },
    {
        id: 9,
        title: 'International shipping deflection',
        summary: 'Estimated how a new shipping skill would cut escalations.',
        time: 'May 27',
        group: 'Last month',
    },
    {
        id: 10,
        title: 'Busiest hours for handovers',
        summary: 'Mapped handover spikes by time of day to plan staffing.',
        time: 'May 26',
        group: 'Last month',
    },
]

const GROUP_ORDER: ChatGroup[] = [
    'Today',
    'Yesterday',
    'Last week',
    'Last month',
]

// Wrap every occurrence of the search term in a highlight span so matches
// stand out in the results. Case-insensitive; returns the plain string when
// there's nothing to highlight.
function highlight(text: string, query: string) {
    if (!query) return text
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'ig'))
    return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className={css.highlight}>
                {part}
            </mark>
        ) : (
            part
        ),
    )
}

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type MenuAction = {
    id: string
    label: string
    icon: string
    intent?: 'destructive'
}

const MENU_ACTIONS: MenuAction[] = [
    { id: 'copy', label: 'Copy chat ID', icon: 'copy' },
    { id: 'rename', label: 'Rename', icon: 'edit-pencil' },
    {
        id: 'delete',
        label: 'Delete',
        icon: 'trash-empty',
        intent: 'destructive',
    },
]

export function GaiaConversationsPage() {
    const [search, setSearch] = useState('')

    const query = search.trim().toLowerCase()
    const filtered = CONVERSATIONS.filter(
        (chat) =>
            !query ||
            `${chat.title} ${chat.summary}`.toLowerCase().includes(query),
    )

    // Group into date sections, keeping only non-empty ones in a fixed order.
    const sections = GROUP_ORDER.map((group) => ({
        id: group,
        name: group,
        items: filtered.filter((chat) => chat.group === group),
    })).filter((section) => section.items.length > 0)

    return (
        <div className={css.page}>
            <div className={css.surface}>
                <div className={css.header}>
                    <span className={css.title}>Chats</span>
                    <Button
                        as={Link}
                        to="/app/gaia-home"
                        variant="primary"
                        leadingSlot={<Icon name="note-edit" size="sm" />}
                    >
                        New chat
                    </Button>
                </div>

                <div className={css.scroll}>
                    <div className={css.body}>
                        <div className={css.searchField}>
                            <SearchField
                                aria-label="Search chats"
                                placeholder="Search..."
                                value={search}
                                onChange={setSearch}
                            />
                        </div>

                        <List aria-label="Chats" items={sections}>
                            {(section) => (
                                <ListSection
                                    id={section.id}
                                    name={section.name}
                                    items={section.items}
                                >
                                    {(chat) => (
                                        <ListItem
                                            id={chat.id}
                                            label={highlight(chat.title, query)}
                                            caption={highlight(
                                                chat.summary,
                                                query,
                                            )}
                                            trailingSlot={
                                                <div
                                                    className={css.rowTrailing}
                                                >
                                                    <span
                                                        className={css.rowTime}
                                                    >
                                                        {chat.time}
                                                    </span>
                                                    <span className={css.kebab}>
                                                        <Menu
                                                            aria-label="Chat actions"
                                                            placement="bottom right"
                                                            trigger={
                                                                <Button
                                                                    variant="tertiary"
                                                                    size="sm"
                                                                    icon="dots-kebab-vertical"
                                                                    aria-label="Chat actions"
                                                                />
                                                            }
                                                            items={MENU_ACTIONS}
                                                        >
                                                            {(action) => (
                                                                <MenuItem
                                                                    id={
                                                                        action.id
                                                                    }
                                                                    leadingSlot={
                                                                        action.icon
                                                                    }
                                                                    label={
                                                                        action.label
                                                                    }
                                                                    intent={
                                                                        action.intent
                                                                    }
                                                                />
                                                            )}
                                                        </Menu>
                                                    </span>
                                                </div>
                                            }
                                        />
                                    )}
                                </ListSection>
                            )}
                        </List>
                    </div>
                </div>
            </div>
        </div>
    )
}
