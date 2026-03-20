import { Icon, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { isActivePendingMessage } from '../../../../hooks/messages/predicates'
import type { TicketThreadSingleMessageItem } from '../../../../hooks/messages/types'

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
    if (isActivePendingMessage(item)) return <LoadingSpinner size={16} />
    return null
}
