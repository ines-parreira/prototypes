import {Map} from 'immutable'

import {TicketMessage} from 'models/ticket/types'
import {toImmutable} from 'utils'

/**
 * Return whether or not the message is forwarded
 */
export default function isForwardedMessage(
    message: Map<any, any> | TicketMessage
) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ((toImmutable(message) as Map<any, any>).getIn([
            'source',
            'extra',
            'forward',
        ]) as boolean) || false
    )
}
