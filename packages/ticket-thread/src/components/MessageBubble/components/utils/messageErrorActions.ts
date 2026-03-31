import type { TicketMessage } from '@gorgias/helpdesk-queries'

export type MessageErrorAction = {
    name?: string | null
    response?: {
        msg?: string | null
    } | null
    status?: string | null
    title?: string | null
}

export function hasFailedAction(
    message: Pick<TicketMessage, 'actions'>,
): boolean {
    return Boolean(message.actions?.some((action) => action.status === 'error'))
}

export function isMessagePending({
    actions,
    isPending,
    source,
}: Pick<TicketMessage, 'actions' | 'source'> & {
    isPending?: boolean
}): boolean {
    if (source?.type === 'email') {
        return false
    }

    const hasPendingMessageAction = Boolean(
        actions?.some((action) => action.status === 'pending'),
    )

    return (
        (hasPendingMessageAction && !hasFailedAction({ actions })) ||
        !!isPending
    )
}

export function getFailedActions(
    actions: TicketMessage['actions'] | undefined,
): MessageErrorAction[] {
    return ((actions ?? []) as MessageErrorAction[]).filter(
        (action): action is MessageErrorAction =>
            action.status === 'error' && Boolean(action.response?.msg),
    )
}
