import { Link } from 'react-router-dom'
import { Button, Icon, Menu, MenuItem, Text } from '@gorgias/axiom'

import css from './GaiaConversationsPage.less'

type Conversation = {
    id: number
    title: string
    summary: string
    time: string
}

// A mix of knowledge- and analytics-related Gaia conversations.
const CONVERSATIONS: Conversation[] = [
    {
        id: 0,
        title: 'Why did automation rate drop last week?',
        summary:
            'Traced the 4-point dip to the returns skill and suggested a fix.',
        time: 'Just now',
    },
    {
        id: 1,
        title: 'Refund policy article has gaps',
        summary:
            "Reviewed which refund questions the help center doesn't answer yet.",
        time: '1h ago',
    },
    {
        id: 2,
        title: 'Top intents by volume this month',
        summary:
            'Broke down the highest-volume intents and their resolution rates.',
        time: 'Monday',
    },
    {
        id: 3,
        title: 'Draft a shipping-delay macro',
        summary:
            'Turned repeated shipping-delay replies into a reusable macro.',
        time: 'Monday',
    },
    {
        id: 4,
        title: 'CSAT trend after the May update',
        summary: 'Compared CSAT before and after the May skill changes.',
        time: 'May 28',
    },
    {
        id: 5,
        title: 'Sync return window across skills',
        summary:
            'Aligned the return window between Returns and Holiday policy.',
        time: 'May 28',
    },
    {
        id: 6,
        title: 'Agent hours saved this quarter',
        summary: 'Summarized time saved by the AI Agent over the last 90 days.',
        time: 'May 28',
    },
    {
        id: 7,
        title: 'Order-tracking resolution rate',
        summary: 'Analyzed why order-tracking resolves below your average.',
        time: 'May 27',
    },
    {
        id: 8,
        title: 'Missing sizing-guide answers',
        summary:
            'Explored why sizing questions escalate and drafted new guidance.',
        time: 'May 27',
    },
    {
        id: 9,
        title: 'International shipping deflection',
        summary: 'Estimated how a new shipping skill would cut escalations.',
        time: 'May 27',
    },
    {
        id: 10,
        title: 'Busiest hours for handovers',
        summary: 'Mapped handover spikes by time of day to plan staffing.',
        time: 'May 27',
    },
]

type MenuAction = {
    id: string
    label: string
    icon: string
    intent?: 'destructive'
}

const MENU_ACTIONS: MenuAction[] = [
    { id: 'copy', label: 'Copy conversation ID', icon: 'copy' },
    { id: 'rename', label: 'Rename', icon: 'edit-pencil' },
    {
        id: 'delete',
        label: 'Delete',
        icon: 'trash-empty',
        intent: 'destructive',
    },
]

export function GaiaConversationsPage() {
    return (
        <div className={css.page}>
            <div className={css.surface}>
                <div className={css.header}>
                    <span className={css.title}>Conversations</span>
                    <Button
                        as={Link}
                        to="/app/gaia-home"
                        variant="primary"
                        leadingSlot={<Icon name="note-edit" size="sm" />}
                    >
                        New conversation
                    </Button>
                </div>

                <div className={css.scroll}>
                    <div className={css.body}>
                        <div className={css.searchRow}>
                            <Icon name="magnifying-glass" size="sm" />
                            <input
                                className={css.searchInput}
                                placeholder="Search..."
                            />
                        </div>

                        <div className={css.list}>
                            {CONVERSATIONS.map((conversation) => (
                                <div key={conversation.id} className={css.row}>
                                    <div className={css.rowMain}>
                                        <Text
                                            variant="medium"
                                            overflow="ellipsis"
                                            className={css.rowTitle}
                                        >
                                            {conversation.title}
                                        </Text>
                                        <Text
                                            overflow="ellipsis"
                                            className={css.rowSummary}
                                        >
                                            {conversation.summary}
                                        </Text>
                                    </div>

                                    <div className={css.rowTrailing}>
                                        <span className={css.rowTime}>
                                            {conversation.time}
                                        </span>
                                        <span className={css.kebab}>
                                            <Menu
                                                aria-label="Conversation actions"
                                                placement="bottom right"
                                                trigger={
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        icon="dots-kebab-vertical"
                                                        aria-label="Conversation actions"
                                                    />
                                                }
                                                items={MENU_ACTIONS}
                                            >
                                                {(action) => (
                                                    <MenuItem
                                                        id={action.id}
                                                        leadingSlot={
                                                            action.icon
                                                        }
                                                        label={action.label}
                                                        intent={action.intent}
                                                    />
                                                )}
                                            </Menu>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
