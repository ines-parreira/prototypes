import { Map } from 'immutable'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { toImmutable } from 'common/utils'
import { TicketMessage as TicketMessage_DEPRECATED } from 'models/ticket/types'

/**
 * Return whether or not the message is forwarded
 */
export default function isForwardedMessage(
    message: Map<any, any> | TicketMessage | TicketMessage_DEPRECATED,
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
