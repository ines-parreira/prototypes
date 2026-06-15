import { Box } from '@gorgias/axiom'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { AppliedAction } from './AppliedAction'

const FRONT_ACTION_NAMES = new Set(['setResponseText', 'addAttachments'])

type MessageWithAppliedActions = Pick<
    TicketMessage,
    'actions' | 'created_datetime' | 'ticket_id'
> & {
    macros?: unknown[] | null
}

export function MessageAppliedActions({
    message,
    isPending = false,
}: {
    message: MessageWithAppliedActions
    isPending?: boolean
}) {
    if (!message.actions?.length) return null

    const isMacroApplied = Boolean(message.macros?.length)
    const displayedActions = message.actions.filter(
        (action) =>
            typeof action.name !== 'string' ||
            !FRONT_ACTION_NAMES.has(action.name),
    )

    if (displayedActions.length === 0) return null

    return (
        <Box flexDirection="column" mt="xs">
            {displayedActions.map((action, index) => (
                <AppliedAction
                    key={`applied-action-${index}`}
                    action={action}
                    isPending={isPending}
                    isMacroApplied={isMacroApplied}
                    ticketId={message.ticket_id}
                    createdDatetime={message.created_datetime}
                />
            ))}
        </Box>
    )
}
