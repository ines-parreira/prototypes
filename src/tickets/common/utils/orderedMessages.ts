import {List, Map} from 'immutable'

import {toImmutable} from 'common/utils'
import {TicketMessage} from 'models/ticket/types'
import {compare} from 'utils'

/**
 * Return passed messages ordered by created_datetime
 */
export default function orderedMessages(
    messages: Array<TicketMessage> | List<any>
): Map<any, any> {
    return toImmutable<List<any>>(messages).sort(
        (a: Map<any, any>, b: Map<any, any>) =>
            compare(a.get('created_datetime'), b.get('created_datetime'))
    ) as Map<any, any>
}
