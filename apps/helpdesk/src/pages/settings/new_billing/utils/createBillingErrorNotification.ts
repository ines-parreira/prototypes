import { isGorgiasApiError } from 'models/api/types'
import { TicketPurpose } from 'state/billing/types'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'

export default function createBillingErrorNotification(
    error: unknown,
    contactBilling: (ticketPurpose: TicketPurpose) => void,
): Notification {
    const apiError = isGorgiasApiError(error) ? error : undefined

    const errorMsg = apiError
        ? apiError.response.data.error.msg
        : `We couldn't update your subscription. Please try again.`

    return {
        message: errorMsg,
        buttons: [
            {
                primary: false,
                name: 'Contact Billing',
                onClick: () => contactBilling(TicketPurpose.ERROR),
            },
        ],
        noAutoDismiss: true,
        showDismissButton: true,
        status: NotificationStatus.Error,
        id: 'billing-error-notification',
    }
}
