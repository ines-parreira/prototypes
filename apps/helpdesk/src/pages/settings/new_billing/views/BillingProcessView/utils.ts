import type { SelectedPlans } from '@repo/billing'
import _capitalize from 'lodash/capitalize'

import type { PlanForProductType } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import { getProductInfo, isEnterprise } from 'models/billing/utils'
import type { AlertNotification } from 'state/notifications/types'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

import { formatNumTickets } from '../../utils/formatAmount'

export type setNotificationProps<T extends ProductType> = {
    oldPlan?: PlanForProductType<T>
    newPlan?: PlanForProductType<T>
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
}: setNotificationProps<ProductType.Helpdesk>): AlertNotification | null => {
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
}: setNotificationProps<ProductType.Automation>): AlertNotification | null => {
    if (isFreeTrial) return null

    const productInfo = getProductInfo(ProductType.Automation, newPlan)

    // Set the notification message
    let message = ''
    let buttonLabel = ''

    if (!oldPlan) {
        // New AI Agent subscription
        message = 'Woohoo! You now have access to <strong>AI Agent!</strong>'
        buttonLabel = 'Set Up AI Agent'
    } else if (
        // Downgrade AI Agent subscription
        oldPlan.amount > (newPlan?.amount ?? 0)
    ) {
        message = `Your AI Agent subscription will change to <strong>${
            newPlan?.num_quota_tickets ?? 0
        } ${
            productInfo.counter
        }/${cadence}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade AI Agent subscription
        message = `Success! You now have <strong>${
            newPlan?.num_quota_tickets ?? ''
        } ${productInfo.counter} per ${cadence}</strong>`
        buttonLabel = 'AI Agent Settings'
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
}: setNotificationProps<ProductType.Convert>): AlertNotification | null => {
    if (isFreeTrial) return null

    const productInfo = getProductInfo(ProductType.Convert, newPlan)

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
            productInfo.counter
        }/${cadence}</strong> on <strong>${periodEnd}</strong>.`
    } else {
        // Upgrade Convert subscription
        message = `Success! You now have <strong>${
            newPlan?.num_quota_tickets ?? ''
        } ${productInfo.counter} per ${cadence}</strong>`
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

export function buildEnterpriseMessage(
    selectedPlans: SelectedPlans,
    cadence: Cadence,
): string {
    const header =
        "Hey Gorgias, I'd like to get a quote for the following bundle of products:\n"

    const productLines = Object.values(ProductType)
        .filter((type) => selectedPlans[type]?.isSelected)
        .map((type) => {
            const selectedPlan = selectedPlans[type].plan
            const productInfo = getProductInfo(type, selectedPlan)
            const isEnterprisePlan = isEnterprise(selectedPlan)
            const tickets = `${formatNumTickets(selectedPlan?.num_quota_tickets ?? 0)}${isEnterprisePlan ? '+' : ''}`
            const suffix = isEnterprisePlan ? ' (Enterprise)' : ''

            return ` • ${_capitalize(type)} - ${tickets} ${productInfo.counter}/${cadence}${suffix}`
        })

    return header + '\n' + productLines.join('\n')
}
