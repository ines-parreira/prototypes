import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import type { TicketMessage } from 'models/ticket/types'
import { getLastMessage } from 'utils'

import isForwardedMessage from './isForwardedMessage'
import isSystemType from './isSystemType'
import orderedMessages from './orderedMessages'

/**
 * Get the most recent message that was not a system-type message, if any
 */
export default function lastNonSystemTypeMessage(
    messages: Array<TicketMessage>,
) {
    const filteredMessages = orderedMessages(messages).filter(
        (message: Map<any, any>) => {
            return (
                !isSystemType(message.getIn(['source', 'type'])) &&
                !isForwardedMessage(message)
            )
        },
    )
    return (!filteredMessages.isEmpty() &&
        fromJS(getLastMessage(filteredMessages.toJS()))) as Maybe<Map<any, any>>
}
