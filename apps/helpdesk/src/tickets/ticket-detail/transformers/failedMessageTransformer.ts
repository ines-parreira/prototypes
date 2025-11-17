import { isFailed } from 'models/ticket/predicates'
import type { Action } from 'models/ticket/types'

import type { FailedFlag, TicketElement } from '../types'
import { integrationErrorTransformer } from './integrationErrorTransformer'

export function failedMessageTransformer(
    elements: TicketElement[],
): TicketElement[] {
    return elements.map((element) => {
        if (element.type !== 'message' || !isFailed(element.data)) {
            return element
        }

        const failedActions =
            element.data.actions?.filter((action): action is Action => {
                const typedAction = action as Action
                return Boolean(
                    typedAction.status === 'error' &&
                        typedAction.response &&
                        typedAction.response.msg,
                )
            }) || []

        const hasFailedActions = failedActions.length > 0

        const errorMessage = hasFailedActions
            ? 'Message not sent because action failed.'
            : element.data.last_sending_error &&
                element.data.last_sending_error.error
              ? element.data.last_sending_error.error
              : 'This message was not sent.'

        const failedFlag: FailedFlag = [
            'failed',
            {
                message: errorMessage,
                failedActions: failedActions,
                ...integrationErrorTransformer(element.data),
            },
        ]

        return {
            ...element,
            flags: [...(element.flags || []), failedFlag],
        }
    })
}
