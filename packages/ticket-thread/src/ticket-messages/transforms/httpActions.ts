import { ACTION_EXECUTED_EVENT_TYPE } from '#events/constants'
import type { TicketThreadActionExecutedEventItem } from '#events/types'
import { TicketThreadItemTag } from '#thread/itemTags'
import type {
    TicketThreadMessageItem,
    TicketThreadSingleMessageItem,
} from '#ticket-messages/types'

type MessageHttpAction = {
    name: string
    title?: string | null
    status?: string
    arguments?: {
        url?: string
        form?: Record<string, unknown>
        params?: Record<string, unknown>
        headers?: Record<string, unknown>
        json?: Record<string, unknown>
        content_type?: string
        method?: string
    }
    response?: {
        msg?: string
        status_code?: number
        response?: string
    }
}

function isHttpAction(action: unknown): action is MessageHttpAction {
    return (
        typeof action === 'object' &&
        action !== null &&
        'name' in action &&
        action.name === 'http'
    )
}

function getMessageHttpActions(message: unknown): MessageHttpAction[] {
    if (
        typeof message !== 'object' ||
        message === null ||
        !('actions' in message) ||
        !Array.isArray(message.actions)
    ) {
        return []
    }

    return message.actions.filter(isHttpAction)
}

function toActionExecutedItem(
    action: MessageHttpAction,
    item: TicketThreadSingleMessageItem,
): TicketThreadActionExecutedEventItem {
    return {
        _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
        datetime: item.datetime,
        data: {
            object_type: 'Ticket',
            type: ACTION_EXECUTED_EVENT_TYPE,
            created_datetime: item.datetime,
            user_id: item.data.sender.id,
            data: {
                action_name: 'customHttpAction',
                action_label: action.title ?? null,
                integration_id: item.data.integration_id,
                payload: {
                    url: action.arguments?.url,
                    headers: action.arguments?.headers,
                    params: action.arguments?.params,
                    form: action.arguments?.form,
                    json: action.arguments?.json,
                    content_type: action.arguments?.content_type,
                    response:
                        action.response != null
                            ? {
                                  status_code: action.response.status_code,
                                  body: action.response.response,
                              }
                            : undefined,
                },
                status: action.status,
                msg: action.response?.msg,
            },
        },
    }
}

function extractFromSingleMessage(
    item: TicketThreadSingleMessageItem,
): TicketThreadActionExecutedEventItem[] {
    return getMessageHttpActions(item.data).map((action) =>
        toActionExecutedItem(action, item),
    )
}

export function extractHttpActionsFromMessages(
    messages: TicketThreadMessageItem[],
): TicketThreadActionExecutedEventItem[] {
    const result: TicketThreadActionExecutedEventItem[] = []

    for (const item of messages) {
        if (item._tag === TicketThreadItemTag.Messages.GroupedMessages) {
            for (const msg of item.data) {
                result.push(...extractFromSingleMessage(msg))
            }
        } else {
            result.push(...extractFromSingleMessage(item))
        }
    }

    return result
}
