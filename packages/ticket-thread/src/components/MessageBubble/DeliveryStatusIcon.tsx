import { Icon, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

export type DeliveryStatus = {
    failed_datetime?: string | null
    isPending?: boolean
    opened_datetime?: string | null
    sent_datetime?: string | null
}

type DeliveryStatusIconProps = {
    status: DeliveryStatus
}

export function DeliveryStatusIcon({ status }: DeliveryStatusIconProps) {
    if (status.failed_datetime) return <Icon name="close" size="sm" />
    if (status.isPending) return <LoadingSpinner size={16} />
    if (status.opened_datetime) return <Icon name="check-all" size="sm" />
    if (status.sent_datetime) return <Icon name="check" size="sm" />
    return null
}
