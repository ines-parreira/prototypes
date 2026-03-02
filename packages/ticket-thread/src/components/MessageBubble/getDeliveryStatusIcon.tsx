import type { ReactNode } from 'react'

import { Icon, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { TicketThreadRegularMessageItem } from '../../hooks/messages/types'

export function getDeliveryStatusIcon(
    item: TicketThreadRegularMessageItem,
): ReactNode {
    if (item.data.failed_datetime) return <Icon name="close" size="sm" />
    if (item.isPending) return <LoadingSpinner size={16} />
    if (item.data.opened_datetime) return <Icon name="check-all" size="sm" />
    if (item.data.sent_datetime) return <Icon name="check" size="sm" />
    return null
}
