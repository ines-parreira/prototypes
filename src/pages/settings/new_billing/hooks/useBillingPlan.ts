import {useCallback, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import moment from 'moment'
import {useQueryClient} from '@tanstack/react-query'
import useAppSelector from 'hooks/useAppSelector'
import {
    getAvailableAutomatePlansInProduct,
    getCurrentAutomatePlan,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskPlan,
    getCurrentSmsPlan,
    getCurrentProductsUsage,
    getCurrentVoicePlan,
    getAvailableHelpdeskPlans,
    getAvailableSmsPlansInProduct,
    getAvailableVoicePlansInProduct,
    getCurrentConvertPlan,
    getAvailableConvertPlansInProduct,
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
import {ProductData, TicketPurpose} from 'state/billing/types'
import {
    Notification,
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import {
    setCurrentSubscription,
    updateSubscriptionsForPlans,
} from 'state/currentAccount/actions'
import GorgiasApi from 'services/gorgiasApi'
import {isGorgiasApiError} from 'models/api/types'
import useGetConvertStatus, {
    convertStatusKeys,
} from 'pages/convert/common/hooks/useGetConvertStatus'
import {useConvertApi} from 'pages/convert/common/hooks/useConvertApi'
import {handleConvertProductDowngraded} from 'pages/settings/new_billing/utils/handleConvertProductDowngraded'
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
    setConvertNotification,
} from '../views/BillingProcessView/utils'
import {getDefaultConvertPriceIndex} from '../utils/getDefaultConvertPriceIndex'

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
    const queryClient = useQueryClient()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const domain: string = currentAccount.get('domain')
    const currentUser = useAppSelector(getCurrentUser)
    const from: string = currentUser.get('email')
    const currentUsage = useAppSelector(getCurrentProductsUsage)
    const isFreeTrial = useAppSelector(isTrialing)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isSubscriptionCanceled = currentSubscription.isEmpty()
    const [isSubscriptionUpdating, setIsSubscriptionUpdating] = useState(false)

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
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const helpdeskAvailablePlans = useAppSelector(
        getAvailableHelpdeskPlans
    ).filter(
        (price) =>
            price.num_quota_tickets &&
            (filterByInterval ? price.interval === interval : true)
    )
    const helpdeskAvailablePlansPriceIds = useMemo(
        () => helpdeskAvailablePlans.map((plan) => plan.price_id),
        [helpdeskAvailablePlans]
    )
    const helpdeskCurrentPriceIdIndex = useMemo(
        () =>
            helpdeskAvailablePlansPriceIds.indexOf(
                currentHelpdeskPlan?.price_id ?? ''
            ),
        [helpdeskAvailablePlansPriceIds, currentHelpdeskPlan]
    )

    // Automate
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const automateAvailablePlans = useAppSelector(
        getAvailableAutomatePlansInProduct
    )?.prices.filter((price) => {
        const isCurrentPriceLegacy =
            currentAutomatePlan && !currentAutomatePlan.num_quota_tickets
        return (
            price &&
            (filterByInterval ? price.interval === interval : true) &&
            (isCurrentPriceLegacy ? true : !!price.num_quota_tickets)
        )
    })
    const automationHasLegacyPrice = useMemo(
        () => automateAvailablePlans?.some((price) => !price.num_quota_tickets),
        [automateAvailablePlans]
    )
    const automationInitialIndex = Math.min(
        5,
        helpdeskCurrentPriceIdIndex - (automationHasLegacyPrice ? 0 : 1)
    )

    // Voice
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const voiceAvailablePlans = useAppSelector(
        getAvailableVoicePlansInProduct
    )?.prices.filter((price) =>
        filterByInterval ? price.interval === interval : true
    )

    const voiceInitialIndex =
        voiceAvailablePlans?.findIndex((price) => !!price.amount) ?? 0

    // SMS
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const smsAvailablePlans = useAppSelector(
        getAvailableSmsPlansInProduct
    )?.prices.filter((price) =>
        filterByInterval ? price.interval === interval : true
    )

    const smsInitialIndex =
        smsAvailablePlans?.findIndex((price) => !!price.amount) ?? 0

    // Convert
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
    const convertAvailablePlans = useAppSelector(
        getAvailableConvertPlansInProduct
    )?.prices.filter((price) =>
        filterByInterval ? price.interval === interval : true
    )
    const convertInitialIndex = getDefaultConvertPriceIndex(
        interval,
        convertAvailablePlans,
        currentHelpdeskPlan?.name
    )

    const {client: convertClient} = useConvertApi()
    const convertStatus = useGetConvertStatus()
    const convertAutoUpgrade = useMemo(() => {
        return (convertStatus && convertStatus.auto_upgrade_enabled) ?? false
    }, [convertStatus])

    // Selected plans
    const [selectedPlans, setSelectedPlans] = useState<SelectedPlans>({
        [ProductType.Helpdesk]: {
            plan: currentHelpdeskPlan || helpdeskAvailablePlans?.[0],
            isSelected:
                !!currentHelpdeskPlan ||
                selectedProduct === ProductType.Helpdesk,
        },
        [ProductType.Automation]: {
            plan:
                currentAutomatePlan ||
                automateAvailablePlans?.[automationInitialIndex],
            isSelected:
                !!currentAutomatePlan ||
                selectedProduct === ProductType.Automation,
        },
        [ProductType.Voice]: {
            plan: currentVoicePlan || voiceAvailablePlans?.[voiceInitialIndex],
            isSelected:
                !!currentVoicePlan || selectedProduct === ProductType.Voice,
        },
        [ProductType.SMS]: {
            plan: currentSmsPlan || smsAvailablePlans?.[smsInitialIndex],
            isSelected: !!currentSmsPlan || selectedProduct === ProductType.SMS,
        },
        [ProductType.Convert]: {
            plan:
                currentConvertPlan ||
                convertAvailablePlans?.[convertInitialIndex],
            isSelected:
                !!currentConvertPlan || selectedProduct === ProductType.Convert,
            autoUpgrade: convertAutoUpgrade,
        },
    })

    const autoUpgradeChanged = useMemo(() => {
        const convertToggle = selectedPlans[ProductType.Convert].autoUpgrade
        return (
            typeof convertToggle === 'boolean' &&
            convertAutoUpgrade !== convertToggle
        )
    }, [convertAutoUpgrade, selectedPlans])

    // Total amount for existing products
    const totalProductAmount = useMemo(() => {
        return (
            (currentHelpdeskPlan?.amount ?? 0) +
            (currentAutomatePlan?.amount ?? 0) +
            (currentVoicePlan?.amount ?? 0) +
            (currentSmsPlan?.amount ?? 0)
        )
    }, [
        currentHelpdeskPlan,
        currentAutomatePlan,
        currentVoicePlan,
        currentSmsPlan,
    ])

    const anyProductChanged = useMemo(
        () =>
            (currentHelpdeskPlan?.price_id !==
                selectedPlans[ProductType.Helpdesk].plan?.price_id &&
                selectedPlans[ProductType.Helpdesk].isSelected) ||
            (currentAutomatePlan?.price_id !==
                selectedPlans[ProductType.Automation].plan?.price_id &&
                selectedPlans[ProductType.Automation].isSelected) ||
            (!!currentAutomatePlan?.price_id &&
                !selectedPlans[ProductType.Automation].isSelected) ||
            (currentVoicePlan?.price_id !==
                selectedPlans[ProductType.Voice].plan?.price_id &&
                selectedPlans[ProductType.Voice].isSelected) ||
            (!!currentVoicePlan?.price_id &&
                currentVoicePlan.price_id ===
                    selectedPlans[ProductType.Voice].plan?.price_id &&
                !selectedPlans[ProductType.Voice].isSelected) ||
            (currentSmsPlan?.price_id !==
                selectedPlans[ProductType.SMS].plan?.price_id &&
                selectedPlans[ProductType.SMS].isSelected) ||
            (!!currentSmsPlan?.price_id &&
                currentSmsPlan.price_id ===
                    selectedPlans[ProductType.SMS].plan?.price_id &&
                !selectedPlans[ProductType.SMS].isSelected) ||
            (currentConvertPlan?.price_id !==
                selectedPlans[ProductType.Convert].plan?.price_id &&
                selectedPlans[ProductType.Convert].isSelected) ||
            (!!currentConvertPlan?.price_id &&
                currentConvertPlan.price_id ===
                    selectedPlans[ProductType.Convert].plan?.price_id &&
                !selectedPlans[ProductType.Convert].isSelected),
        [
            currentHelpdeskPlan,
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
            selectedPlans,
        ]
    )

    const anyDowngradedPlanSelected = useMemo(
        () =>
            (currentHelpdeskPlan &&
                currentHelpdeskPlan.amount >
                    (selectedPlans[ProductType.Helpdesk].plan?.amount || 0)) ||
            (currentAutomatePlan &&
                currentAutomatePlan.amount >
                    (selectedPlans[ProductType.Automation].plan?.amount ||
                        0)) ||
            (currentVoicePlan &&
                currentVoicePlan.amount >
                    (selectedPlans[ProductType.Voice].plan?.amount || 0)) ||
            (currentSmsPlan &&
                currentSmsPlan.amount >
                    (selectedPlans[ProductType.SMS].plan?.amount || 0)) ||
            (currentConvertPlan &&
                currentConvertPlan.amount >
                    (selectedPlans[ProductType.Convert].plan?.amount || 0)),
        [
            selectedPlans,
            currentHelpdeskPlan,
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
        ]
    )

    const anyNewProductSelected = useMemo(
        () =>
            (selectedPlans[ProductType.Helpdesk].isSelected &&
                !currentHelpdeskPlan) ||
            (selectedPlans[ProductType.Automation].isSelected &&
                !currentAutomatePlan) ||
            (selectedPlans[ProductType.Voice].isSelected &&
                !currentVoicePlan) ||
            (selectedPlans[ProductType.SMS].isSelected && !currentSmsPlan) ||
            (selectedPlans[ProductType.Convert].isSelected &&
                !currentConvertPlan),
        [
            selectedPlans,
            currentHelpdeskPlan,
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
        ]
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

    const isPlanCadenceChanged = useMemo(
        () => interval !== selectedPlans[ProductType.Helpdesk].plan?.interval,
        [interval, selectedPlans]
    )

    const handleAutoUpgradeChange = useCallback(async () => {
        if (!autoUpgradeChanged) return

        if (
            convertAutoUpgrade !==
            selectedPlans[ProductType.Convert].autoUpgrade
        ) {
            await convertClient?.update_auto_upgrade_flag(
                {},
                {
                    enabled: Boolean(
                        selectedPlans[ProductType.Convert].autoUpgrade
                    ),
                }
            )

            await queryClient.invalidateQueries({
                queryKey: convertStatusKeys.all(),
            })
        }
    }, [
        autoUpgradeChanged,
        convertAutoUpgrade,
        convertClient,
        queryClient,
        selectedPlans,
    ])

    const handleSMSAndVoicePlansChange = useCallback(async () => {
        const plansToBeHandledManually: ProductType[] = []
        objKeys(selectedPlans).forEach((key) => {
            if (selectedPlans[key].isSelected) {
                if (key === ProductType.SMS || key === ProductType.Voice) {
                    if (
                        selectedPlans[key].plan?.internal_id !==
                            currentSmsPlan?.internal_id &&
                        selectedPlans[key].plan?.internal_id !==
                            currentVoicePlan?.internal_id
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
                    helpdeskPlan: currentHelpdeskPlan?.name ?? '',
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
        currentSmsPlan?.internal_id,
        currentVoicePlan?.internal_id,
        isFreeTrial,
        currentHelpdeskPlan?.name,
    ])

    const handleStripePlansChange = useCallback(async () => {
        const plansToBeUpdated: ProductData = {}
        const notifications: Notification[] = []

        const isNewHelpdeskPlan =
            selectedPlans[ProductType.Helpdesk].plan?.price_id !==
            currentHelpdeskPlan?.price_id

        const isNewAutomationPlan =
            selectedPlans[ProductType.Automation].plan?.price_id !==
                currentAutomatePlan?.price_id ||
            (currentAutomatePlan?.price_id &&
                !selectedPlans[ProductType.Automation].isSelected)

        const hasConvertPlanChanged =
            selectedPlans[ProductType.Convert].plan?.price_id !==
                currentConvertPlan?.price_id ||
            (currentConvertPlan?.price_id &&
                !selectedPlans[ProductType.Convert].isSelected)

        // Set notification when interval is changing
        if (isPlanCadenceChanged) {
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
        if (isNewHelpdeskPlan && !isPlanCadenceChanged) {
            // Set the notification
            const notification = setHelpdeskNotification({
                oldProduct: currentHelpdeskPlan,
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

        if (selectedPlans[ProductType.Helpdesk]?.plan?.product_id) {
            const plan = selectedPlans[ProductType.Helpdesk]?.plan
            if (plan) {
                plansToBeUpdated[plan.product_id] = plan?.price_id ?? ''
            }
        }

        // handle subscribe for Automate plan
        if (selectedPlans[ProductType.Automation].isSelected) {
            if (isNewAutomationPlan && !isPlanCadenceChanged) {
                const notification = setAutomationNotification({
                    oldProduct: currentAutomatePlan,
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

            if (selectedPlans[ProductType.Automation]?.plan?.product_id) {
                const plan = selectedPlans[ProductType.Automation]?.plan

                if (plan) {
                    plansToBeUpdated[plan.product_id] = plan?.price_id ?? ''
                }
            }
        }

        // handle subscribe for Convert plan
        if (selectedPlans[ProductType.Convert].isSelected) {
            if (hasConvertPlanChanged && !isPlanCadenceChanged) {
                const notification = setConvertNotification({
                    oldProduct: currentConvertPlan,
                    newProduct: selectedPlans[ProductType.Convert].plan,
                    periodEnd,
                    onClick: () => {
                        history.push('/app/convert')
                    },
                    interval,
                    isFreeTrial,
                })

                // Add the notification
                !!notification && notifications.push(notification)
            }

            if (hasConvertPlanChanged) {
                handleConvertProductDowngraded(
                    currentConvertPlan,
                    selectedPlans[ProductType.Convert].plan,
                    domain
                )
            }

            if (selectedPlans[ProductType.Convert]?.plan?.product_id) {
                const plan = selectedPlans[ProductType.Convert]?.plan

                if (plan) {
                    plansToBeUpdated[plan.product_id] = plan?.price_id ?? ''
                }
            }
        }

        // update subscription for Helpdesk and Automate plans
        if (Object.keys(plansToBeUpdated).length > 0) {
            // Automate has been removed while in free trial
            if (
                notifications.length === 0 &&
                !!currentAutomatePlan &&
                selectedPlans[ProductType.Automation].isSelected === false
            ) {
                notifications.push({
                    message: 'You have removed Automate from your subscription',
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                    showIcon: true,
                })
            }
            try {
                if (anyProductChanged) {
                    setIsSubscriptionUpdating(true)
                    await dispatch(
                        updateSubscriptionsForPlans(
                            plansToBeUpdated,
                            notifications
                        )
                    )
                }
            } catch (error) {
                dispatchBillingError()
                throw error
            } finally {
                setIsSubscriptionUpdating(false)
            }
        }
    }, [
        selectedPlans,
        currentHelpdeskPlan,
        currentAutomatePlan,
        currentConvertPlan,
        isPlanCadenceChanged,
        periodEnd,
        isFreeTrial,
        history,
        interval,
        domain,
        anyProductChanged,
        dispatch,
        dispatchBillingError,
    ])

    const updateSubscription = useCallback(() => {
        return Promise.all([
            handleStripePlansChange(),
            handleAutoUpgradeChange(),
            handleSMSAndVoicePlansChange(),
        ])
    }, [
        handleStripePlansChange,
        handleAutoUpgradeChange,
        handleSMSAndVoicePlansChange,
    ])

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
        helpdeskProduct: currentHelpdeskPlan,
        helpdeskPrices: helpdeskAvailablePlans,
        automationProduct: currentAutomatePlan,
        automationPrices: automateAvailablePlans,
        automationInitialIndex,
        voiceProduct: currentVoicePlan,
        voicePrices: voiceAvailablePlans,
        voiceInitialIndex,
        smsProduct: currentSmsPlan,
        smsPrices: smsAvailablePlans,
        smsInitialIndex,
        convertProduct: currentConvertPlan,
        convertPrices: convertAvailablePlans,
        convertInitialIndex,
        selectedPlans,
        setSelectedPlans,
        interval,
        isEnterpriseHelpdeskPlanSelected,
        isSubscriptionCanceled,
        isSubscriptionUpdating,
        convertAutoUpgrade,
        autoUpgradeChanged,
    }
}
