import {
    AutomationPrice,
    HelpdeskPrice,
    PlanInterval,
} from 'models/billing/types'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import {PRODUCT_INFO} from '../../constants'

export type setNotificationProps = {
    oldProduct?: HelpdeskPrice | AutomationPrice
    newProduct?: HelpdeskPrice | AutomationPrice
    periodEnd: string
    interval?: PlanInterval
    onClick: () => void
}

export const setHelpdeskNotification = ({
    oldProduct,
    newProduct,
    periodEnd,
    onClick,
}: setNotificationProps): Notification => {
    // Set the notification message
    let message = ''
    let buttonLabel = ''
    if ((oldProduct?.amount || 0) > (newProduct?.amount || 0)) {
        // Downgrade Helpdesk subscription
        message = `Your subscription will change to <strong>${
            newProduct?.name ?? ''
        }</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Helpdesk subscription
        message = `Success! Helpdesk was upgraded to <strong>${
            newProduct?.name ?? ''
        }</strong>`
        buttonLabel = 'Helpdesk Settings'
    }

    // Add the notification
    return {
        status: NotificationStatus.Success,
        style: NotificationStyle.Alert,
        showDismissButton: true,
        noAutoDismiss: true,
        showIcon: true,
        allowHTML: true,
        message,
        buttons: !!buttonLabel
            ? [
                  {
                      name: buttonLabel,
                      primary: false,
                      onClick,
                  },
              ]
            : [],
    }
}

export const setAutomationNotification = ({
    oldProduct,
    newProduct,
    periodEnd,
    interval = PlanInterval.Month,
    onClick,
}: setNotificationProps): Notification => {
    // Set the notification message
    let message = ''
    let buttonLabel = ''

    if (!oldProduct) {
        // New Automation subscription
        message = 'Woohoo! You now have access to <strong>Automation!</strong>'
        buttonLabel = 'Set Up Automation'
    } else if (
        // Downgrade Automation subscription
        oldProduct.amount > (newProduct?.amount ?? 0)
    ) {
        message = `Your Automation subscription will change to <strong>${
            newProduct?.num_quota_tickets ?? 0
        } ${
            PRODUCT_INFO.automation.counter
        }/${interval}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Automation subscription
        message = `Success! You now have <strong>${
            newProduct?.num_quota_tickets ?? ''
        } ${PRODUCT_INFO.automation.counter} per ${interval}</strong>`
        buttonLabel = 'Automation Settings'
    }

    // Add the notification
    return {
        status: NotificationStatus.Success,
        style: NotificationStyle.Alert,
        showDismissButton: true,
        noAutoDismiss: true,
        showIcon: true,
        allowHTML: true,
        buttons: !!buttonLabel
            ? [
                  {
                      name: buttonLabel,
                      onClick,
                      primary: false,
                  },
              ]
            : [],
        message,
    }
}
