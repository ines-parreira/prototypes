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
    getCurrentProductsUsage,
    getCurrentVoiceProduct,
    getHelpdeskPrices,
    getSMSProduct,
    getVoiceProduct,
} from 'state/billing/selectors'
import {PlanInterval, ProductType} from 'models/billing/types'
import {objKeys} from 'utils'
import {
    getCurrentAccountState,
    getCurrentSubscription,
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
import {
    setCurrentSubscription,
    updateSubscriptionsForPlans,
} from 'state/currentAccount/actions'
import {isStarterTierPrice} from 'models/billing/utils'
import GorgiasApi from 'services/gorgiasApi'
import {isGorgiasApiError} from 'models/api/types'
import {
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
    selectedProduct?: ProductType
    filterByInterval?: boolean
}

export const useBillingPlans = ({
    contactBilling,
    dispatchBillingError,
    selectedProduct,
    filterByInterval = false,
}: BillingPlansProps) => {
    const history = useHistory()
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const domain: string = currentAccount.get('domain')
    const currentUser = useAppSelector(getCurrentUser)
    const from: string = currentUser.get('email')
    const currentUsage = useAppSelector(getCurrentProductsUsage)
    const isFreeTrial = useAppSelector(isTrialing)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isSubscriptionCanceled = currentSubscription.isEmpty()

    const periodEnd = useMemo(
        () =>
            moment(
                currentUsage.helpdesk?.meta.subscription_end_datetime
            ).format(DATE_FORMAT),
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

    const voiceInitialIndex =
        voicePrices?.findIndex((price) => !!price.amount) ?? 0

    // SMS
    const smsProduct = useAppSelector(getCurrentSMSProduct)
    const smsPrices = useAppSelector(getSMSProduct)?.prices.filter((price) =>
        filterByInterval ? price.interval === interval : true
    )

    const smsInitialIndex = smsPrices?.findIndex((price) => !!price.amount) ?? 0

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
            plan: voiceProduct || voicePrices?.[voiceInitialIndex],
            isSelected: !!voiceProduct || selectedProduct === ProductType.Voice,
        },
        [ProductType.SMS]: {
            plan: smsProduct || smsPrices?.[smsInitialIndex],
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
            (!!automationProduct?.price_id &&
                !selectedPlans[ProductType.Automation].isSelected) ||
            (voiceProduct?.price_id !==
                selectedPlans[ProductType.Voice].plan?.price_id &&
                selectedPlans[ProductType.Voice].isSelected) ||
            (!!voiceProduct?.price_id &&
                voiceProduct.price_id ===
                    selectedPlans[ProductType.Voice].plan?.price_id &&
                !selectedPlans[ProductType.Voice].isSelected) ||
            (smsProduct?.price_id !==
                selectedPlans[ProductType.SMS].plan?.price_id &&
                selectedPlans[ProductType.SMS].isSelected) ||
            (!!smsProduct?.price_id &&
                smsProduct.price_id ===
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

    const isIntervalChanged = useMemo(
        () => interval !== selectedPlans[ProductType.Helpdesk].plan?.interval,
        [interval, selectedPlans]
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
            } catch (error) {
                dispatchBillingError()
                throw error
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
        isFreeTrial,
        helpdeskProduct?.name,
    ])

    const handleHelpdeskAndAutomationPlansChange = useCallback(async () => {
        const plansToBeUpdated: string[] = []
        const notifications: Notification[] = []

        const isNewHelpdeskProduct =
            selectedPlans[ProductType.Helpdesk].plan?.price_id !==
            helpdeskProduct?.price_id

        const isNewAutomationProduct =
            selectedPlans[ProductType.Automation].plan?.price_id !==
                automationProduct?.price_id ||
            (automationProduct?.price_id &&
                !selectedPlans[ProductType.Automation].isSelected)

        // Set notification when interval is changing
        if (isIntervalChanged) {
            notifications.push({
                message: 'Your billing frequency has been updated to yearly',
                status: NotificationStatus.Success,
                style: NotificationStyle.Alert,
                showIcon: true,
                showDismissButton: true,
                noAutoDismiss: true,
            })
        }

        // handle subscribe for Helpdesk plan
        if (isNewHelpdeskProduct && !isIntervalChanged) {
            // Set the notification
            const notification = setHelpdeskNotification({
                oldProduct: helpdeskProduct,
                newProduct: selectedPlans[ProductType.Helpdesk].plan,
                periodEnd,
                onClick: () => {
                    history.push('/app/home')
                },
                isFreeTrial,
            })

            // Add the notification
            !!notification && notifications.push(notification)
        }

        plansToBeUpdated.push(
            selectedPlans[ProductType.Helpdesk].plan?.price_id ?? ''
        )

        // handle subscribe for Automation plan
        if (selectedPlans[ProductType.Automation].isSelected) {
            if (isNewAutomationProduct && !isIntervalChanged) {
                const notification = setAutomationNotification({
                    oldProduct: automationProduct,
                    newProduct: selectedPlans[ProductType.Automation].plan,
                    periodEnd,
                    onClick: () => {
                        history.push('/app/automation')
                    },
                    interval,
                    isFreeTrial,
                })

                // Add the notification
                !!notification && notifications.push(notification)
            }

            plansToBeUpdated.push(
                selectedPlans[ProductType.Automation].plan?.price_id ?? ''
            )
        }

        // update subscription for Helpdesk and Automation plans
        if (plansToBeUpdated.length > 0) {
            // Automation has been removed while in free trial
            if (
                notifications.length === 0 &&
                !!automationProduct &&
                selectedPlans[ProductType.Automation].isSelected === false
            ) {
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
                if (anyProductChanged) {
                    await dispatch(
                        updateSubscriptionsForPlans(
                            {
                                prices: plansToBeUpdated,
                            },
                            notifications
                        )
                    )
                }
            } catch (error) {
                dispatchBillingError()
                throw error
            }
        }
    }, [
        selectedPlans,
        helpdeskProduct,
        automationProduct,
        isIntervalChanged,
        periodEnd,
        isFreeTrial,
        history,
        interval,
        anyProductChanged,
        dispatch,
        dispatchBillingError,
    ])

    const updateSubscription = useCallback(() => {
        return Promise.all([
            handleHelpdeskAndAutomationPlansChange(),
            handleSMSAndVoicePlansChange(),
        ])
    }, [handleHelpdeskAndAutomationPlansChange, handleSMSAndVoicePlansChange])

    const startSubscription = useCallback(async () => {
        if (!isFreeTrial && !isSubscriptionCanceled) return

        const gorgiasApi = new GorgiasApi()

        try {
            const response = await gorgiasApi.startSubscription()
            const subscription = response.get('subscription')
            dispatch(setCurrentSubscription(subscription))

            const payment: Map<any, any> | null = response.get('payment')
            if (payment!.get('confirmation_url')) {
                await dispatch(
                    notify({
                        status: NotificationStatus.Info,
                        message:
                            'In order to activate your subscription, we need you to confirm this payment to your bank. ' +
                            'You will be redirected in a few seconds to a secure page.',
                        dismissAfter: 5000,
                        dismissible: false,
                    })
                )

                setTimeout(() => {
                    history.push(payment!.get('confirmation_url'))
                }, 4500)
            } else if (payment!.get('error')) {
                void notify({
                    status: NotificationStatus.Error,
                    message: `${
                        payment!.get('error') as string
                    } Please update your payment method and retry to pay your invoice.`,
                })
            } else {
                await dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Your subscription has started!',
                    })
                )
            }
        } catch (exception) {
            const error = exception as Record<string, unknown>
            const errorMsg = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to update credit card. Please try again in a few seconds.'
            await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: errorMsg,
                })
            )
        }
    }, [dispatch, history, isFreeTrial, isSubscriptionCanceled])

    return {
        updateSubscription,
        startSubscription,
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
        voiceInitialIndex,
        smsProduct,
        smsPrices,
        smsInitialIndex,
        selectedPlans,
        setSelectedPlans,
        interval,
        isEnterpriseHelpdeskPlanSelected,
        isStarterHelpdeskPlanSelected,
        isSubscriptionCanceled,
    }
}
