import { Icon, Loader } from '@gorgias/axiom'

import { isActivePendingMessageItem } from '../../../../predicates'
import type { TicketThreadSingleMessageItem } from '../../../../types'

type MessageDeliveryIconProps = {
    item: TicketThreadSingleMessageItem
}

export function MessageDeliveryIcon({ item }: MessageDeliveryIconProps) {
    if (!Boolean(item.data.from_agent)) return null
    if (item.data.failed_datetime)
        return <Icon name="close" size="sm" color="content-neutral-secondary" />
    if (item.data.opened_datetime)
        return (
            <Icon
                name="check-all"
                size="sm"
                color="content-neutral-secondary"
            />
        )
    if (item.data.sent_datetime)
        return <Icon name="check" size="sm" color="content-neutral-secondary" />
    if (isActivePendingMessageItem(item)) return <Loader size="sm" />
    return null
}
