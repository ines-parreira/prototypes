import { useCallback, useMemo, useState } from 'react'

import type { SelectedPlans } from '@repo/billing'
import {
    BILLING_SUPPORT_EMAIL,
    DATE_FORMAT,
    ZAPIER_BILLING_HOOK,
} from '@repo/billing'
import { useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import { useHistory } from 'react-router-dom'

import { ObjectFromEnum } from 'billing/helpers/objectFromEnum'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { isGorgiasApiError } from 'models/api/types'
import { getSubscriptionQuery } from 'models/billing/queries'
import type { ProductInfo } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'
import {
    getCadenceName,
    getProductInfo,
    isEnterprise,
} from 'models/billing/utils'
import { useConvertApi } from 'pages/convert/common/hooks/useConvertApi'
import useGetConvertStatus, {
    convertStatusKeys,
} from 'pages/convert/common/hooks/useGetConvertStatus'
import { getDefaultConvertPlanIndex } from 'pages/settings/new_billing/utils/getDefaultConvertPlanIndex'
import { handleConvertProductDowngraded } from 'pages/settings/new_billing/utils/handleConvertProductDowngraded'
import GorgiasApi from 'services/gorgiasApi'
import {
    getAvailableAutomatePlans,
    getAvailableConvertPlans,
    getAvailableHelpdeskPlans,
    getAvailableSmsPlans,
    getAvailableVoicePlans,
    getCurrentAutomatePlan,
    getCurrentConvertPlan,
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
    getCurrentProductsUsage,
    getCurrentSmsPlan,
    getCurrentVoicePlan,
    getIsVettedForPhone,
} from 'state/billing/selectors'
import type { ProductToPlanId } from 'state/billing/types'
import {
    setCurrentSubscription,
    updateSubscriptionsForPlans,
} from 'state/currentAccount/actions'
import {
    getCurrentAccountState,
    getCurrentSubscription,
    isTrialing,
} from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'
import { objKeys } from 'utils'

import { sendSupportTicket } from '../utils/sendSupportTicket'
import {
    setAutomationNotification,
    setConvertNotification,
    setHelpdeskNotification,
} from '../views/BillingProcessView/utils'

export type BillingPlansProps = {
    dispatchBillingError: (error: unknown) => void
    selectedProduct?: ProductType
    filterByCadence?: boolean
}

export const useBillingPlans = ({
    dispatchBillingError,
    selectedProduct,
    filterByCadence = false,
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
                currentUsage?.helpdesk?.meta.subscription_end_datetime,
            ).format(DATE_FORMAT),
        [currentUsage],
    )

    const cadence = useAppSelector(getCurrentHelpdeskCadence) ?? Cadence.Month

    // Helpdesk
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const helpdeskAvailablePlans = useAppSelector(
        getAvailableHelpdeskPlans,
    ).filter(
        (plan) =>
            plan.num_quota_tickets &&
            (filterByCadence ? plan.cadence === cadence : true),
    )
    const helpdeskAvailablePlansPlanIds = useMemo(
        () => helpdeskAvailablePlans.map((plan) => plan.plan_id),
        [helpdeskAvailablePlans],
    )
    const helpdeskCurrentPlanIndex = useMemo(
        () =>
            helpdeskAvailablePlansPlanIds.indexOf(
                currentHelpdeskPlan?.plan_id ?? '',
            ),
        [helpdeskAvailablePlansPlanIds, currentHelpdeskPlan],
    )

    // AI Agent
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const automateAvailablePlans = useAppSelector(
        getAvailableAutomatePlans,
    ).filter((plan) => {
        const isCurrentPlanLegacy =
            currentAutomatePlan && !currentAutomatePlan.num_quota_tickets
        return (
            plan &&
            (filterByCadence ? plan.cadence === cadence : true) &&
            (isCurrentPlanLegacy ? true : !!plan.num_quota_tickets)
        )
    })
    const isAutomateLegacyPlan = useMemo(
        () => automateAvailablePlans?.some((plan) => !plan.num_quota_tickets),
        [automateAvailablePlans],
    )
    const automationInitialIndex = Math.min(
        5,
        helpdeskCurrentPlanIndex - (isAutomateLegacyPlan ? 0 : 1),
    )

    // Voice
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const voiceAvailablePlans = useAppSelector(getAvailableVoicePlans).filter(
        (plan) => (filterByCadence ? plan.cadence === cadence : true),
    )

    const voiceInitialIndex =
        voiceAvailablePlans?.findIndex((plan) => !!plan.amount) ?? 0

    // SMS
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const smsAvailablePlans = useAppSelector(getAvailableSmsPlans).filter(
        (plan) => (filterByCadence ? plan.cadence === cadence : true),
    )
    const isVettedForPhone = useAppSelector(getIsVettedForPhone)

    const smsInitialIndex =
        smsAvailablePlans?.findIndex((plan) => !!plan.amount) ?? 0

    // Convert
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
    const convertAvailablePlans = useAppSelector(
        getAvailableConvertPlans,
    ).filter((plan) => (filterByCadence ? plan.cadence === cadence : true))
    const convertInitialIndex = getDefaultConvertPlanIndex(
        cadence,
        convertAvailablePlans,
        currentHelpdeskPlan?.name,
    )

    const { client: convertClient } = useConvertApi()
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
            (currentSmsPlan?.amount ?? 0) +
            (currentConvertPlan?.amount ?? 0)
        )
    }, [
        currentHelpdeskPlan,
        currentAutomatePlan,
        currentVoicePlan,
        currentSmsPlan,
        currentConvertPlan,
    ])

    const anyProductChanged = useMemo(
        () =>
            (currentHelpdeskPlan?.plan_id !==
                selectedPlans[ProductType.Helpdesk].plan?.plan_id &&
                selectedPlans[ProductType.Helpdesk].isSelected) ||
            (currentAutomatePlan?.plan_id !==
                selectedPlans[ProductType.Automation].plan?.plan_id &&
                selectedPlans[ProductType.Automation].isSelected) ||
            (!!currentAutomatePlan?.plan_id &&
                !selectedPlans[ProductType.Automation].isSelected) ||
            (currentVoicePlan?.plan_id !==
                selectedPlans[ProductType.Voice].plan?.plan_id &&
                selectedPlans[ProductType.Voice].isSelected) ||
            (!!currentVoicePlan?.plan_id &&
                currentVoicePlan.plan_id ===
                    selectedPlans[ProductType.Voice].plan?.plan_id &&
                !selectedPlans[ProductType.Voice].isSelected) ||
            (currentSmsPlan?.plan_id !==
                selectedPlans[ProductType.SMS].plan?.plan_id &&
                selectedPlans[ProductType.SMS].isSelected) ||
            (!!currentSmsPlan?.plan_id &&
                currentSmsPlan.plan_id ===
                    selectedPlans[ProductType.SMS].plan?.plan_id &&
                !selectedPlans[ProductType.SMS].isSelected) ||
            (currentConvertPlan?.plan_id !==
                selectedPlans[ProductType.Convert].plan?.plan_id &&
                selectedPlans[ProductType.Convert].isSelected) ||
            (!!currentConvertPlan?.plan_id &&
                currentConvertPlan.plan_id ===
                    selectedPlans[ProductType.Convert].plan?.plan_id &&
                !selectedPlans[ProductType.Convert].isSelected),
        [
            currentHelpdeskPlan,
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
            selectedPlans,
        ],
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
        ],
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
        ],
    )

    const isEnterpriseHelpdeskPlanSelected = useMemo(
        () =>
            selectedPlans[ProductType.Helpdesk].isSelected &&
            isEnterprise(selectedPlans[ProductType.Helpdesk].plan),
        [selectedPlans],
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
                        selectedPlans[ProductType.Convert].autoUpgrade,
                    ),
                },
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
        // ignore manual process (i.e creating a support ticket) for accounts that have been vetted
        if (isVettedForPhone) {
            return
        }

        const plansToBeHandledManually: ProductType[] = []
        objKeys(selectedPlans).forEach((key) => {
            if (selectedPlans[key].isSelected) {
                if (key === ProductType.SMS || key === ProductType.Voice) {
                    if (
                        selectedPlans[key].plan?.plan_id !==
                            currentSmsPlan?.plan_id &&
                        selectedPlans[key].plan?.plan_id !==
                            currentVoicePlan?.plan_id
                    ) {
                        plansToBeHandledManually.push(key)
                    }
                }
            }
        })

        // create zapier for SMS and Voice plan updates or new subscriptions, to be handled manually
        if (plansToBeHandledManually.length > 0) {
            type ProductInfoByProductType = {
                [key in ProductType]: ProductInfo
            }
            const productInfos = ObjectFromEnum<
                typeof ProductType,
                ProductInfoByProductType
            >(
                ProductType,
                (productType: ProductType): ProductInfo =>
                    getProductInfo(
                        productType,
                        selectedPlans[productType].plan,
                    ),
            )

            const productsNames = plansToBeHandledManually
                .map((product) => productInfos[product].title)
                .join(' & ')
            const subject = `${productsNames} Add-on Plan selection - ${domain}`
            const newPlans = plansToBeHandledManually.map(
                (product) =>
                    `${productInfos[product].title} plan request: ${
                        selectedPlans[product].plan?.name ?? ''
                    }`,
            )
            const message = `New ${productsNames} Add-on Request by ${domain}\nProduct(s): ${subject}\n${newPlans.join(
                '\n',
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
                        allowHTML: true,
                        status: NotificationStatus.Info,
                        style: NotificationStyle.Alert,
                        showDismissButton: true,
                        noAutoDismiss: true,
                        id: 'billing-voice-sms-request',
                    }),
                )
            } catch (error) {
                dispatchBillingError(error)
                throw error
            }
        }
    }, [
        dispatch,
        dispatchBillingError,
        domain,
        from,
        selectedPlans,
        currentSmsPlan?.plan_id,
        currentVoicePlan?.plan_id,
        isFreeTrial,
        currentHelpdeskPlan?.name,
        isVettedForPhone,
    ])

    const handleStripePlansChange = useCallback(async () => {
        const plansToBeUpdated: ProductToPlanId = {}
        const notifications: Notification[] = []

        const isPlanCadenceChanged =
            cadence !== selectedPlans[ProductType.Helpdesk].plan?.cadence

        const isNewHelpdeskPlan =
            selectedPlans[ProductType.Helpdesk].plan?.plan_id !==
            currentHelpdeskPlan?.plan_id

        const isNewAutomationPlan =
            selectedPlans[ProductType.Automation].plan?.plan_id !==
                currentAutomatePlan?.plan_id ||
            (currentAutomatePlan?.plan_id &&
                !selectedPlans[ProductType.Automation].isSelected)

        const hasConvertPlanChanged =
            selectedPlans[ProductType.Convert].plan?.plan_id !==
                currentConvertPlan?.plan_id ||
            (currentConvertPlan?.plan_id &&
                !selectedPlans[ProductType.Convert].isSelected)

        // Set notification when cadence has changed
        if (isPlanCadenceChanged) {
            const newCadence =
                selectedPlans[ProductType.Helpdesk].plan?.cadence ??
                Cadence.Month
            notifications.push({
                message: `Your billing frequency has been updated to ${getCadenceName(newCadence)}`,
                status: NotificationStatus.Success,
                style: NotificationStyle.Alert,
                showDismissButton: true,
                dismissAfter: 5000,
            })
        }

        // handle subscribe for Helpdesk plan
        if (isNewHelpdeskPlan && !isPlanCadenceChanged) {
            // Set the notification
            const notification = setHelpdeskNotification({
                oldPlan: currentHelpdeskPlan,
                newPlan: selectedPlans[ProductType.Helpdesk].plan,
                periodEnd,
                onClick: () => {
                    history.push('/app/home')
                },
                isFreeTrial,
            })

            // Add the notification
            !!notification && notifications.push(notification)
        }

        if (selectedPlans[ProductType.Helpdesk]?.plan?.product) {
            const plan = selectedPlans[ProductType.Helpdesk]?.plan
            if (plan) {
                plansToBeUpdated[plan.product] = plan.plan_id
            }
        }

        if (isVettedForPhone) {
            if (
                selectedPlans[ProductType.Voice].isSelected &&
                selectedPlans[ProductType.Voice]?.plan?.product
            ) {
                const plan = selectedPlans[ProductType.Voice]?.plan

                if (plan) {
                    plansToBeUpdated[plan.product] = plan.plan_id
                }
            }

            if (
                selectedPlans[ProductType.SMS].isSelected &&
                selectedPlans[ProductType.SMS]?.plan?.product
            ) {
                const plan = selectedPlans[ProductType.SMS]?.plan

                if (plan) {
                    plansToBeUpdated[plan.product] = plan.plan_id
                }
            }
        }

        // handle subscribe for AI Agent plan
        if (selectedPlans[ProductType.Automation].isSelected) {
            if (isNewAutomationPlan && !isPlanCadenceChanged) {
                const notification = setAutomationNotification({
                    oldPlan: currentAutomatePlan,
                    newPlan: selectedPlans[ProductType.Automation].plan,
                    periodEnd,
                    onClick: () => {
                        history.push('/app/automation')
                    },
                    cadence: cadence,
                    isFreeTrial,
                })

                // Add the notification
                !!notification && notifications.push(notification)
            }

            if (selectedPlans[ProductType.Automation]?.plan?.product) {
                const plan = selectedPlans[ProductType.Automation]?.plan

                if (plan) {
                    plansToBeUpdated[plan.product] = plan.plan_id
                }
            }
        }

        // handle subscribe for Convert plan
        if (selectedPlans[ProductType.Convert].isSelected) {
            if (hasConvertPlanChanged && !isPlanCadenceChanged) {
                const notification = setConvertNotification({
                    oldPlan: currentConvertPlan,
                    newPlan: selectedPlans[ProductType.Convert].plan,
                    periodEnd,
                    onClick: () => {
                        history.push('/app/convert')
                    },
                    cadence: cadence,
                    isFreeTrial,
                })

                // Add the notification
                !!notification && notifications.push(notification)
            }

            if (hasConvertPlanChanged) {
                handleConvertProductDowngraded(
                    currentConvertPlan,
                    selectedPlans[ProductType.Convert].plan,
                    domain,
                )
            }

            if (selectedPlans[ProductType.Convert]?.plan?.product) {
                const plan = selectedPlans[ProductType.Convert]?.plan

                if (plan) {
                    plansToBeUpdated[plan.product] = plan.plan_id
                }
            }
        }

        // update subscription for Helpdesk and AI Agent plans
        if (Object.keys(plansToBeUpdated).length > 0) {
            // AI Agent has been removed while in free trial
            if (
                isFreeTrial &&
                !!currentAutomatePlan &&
                selectedPlans[ProductType.Automation].isSelected === false
            ) {
                notifications.push({
                    message: 'You have removed AI Agent from your subscription',
                    status: NotificationStatus.Success,
                    style: NotificationStyle.Alert,
                })
            }

            try {
                if (anyProductChanged) {
                    setIsSubscriptionUpdating(true)
                    await dispatch(
                        updateSubscriptionsForPlans(
                            plansToBeUpdated,
                            notifications,
                        ),
                    )
                    // Invalidate subscription to refresh "Active until" badges and derived data
                    void queryClient.invalidateQueries({
                        queryKey: getSubscriptionQuery.queryKey,
                    })
                }
            } catch (error) {
                dispatchBillingError(error)
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
        periodEnd,
        isFreeTrial,
        isVettedForPhone,
        history,
        cadence,
        domain,
        anyProductChanged,
        dispatch,
        dispatchBillingError,
        queryClient,
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
                    }),
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
                    }),
                )
            }
        } catch (exception) {
            const error = exception as Record<string, unknown>
            const errorMsg = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to update payment method. Please try again in a few seconds.'
            await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    title: errorMsg,
                }),
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
        currentHelpdeskPlan,
        helpdeskAvailablePlans,
        currentAutomatePlan,
        automateAvailablePlans,
        automationInitialIndex,
        currentVoicePlan,
        voiceAvailablePlans,
        voiceInitialIndex,
        currentSmsPlan,
        smsAvailablePlans,
        smsInitialIndex,
        currentConvertPlan,
        convertAvailablePlans,
        convertInitialIndex,
        selectedPlans,
        setSelectedPlans,
        cadence,
        isEnterpriseHelpdeskPlanSelected,
        isSubscriptionCanceled,
        isSubscriptionUpdating,
        convertAutoUpgrade,
        autoUpgradeChanged,
    }
}
