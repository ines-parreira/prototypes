import { Cadence, Plan } from 'models/billing/types'
import {
    AlertNotification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

import { PRODUCT_INFO } from '../../constants'

export type setNotificationProps = {
    oldPlan?: Plan
    newPlan?: Plan
    periodEnd: string
    cadence?: Cadence
    onClick: () => void
    isFreeTrial: boolean
}

export const setHelpdeskNotification = ({
    oldPlan,
    newPlan,
    periodEnd,
    onClick,
    isFreeTrial,
}: setNotificationProps): AlertNotification | null => {
    if (isFreeTrial) return null

    // Set the notification message
    let message = ''
    let buttonLabel = ''
    if ((oldPlan?.amount || 0) > (newPlan?.amount || 0)) {
        // Downgrade Helpdesk subscription
        message = `Your subscription will change to <strong>${
            newPlan?.name ?? ''
        }</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Helpdesk subscription
        message = `Success! Helpdesk was upgraded to <strong>${
            newPlan?.name ?? ''
        }</strong>`
        buttonLabel = 'Helpdesk Settings'
    }

    // Add the notification
    return {
        status: NotificationStatus.Success,
        style: NotificationStyle.Alert,
        showDismissButton: true,
        noAutoDismiss: true,
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
    oldPlan,
    newPlan,
    periodEnd,
    cadence = Cadence.Month,
    onClick,
    isFreeTrial,
}: setNotificationProps): AlertNotification | null => {
    if (isFreeTrial) return null

    // Set the notification message
    let message = ''
    let buttonLabel = ''

    if (!oldPlan) {
        // New AI Agent subscription
        message = 'Woohoo! You now have access to <strong>Automate!</strong>'
        buttonLabel = 'Set Up Automate'
    } else if (
        // Downgrade AI Agent subscription
        oldPlan.amount > (newPlan?.amount ?? 0)
    ) {
        message = `Your AI Agent subscription will change to <strong>${
            newPlan?.num_quota_tickets ?? 0
        } ${
            PRODUCT_INFO.automation.counter
        }/${cadence}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade AI Agent subscription
        message = `Success! You now have <strong>${
            newPlan?.num_quota_tickets ?? ''
        } ${PRODUCT_INFO.automation.counter} per ${cadence}</strong>`
        buttonLabel = 'Automate Settings'
    }

    // Add the notification
    return {
        status: NotificationStatus.Success,
        style: NotificationStyle.Alert,
        showDismissButton: true,
        noAutoDismiss: true,
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
    oldPlan,
    newPlan,
    periodEnd,
    cadence = Cadence.Month,
    onClick,
    isFreeTrial,
}: setNotificationProps): AlertNotification | null => {
    if (isFreeTrial) return null

    // Set the notification message
    let message = ''
    let buttonLabel = ''

    if (!oldPlan) {
        // New Convert subscription
        message = 'Woohoo! You now have access to <strong>Convert!</strong>'
        buttonLabel = 'Set Up Convert'
    } else if (
        // Downgrade Revenue subscription
        oldPlan.amount > (newPlan?.amount ?? 0)
    ) {
        message = `Your Convert subscription will change to <strong>${
            newPlan?.num_quota_tickets ?? 0
        } ${
            PRODUCT_INFO.convert.counter
        }/${cadence}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Convert subscription
        message = `Success! You now have <strong>${
            newPlan?.num_quota_tickets ?? ''
        } ${PRODUCT_INFO.convert.counter} per ${cadence}</strong>`
        buttonLabel = 'Convert Settings'
    }

    // Add the notification
    return {
        status: NotificationStatus.Success,
        style: NotificationStyle.Alert,
        showDismissButton: true,
        noAutoDismiss: true,
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
