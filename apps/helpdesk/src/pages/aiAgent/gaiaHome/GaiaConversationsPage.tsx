import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Button,
    Icon,
    Menu,
    MenuItem,
    SearchField,
    SubMenu,
    Text,
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

// A mix of knowledge- and analytics-related Gaia conversations.
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
        time: 'Yesterday',
        group: 'Yesterday',
    },
    {
        id: 3,
        title: 'Draft a shipping-delay macro',
        summary:
            'Turned repeated shipping-delay replies into a reusable macro.',
        time: 'Yesterday',
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

// Wrap each occurrence of the search term in a highlight span so matches
// stand out. Case-insensitive; returns the plain string when there's no query.
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

// Folders a chat can be moved into (mirrors the Folders section in the nav).
const CHAT_FOLDERS = [
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'reporting', label: 'Reporting' },
]

// Thumbtack "pin" icon — Axiom has no push-pin, so this is a small custom SVG
// that inherits the menu item's text color.
function PinIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M12 17v5" />
            <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
        </svg>
    )
}

export function GaiaConversationsPage() {
    const [search, setSearch] = useState('')
    const query = search.trim().toLowerCase()

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
                                size="md"
                                value={search}
                                onChange={setSearch}
                            />
                        </div>

                        <div className={css.list}>
                            {GROUP_ORDER.map((group) => {
                                const items = CONVERSATIONS.filter(
                                    (conversation) =>
                                        conversation.group === group &&
                                        (!query ||
                                            `${conversation.title} ${conversation.summary}`
                                                .toLowerCase()
                                                .includes(query)),
                                )
                                if (items.length === 0) return null

                                return (
                                    <div key={group} className={css.group}>
                                        <div className={css.groupHeader}>
                                            {group}
                                        </div>
                                        {items.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                className={css.row}
                                            >
                                                <div className={css.rowMain}>
                                                    <Text
                                                        variant="medium"
                                                        overflow="ellipsis"
                                                        className={css.rowTitle}
                                                    >
                                                        {highlight(
                                                            conversation.title,
                                                            query,
                                                        )}
                                                    </Text>
                                                    <Text
                                                        overflow="ellipsis"
                                                        className={
                                                            css.rowSummary
                                                        }
                                                    >
                                                        {highlight(
                                                            conversation.summary,
                                                            query,
                                                        )}
                                                    </Text>
                                                </div>

                                                <div
                                                    className={css.rowTrailing}
                                                >
                                                    <span
                                                        className={css.rowTime}
                                                    >
                                                        {conversation.time}
                                                    </span>
                                                    <span className={css.kebab}>
                                                        <Menu
                                                            aria-label="Chat actions"
                                                            placement="bottom right"
                                                            trigger={
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    icon="dots-kebab-vertical"
                                                                    aria-label="Chat actions"
                                                                />
                                                            }
                                                        >
                                                            <SubMenu
                                                                leadingSlot="folder"
                                                                label="Move to a folder"
                                                            >
                                                                {CHAT_FOLDERS.map(
                                                                    (
                                                                        folder,
                                                                    ) => (
                                                                        <MenuItem
                                                                            key={
                                                                                folder.id
                                                                            }
                                                                            id={`move-${folder.id}`}
                                                                            label={
                                                                                folder.label
                                                                            }
                                                                        />
                                                                    ),
                                                                )}
                                                                <MenuItem
                                                                    id="new-folder"
                                                                    leadingSlot="add-plus"
                                                                    label="Create new folder"
                                                                />
                                                            </SubMenu>
                                                            <MenuItem
                                                                id="pin"
                                                                leadingSlot={
                                                                    <PinIcon />
                                                                }
                                                                label="Pin chat"
                                                            />
                                                            <MenuItem
                                                                id="rename"
                                                                leadingSlot="edit-pencil"
                                                                label="Rename"
                                                            />
                                                            <MenuItem
                                                                id="delete"
                                                                leadingSlot="trash-empty"
                                                                label="Delete"
                                                                intent="destructive"
                                                            />
                                                        </Menu>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
