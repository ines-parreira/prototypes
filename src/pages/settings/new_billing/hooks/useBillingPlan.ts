import {useCallback, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import moment from 'moment'
import useAppSelector from 'hooks/useAppSelector'
import {
    getAutomationProduct,
    getCurrentAutomationProduct,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskProduct,
    getCurrentSMSProduct,
    getCurrentUsage,
    getCurrentVoiceProduct,
    getHelpdeskPrices,
    getSMSProduct,
    getVoiceProduct,
} from 'state/billing/selectors'
import {PlanInterval, ProductType} from 'models/billing/types'
import {objKeys} from 'utils'
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {TicketPurpose} from 'state/billing/types'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import {updateSubscriptionsForPlans} from 'state/currentAccount/actions'
import {isStarterTierPrice} from 'models/billing/utils'
import {
    BILLING_BASE_PATH,
    BILLING_SUPPORT_EMAIL,
    DATE_FORMAT,
    ENTERPRISE_PRICE_ID,
    PRODUCT_INFO,
    ZAPIER_BILLING_HOOK,
} from '../constants'
import {SelectedPlans} from '../views/BillingProcessView/BillingProcessView'
import {sendSupportTicket} from '../utils/sendSupportTicket'
import {
    setAutomationNotification,
    setHelpdeskNotification,
} from '../views/BillingProcessView/utils'

export type BillingPlansProps = {
    contactBilling: (ticketPurpose: TicketPurpose) => void
    dispatchBillingError: () => void
    billingErrorNotification: Notification
    selectedProduct?: ProductType
    filterByInterval?: boolean
}

export const useBillingPlans = ({
    contactBilling,
    dispatchBillingError,
    billingErrorNotification,
    selectedProduct,
    filterByInterval = false,
}: BillingPlansProps) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const domain: string = currentAccount.get('domain')
    const currentUser = useAppSelector(getCurrentUser)
    const from: string = currentUser.get('email')
    const currentUsage = useAppSelector(getCurrentUsage)
    const isFreeTrial = useAppSelector(isTrialing)

    const periodEnd = useMemo(
        () =>
            moment(currentUsage.getIn(['meta', 'end_datetime'])).format(
                DATE_FORMAT
            ),
        [currentUsage]
    )

    const interval =
        useAppSelector(getCurrentHelpdeskInterval) ?? PlanInterval.Month

    // Helpdesk
    const helpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const helpdeskPrices = useAppSelector(getHelpdeskPrices).filter(
        (price) =>
            price.num_quota_tickets &&
            (filterByInterval ? price.interval === interval : true)
    )
    const helpdeskPriceIds = useMemo(
        () => helpdeskPrices.map((price) => price.price_id),
        [helpdeskPrices]
    )
    const helpdeskCurrentPriceIdIndex = useMemo(
        () => helpdeskPriceIds.indexOf(helpdeskProduct?.price_id ?? ''),
        [helpdeskPriceIds, helpdeskProduct]
    )

    // Automation
    const automationProduct = useAppSelector(getCurrentAutomationProduct)
    const automationPrices = useAppSelector(
        getAutomationProduct
    )?.prices.filter((price) => {
        const isCurrentPriceLegacy =
            automationProduct && !automationProduct.num_quota_tickets
        return (
            price &&
            (filterByInterval ? price.interval === interval : true) &&
            (isCurrentPriceLegacy ? true : !!price.num_quota_tickets)
        )
    })
    const automationHasLegacyPrice = useMemo(
        () => automationPrices?.some((price) => !price.num_quota_tickets),
        [automationPrices]
    )
    const automationInitialIndex = Math.min(
        5,
        helpdeskCurrentPriceIdIndex - (automationHasLegacyPrice ? 0 : 1)
    )

    // Voice
    const voiceProduct = useAppSelector(getCurrentVoiceProduct)
    const voicePrices = useAppSelector(getVoiceProduct)?.prices.filter(
        (price) => (filterByInterval ? price.interval === interval : true)
    )

    // SMS
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const smsPrices = useAppSelector(getSMSProduct)?.prices.filter((price) =>
        filterByInterval ? price.interval === interval : true
    )

    // Selected plans
    const [selectedPlans, setSelectedPlans] = useState<SelectedPlans>({
        [ProductType.Helpdesk]: {
            plan: helpdeskProduct || helpdeskPrices?.[0],
            isSelected:
                !!helpdeskProduct || selectedProduct === ProductType.Helpdesk,
        },
        [ProductType.Automation]: {
            plan:
                automationProduct || automationPrices?.[automationInitialIndex],
            isSelected:
                !!automationProduct ||
                selectedProduct === ProductType.Automation,
        },
        [ProductType.Voice]: {
            plan: voiceProduct || voicePrices?.[0],
            isSelected: !!voiceProduct || selectedProduct === ProductType.Voice,
        },
        [ProductType.SMS]: {
            plan: smsProduct || smsPrices?.[0],
            isSelected: !!smsProduct || selectedProduct === ProductType.SMS,
        },
    })

    // Total amount for existing products
    const totalProductAmount = useMemo(() => {
        return (
            (helpdeskProduct?.amount ?? 0) +
            (automationProduct?.amount ?? 0) +
            (voiceProduct?.amount ?? 0) +
            (smsProduct?.amount ?? 0)
        )
    }, [helpdeskProduct, automationProduct, voiceProduct, smsProduct])

    const anyProductChanged = useMemo(
        () =>
            (helpdeskProduct?.price_id !==
                selectedPlans[ProductType.Helpdesk].plan?.price_id &&
                selectedPlans[ProductType.Helpdesk].isSelected) ||
            (automationProduct?.price_id !==
                selectedPlans[ProductType.Automation].plan?.price_id &&
                selectedPlans[ProductType.Automation].isSelected) ||
            (automationProduct?.price_id ===
                selectedPlans[ProductType.Automation].plan?.price_id &&
                !selectedPlans[ProductType.Automation].isSelected) ||
            (voiceProduct?.price_id !==
                selectedPlans[ProductType.Voice].plan?.price_id &&
                selectedPlans[ProductType.Voice].isSelected) ||
            (voiceProduct?.price_id ===
                selectedPlans[ProductType.Voice].plan?.price_id &&
                !selectedPlans[ProductType.Voice].isSelected) ||
            (smsProduct?.price_id !==
                selectedPlans[ProductType.SMS].plan?.price_id &&
                selectedPlans[ProductType.SMS].isSelected) ||
            (smsProduct?.price_id ===
                selectedPlans[ProductType.SMS].plan?.price_id &&
                !selectedPlans[ProductType.SMS].isSelected),
        [
            helpdeskProduct,
            automationProduct,
            voiceProduct,
            smsProduct,
            selectedPlans,
        ]
    )

    const anyDowngradedPlanSelected = useMemo(
        () =>
            (helpdeskProduct &&
                helpdeskProduct.amount >
                    (selectedPlans[ProductType.Helpdesk].plan?.amount || 0)) ||
            (automationProduct &&
                automationProduct.amount >
                    (selectedPlans[ProductType.Automation].plan?.amount ||
                        0)) ||
            (voiceProduct &&
                voiceProduct.amount >
                    (selectedPlans[ProductType.Voice].plan?.amount || 0)) ||
            (smsProduct &&
                smsProduct.amount >
                    (selectedPlans[ProductType.SMS].plan?.amount || 0)),
        [
            selectedPlans,
            helpdeskProduct,
            automationProduct,
            voiceProduct,
            smsProduct,
        ]
    )

    const anyNewProductSelected = useMemo(
        () =>
            (selectedPlans[ProductType.Helpdesk].isSelected &&
                !helpdeskProduct) ||
            (selectedPlans[ProductType.Automation].isSelected &&
                !automationProduct) ||
            (selectedPlans[ProductType.Voice].isSelected && !voiceProduct) ||
            (selectedPlans[ProductType.SMS].isSelected && !smsProduct),
        [
            selectedPlans,
            helpdeskProduct,
            automationProduct,
            voiceProduct,
            smsProduct,
        ]
    )

    const isStarterHelpdeskPlanSelected = useMemo(
        () =>
            isStarterTierPrice(selectedPlans[ProductType.Helpdesk].plan) &&
            selectedPlans[ProductType.Helpdesk].isSelected,
        [selectedPlans]
    )

    const isEnterpriseHelpdeskPlanSelected = useMemo(
        () =>
            Object.values(selectedPlans).some(
                (plan) =>
                    plan.plan?.price_id === ENTERPRISE_PRICE_ID &&
                    plan.isSelected
            ),
        [selectedPlans]
    )

    const handleSMSAndVoicePlansChange = useCallback(async () => {
        const plansToBeHandledManually: ProductType[] = []
        objKeys(selectedPlans).forEach((key) => {
            if (selectedPlans[key].isSelected) {
                if (key === ProductType.SMS || key === ProductType.Voice) {
                    if (
                        selectedPlans[key].plan?.internal_id !==
                            smsProduct?.internal_id &&
                        selectedPlans[key].plan?.internal_id !==
                            voiceProduct?.internal_id
                    ) {
                        plansToBeHandledManually.push(key)
                    }
                }
            }
        })

        // create zapier for SMS and Voice plan updates or new subscriptions, to be handled manually
        if (plansToBeHandledManually.length > 0) {
            const productsNames = plansToBeHandledManually
                .map((product) => PRODUCT_INFO[product].title)
                .join(' & ')
            const subject = `${productsNames} Add-on Plan selection - ${domain}`
            const newPlans = plansToBeHandledManually.map(
                (product) =>
                    `${PRODUCT_INFO[product].title} plan request: ${
                        selectedPlans[product].plan?.name ?? ''
                    }`
            )
            const message = `New ${productsNames} Add-on Request by ${domain}\nProduct(s): ${subject}\n${newPlans.join(
                '\n'
            )}`

            try {
                await sendSupportTicket({
                    subject,
                    message,
                    from,
                    zapierHook: ZAPIER_BILLING_HOOK,
                    to: BILLING_SUPPORT_EMAIL,
                    account: domain,
                    freeTrial: isFreeTrial,
                    helpdeskPlan: helpdeskProduct?.name ?? '',
                })
                void dispatch(
                    notify({
                        message: `We're reviewing your <strong>${productsNames}</strong> plan${
                            plansToBeHandledManually.length > 1 ? 's' : ''
                        } request and will contact you at <b>${from}</b> within 24 business hours`,
                        actionHTML: `<span class="d-inline-flex align-items-baseline"><span class="text-primary">Contact Billing</span></span>`,
                        onClick: () => contactBilling(TicketPurpose.CONTACT_US),
                        allowHTML: true,
                        status: NotificationStatus.Info,
                        style: NotificationStyle.Alert,
                        showIcon: true,
                        showDismissButton: true,
                        noAutoDismiss: true,
                        id: 'billing-voice-sms-request',
                    })
                )
                history.push(BILLING_BASE_PATH)
            } catch (error) {
                dispatchBillingError()
            }
        }
    }, [
        contactBilling,
        dispatch,
        dispatchBillingError,
        domain,
        from,
        selectedPlans,
        smsProduct?.internal_id,
        voiceProduct?.internal_id,
        history,
        isFreeTrial,
        helpdeskProduct?.name,
    ])

    const handleHelpdeskAndAutomationPlansChange = useCallback(async () => {
        const plansToBeUpdatedAutomatically: string[] = []
        const notifications: Notification[] = []

        // handle subscribe for Helpdesk plan
        if (selectedPlans[ProductType.Helpdesk].isSelected) {
            if (
                selectedPlans[ProductType.Helpdesk].plan?.price_id !==
                helpdeskProduct?.price_id
            ) {
                // Set the notification
                const notification = setHelpdeskNotification({
                    oldProduct: helpdeskProduct,
                    newProduct: selectedPlans[ProductType.Helpdesk].plan,
                    periodEnd,
                    onClick: () => {
                        history.push('/app/settings')
                    },
                })

                // Add the notification
                notifications.push(notification)
            }
            // Add the plan to be handled automatically
            plansToBeUpdatedAutomatically.push(
                selectedPlans[ProductType.Helpdesk].plan?.price_id ?? ''
            )
        }

        // handle subscribe for Automation plan
        if (selectedPlans[ProductType.Automation].isSelected) {
            if (
                selectedPlans[ProductType.Automation].plan?.price_id !==
                automationProduct?.price_id
            ) {
                const notification = setAutomationNotification({
                    oldProduct: automationProduct,
                    newProduct: selectedPlans[ProductType.Automation].plan,
                    periodEnd,
                    onClick: () => {
                        history.push('/app/settings')
                    },
                    interval,
                })

                // Add the notification
                notifications.push(notification)
            }

            // Add the plan to be handled automatically
            plansToBeUpdatedAutomatically.push(
                selectedPlans[ProductType.Automation].plan?.price_id ?? ''
            )
        }

        // update subscription for Helpdesk and Automation plans
        if (plansToBeUpdatedAutomatically.length > 0) {
            // Automation has been removed while in free trial
            if (notifications.length === 0) {
                notifications.push({
                    message:
                        'You have removed Automation from your subscription',
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showIcon: true,
                    showDismissButton: true,
                    noAutoDismiss: true,
                })
            }
            try {
                await dispatch(
                    updateSubscriptionsForPlans(
                        {
                            prices: plansToBeUpdatedAutomatically,
                        },
                        notifications,
                        billingErrorNotification
                    )
                )
                history.push(BILLING_BASE_PATH)
            } catch (error) {
                dispatchBillingError()
            }
        }
    }, [
        selectedPlans,
        helpdeskProduct,
        automationProduct,
        periodEnd,
        history,
        interval,
        dispatch,
        billingErrorNotification,
        dispatchBillingError,
    ])

    const handleSubscribe = useCallback(() => {
        // handle Helpdesk and Automation plans
        void handleHelpdeskAndAutomationPlansChange()

        // handle SMS and Voice plans
        void handleSMSAndVoicePlansChange()
    }, [handleHelpdeskAndAutomationPlansChange, handleSMSAndVoicePlansChange])

    return {
        handleSubscribe,
        anyProductChanged,
        anyDowngradedPlanSelected,
        anyNewProductSelected,
        totalProductAmount,
        helpdeskProduct,
        helpdeskPrices,
        automationProduct,
        automationPrices,
        automationInitialIndex,
        voiceProduct,
        voicePrices,
        smsProduct,
        smsPrices,
        selectedPlans,
        setSelectedPlans,
        interval,
        isEnterpriseHelpdeskPlanSelected,
        isStarterHelpdeskPlanSelected,
    }
}
