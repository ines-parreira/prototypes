import {Map} from 'immutable'

import {notify as notifyAction} from 'state/notifications/actions'

import replaceVariables from './replaceVariables'

export default function nestedReplace(
    obj: unknown,
    ticketState: Map<any, any>,
    currentUserState: Map<any, any>,
    notify?: typeof notifyAction
): unknown {
    if (typeof obj === 'string') {
        return replaceVariables(obj, ticketState, currentUserState, notify)
    }

    // since typeof null === 'object', we also need to verify obj is not null
    if (typeof obj === 'object' && obj !== null) {
        return (obj as Map<any, any>).map((item) =>
            nestedReplace(item, ticketState, currentUserState, notify)
        ) as Map<any, any>
    }

    return obj
}
