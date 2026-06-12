import { isRecord } from '@repo/utils'
import type { TicketMessage } from '@gorgias/helpdesk-queries'
import { truncate } from '@gorgias/toolkit'

type Action = NonNullable<TicketMessage['actions']>[number]

const DISPLAYED_ARG_BY_ACTION_NAME: Record<string, string> = {
    addTags: 'tags',
    addAttachments: 'attachments',
    addInternalNote: 'body_text',
    setAssignee: 'assignee_user',
    setResponseText: 'body_text',
    setStatus: 'status',
    setPriority: 'priority',
    setSubject: 'subject',
    setTeamAssignee: 'assignee_team',
    snoozeTicket: 'snooze_timedelta',
    setCustomFieldValue: 'value',
    setCustomerCustomFieldValue: 'value',
}

const TITLE_ONLY_ACTION_NAMES = new Set([
    'forwardByEmail',
    'excludeFromAutoMerge',
    'excludeFromCSAT',
])

export function getActionName(action: Action): string {
    return typeof action.name === 'string' ? action.name : ''
}

export function getActionTitle(action: Action): string {
    const name = getActionName(action)
    if (name === 'applyExternalTemplate') return 'WhatsApp template applied'
    return typeof action.title === 'string' ? action.title : name
}

export function getDisplayedActionTitle(action: Action): string {
    const name = getActionName(action)
    const title = getActionTitle(action)

    if (
        name === 'applyExternalTemplate' ||
        name === 'http' ||
        name.startsWith('shopify') ||
        TITLE_ONLY_ACTION_NAMES.has(name)
    ) {
        return title
    }

    return `${title}: ${getActionArg(action)}`
}

function getActionArg(action: Action): string {
    const name = getActionName(action)
    const key = DISPLAYED_ARG_BY_ACTION_NAME[name]
    const args = action.arguments
    const arg = isRecord(args) && key ? args[key] : null

    return truncate(formatActionArg(name, arg), { length: 20 })
}

function formatActionArg(actionName: string, arg: unknown): string {
    if (!arg) return 'None'

    if (isRecord(arg)) {
        return typeof arg.name === 'string' ? arg.name : 'None'
    }

    const value = String(arg)
    if (actionName === 'addTags') return value.split(',').join(', ')
    return value
}
