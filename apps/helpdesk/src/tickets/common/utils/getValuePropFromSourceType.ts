import { SOURCE_VALUE_PROP } from 'config'
import { isTicketMessageSourceType } from 'models/ticket/predicates'
import type { ChannelLike } from 'services/channels'

/**
 * Return value prop from sender/receiver that is used to identify a person depending on the source type
 */
export default function getValuePropFromSourceType(sourceType: ChannelLike) {
    if (isTicketMessageSourceType(sourceType)) {
        return SOURCE_VALUE_PROP[sourceType]
    }

    return 'address'
}
