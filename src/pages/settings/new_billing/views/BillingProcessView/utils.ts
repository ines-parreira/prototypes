import {Plan, PlanInterval} from 'models/billing/types'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import {PRODUCT_INFO} from '../../constants'

export type setNotificationProps = {
    oldProduct?: Plan
    newProduct?: Plan
    periodEnd: string
    interval?: PlanInterval
    onClick: () => void
    isFreeTrial: boolean
}

export const setHelpdeskNotification = ({
    oldProduct,
    newProduct,
    periodEnd,
    onClick,
    isFreeTrial,
}: setNotificationProps): Notification | null => {
    if (isFreeTrial) return null

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
    isFreeTrial,
}: setNotificationProps): Notification | null => {
    if (isFreeTrial) return null

    // Set the notification message
    let message = ''
    let buttonLabel = ''

    if (!oldProduct) {
        // New Automate subscription
        message = 'Woohoo! You now have access to <strong>Automate!</strong>'
        buttonLabel = 'Set Up Automate'
    } else if (
        // Downgrade Automate subscription
        oldProduct.amount > (newProduct?.amount ?? 0)
    ) {
        message = `Your Automate subscription will change to <strong>${
            newProduct?.num_quota_tickets ?? 0
        } ${
            PRODUCT_INFO.automation.counter
        }/${interval}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Automate subscription
        message = `Success! You now have <strong>${
            newProduct?.num_quota_tickets ?? ''
        } ${PRODUCT_INFO.automation.counter} per ${interval}</strong>`
        buttonLabel = 'Automate Settings'
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

export const setConvertNotification = ({
    oldProduct,
    newProduct,
    periodEnd,
    interval = PlanInterval.Month,
    onClick,
    isFreeTrial,
}: setNotificationProps): Notification | null => {
    if (isFreeTrial) return null

    // Set the notification message
    let message = ''
    let buttonLabel = ''

    if (!oldProduct) {
        // New Convert subscription
        message = 'Woohoo! You now have access to <strong>Convert!</strong>'
        buttonLabel = 'Set Up Convert'
    } else if (
        // Downgrade Revenue subscription
        oldProduct.amount > (newProduct?.amount ?? 0)
    ) {
        message = `Your Convert subscription will change to <strong>${
            newProduct?.num_quota_tickets ?? 0
        } ${
            PRODUCT_INFO.convert.counter
        }/${interval}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Convert subscription
        message = `Success! You now have <strong>${
            newProduct?.num_quota_tickets ?? ''
        } ${PRODUCT_INFO.convert.counter} per ${interval}</strong>`
        buttonLabel = 'Convert Settings'
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
