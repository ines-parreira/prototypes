import type { ElementType, ReactNode } from 'react'
import { useMemo, useRef, useState } from 'react'

import type { SelectedPlans } from '@repo/billing'
import {
    BILLING_BASE_PATH,
    BILLING_SUPPORT_EMAIL,
    buildPlansByProduct,
    useBillingState,
    ZAPIER_BILLING_HOOK,
} from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn, useEffectOnce } from '@repo/hooks'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'
import { Modal, ModalFooter } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { ScheduledChange } from '@gorgias/helpdesk-types'
import { ChangeType } from '@gorgias/helpdesk-types'

import { useAppNode } from 'appNode'
import { UserRole } from 'config/types/user'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { isGorgiasApiError } from 'models/api/types'
import { getSubscriptionQuery } from 'models/billing/queries'
import type { AutomatePlan, Plan } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import { isEnterprise, isYearlyContractPlan } from 'models/billing/utils'
import { ConfirmChangesModal } from 'pages/settings/new_billing/components/ConfirmChangesModal'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal/ContactSupportModal'
import type { ContactSupportModalProps } from 'pages/settings/new_billing/components/ContactSupportModal/ContactSupportModal'
import { useCurrentPlanIds } from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import { useIsPaymentMethodMissing } from 'pages/settings/new_billing/hooks/useIsPaymentMethodMissing'
import { isPendingInvoiceError } from 'pages/settings/new_billing/utils/isPendingInvoiceError'
import { isVersionConflictError } from 'pages/settings/new_billing/utils/isVersionConflictError'
import {
    getAvailableAutomatePlans,
    getAvailableConvertPlans,
    getAvailableHelpdeskPlans,
    getAvailableSmsPlans,
    getAvailableVoicePlans,
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
    getCurrentPlansByProduct,
} from 'state/billing/selectors'
import {
    updateSubscription,
    updateSubscriptionsForPlans,
} from 'state/currentAccount/actions'
import * as currentAccountConstants from 'state/currentAccount/constants'
import {
    getCurrentAccountState,
    getIsCurrentSubscriptionCanceled,
    isTrialing,
} from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { hasRole } from 'utils'

import AutomateModalStep from './AutomateModalStep'
import { buildAutomateProductsToSubmit } from './buildAutomateProductsToSubmit'
import ROICalculatorModalStep from './ROICalculatorModalStep'

import css from './AutomateSubscriptionModal.less'

type Props = {
    confirmLabel: string
    footer?: ElementType
    image?: string
    headerDescription?: string
    isOpen: boolean
    showROICalculatorStep?: boolean
    setShowROICalculatorStep?: (value: boolean) => void
    onClose: () => void
    onSubscribe?: () => void
    fade?: boolean
}
type FooterProps = {
    onConfirm: () => void
    isUpdating: boolean
    isDisabled?: boolean
    disabledTooltip?: ReactNode
}

type ContactSupportRequest = Pick<
    ContactSupportModalProps,
    'domain' | 'from' | 'subject' | 'to' | 'zapierHook'
>

type ContentProps = Props & {
    onOpenContactSupport: (request: ContactSupportRequest) => void
}

const SUBSCRIPTION_LEVEL_SCHEDULED_CHANGE_TYPES = new Set<ChangeType>([
    ChangeType.ContractCadenceChange,
    ChangeType.InvoiceCadenceChange,
    ChangeType.PricingGenerationChange,
])

const SCHEDULED_CHANGES_TOOLTIP =
    'A subscription change is already scheduled. Please wait for it to apply or contact our team to make another change.'

const isSubscriptionLevelScheduledChange = (change: ScheduledChange) =>
    change.scheduled_change_types.some((type) =>
        SUBSCRIPTION_LEVEL_SCHEDULED_CHANGE_TYPES.has(type),
    )

const isAutomationScheduledChange = (
    change: ScheduledChange,
    currentAutomationPlanId?: string,
) =>
    change.scheduled_plan?.product === ProductType.Automation ||
    (!!currentAutomationPlanId &&
        change.current_plan_id === currentAutomationPlanId)

export const DefaultFooter = ({
    confirmLabel,
    disabledTooltip,
    isUpdating,
    isDisabled,
    onClose,
    onConfirm,
}: Pick<Props, 'confirmLabel' | 'onClose'> & FooterProps) => {
    const buttonWrapper = useRef<HTMLDivElement>(null)
    const currentUser = useAppSelector(getCurrentUser)
    const userIsAdmin = hasRole(currentUser, UserRole.Admin)
    const tooltip =
        disabledTooltip ??
        (!userIsAdmin ? 'Reach out to an admin to upgrade.' : undefined)

    return (
        <ModalFooter className={css.footer}>
            <Button intent="secondary" onClick={onClose}>
                Cancel
            </Button>
            <div ref={buttonWrapper}>
                <Button
                    isLoading={isUpdating}
                    onClick={onConfirm}
                    isDisabled={!userIsAdmin || isDisabled}
                >
                    {confirmLabel}
                </Button>
            </div>
            {tooltip && <Tooltip target={buttonWrapper}>{tooltip}</Tooltip>}
        </ModalFooter>
    )
}

const AutomateSubscriptionModal = (props: Props) => {
    const [contactSupportRequest, setContactSupportRequest] =
        useState<ContactSupportRequest | null>(null)

    return (
        <>
            {props.isOpen && (
                <AutomateSubscriptionModalContent
                    {...props}
                    onOpenContactSupport={setContactSupportRequest}
                />
            )}
            {contactSupportRequest && (
                <ContactSupportModal
                    isOpen
                    handleOnClose={() => setContactSupportRequest(null)}
                    {...contactSupportRequest}
                />
            )}
        </>
    )
}

const AutomateSubscriptionModalContent = ({
    confirmLabel,
    footer: Footer = DefaultFooter,
    image,
    headerDescription,
    isOpen,
    onClose,
    onSubscribe,
    fade = true,
    showROICalculatorStep = false,
    setShowROICalculatorStep,
    onOpenContactSupport,
}: ContentProps) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const queryClient = useQueryClient()
    const { hasAccess } = useAiAgentAccess()
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const cadence = useAppSelector(getCurrentHelpdeskCadence)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const currentPlansByProduct = useAppSelector(getCurrentPlansByProduct)
    const currentPlanIds = useCurrentPlanIds()
    const helpdeskAvailablePlans = useAppSelector(getAvailableHelpdeskPlans)
    const automateAvailablePlansAll = useAppSelector(getAvailableAutomatePlans)
    const voiceAvailablePlans = useAppSelector(getAvailableVoicePlans)
    const smsAvailablePlans = useAppSelector(getAvailableSmsPlans)
    const convertAvailablePlans = useAppSelector(getAvailableConvertPlans)
    const helpdeskAvailablePlansIds = helpdeskAvailablePlans
        .filter((plan) => plan.cadence === cadence)
        .map((plan) => plan.plan_id)
    const isYearlyPlan = isYearlyContractPlan(currentHelpdeskPlan)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const appNode = useAppNode()
    const billingState = useBillingState()
    const subscription = billingState.data?.subscription

    const isCurrentSubscriptionCanceled = useAppSelector(
        getIsCurrentSubscriptionCanceled,
    )
    const isActiveSubscription =
        !isTrialingSubscription && !isCurrentSubscriptionCanceled
    const isPaymentMethodMissing = useIsPaymentMethodMissing({
        isActiveSubscription,
    })

    const isMidCycleUpgradeEnabled = useFlag(
        FeatureFlagKey.MidCycleUpgradeBillingLogic,
    )
    const hasBlockingScheduledChange = useMemo(
        () =>
            !!subscription?.scheduled_changes.some(
                (scheduledChange) =>
                    isSubscriptionLevelScheduledChange(scheduledChange) ||
                    isAutomationScheduledChange(
                        scheduledChange,
                        currentPlansByProduct?.automation?.plan_id,
                    ),
            ),
        [
            subscription?.scheduled_changes,
            currentPlansByProduct?.automation?.plan_id,
        ],
    )
    const scheduledChangesBlocking =
        isMidCycleUpgradeEnabled && hasBlockingScheduledChange
    const shouldUseMidCyclePreview =
        isMidCycleUpgradeEnabled && isActiveSubscription
    const canOpenMidCyclePreview =
        shouldUseMidCyclePreview && !!subscription && !!cadence
    const isBillingSubscriptionLoading =
        shouldUseMidCyclePreview && billingState.isLoading
    const allowOpenForPaymentBanner =
        shouldUseMidCyclePreview && isPaymentMethodMissing
    const isUpdateDisabled =
        scheduledChangesBlocking || isBillingSubscriptionLoading
    const disabledTooltip = scheduledChangesBlocking
        ? SCHEDULED_CHANGES_TOOLTIP
        : undefined

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const planIdsWithoutAutomate = currentPlanIds.filter(
        (planId) => planId !== currentPlansByProduct?.automation?.plan_id,
    )

    const [{ loading: isSubscriptionUpdating }, handleSubscriptionUpdate] =
        useAsyncFn(
            async (prices: string[]) => {
                // updateSubscription resolves with the dispatched action;
                // failures land as UPDATE_SUBSCRIPTION_ERROR rather than throws.
                const action = (await dispatch(
                    updateSubscription({ prices }),
                )) as { type?: string; error?: unknown } | undefined
                if (
                    action?.type ===
                    currentAccountConstants.UPDATE_SUBSCRIPTION_ERROR
                ) {
                    const error = action.error
                    reportError(
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    )
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: isGorgiasApiError(error)
                                ? error.response.data.error.msg
                                : "Sorry, we couldn't update your subscription. Please try again.",
                        }),
                    )
                    return false
                }
                onClose()
                return true
            },
            [dispatch, onClose],
        )
    const header = headerDescription
        ? headerDescription
        : hasAccess
          ? 'Manage AI Agent'
          : 'Subscribe to AI Agent'

    const handleUnsubscribeClick = () => {
        if (currentHelpdeskPlan) {
            void handleSubscriptionUpdate(planIdsWithoutAutomate)
        }
    }

    const automateAvailablePlans = useMemo(
        () =>
            automateAvailablePlansAll.filter(
                (plan) => plan.num_quota_tickets && plan.cadence === cadence,
            ),
        [automateAvailablePlansAll, cadence],
    )

    const helpdeskOptionIndex = Math.max(
        helpdeskAvailablePlansIds.indexOf(currentHelpdeskPlan?.plan_id || ''),
        0,
    )

    const automatePreselectedOption = Math.min(5, helpdeskOptionIndex)
    const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(
        automateAvailablePlans?.[automatePreselectedOption],
    )

    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
    const [hasPendingInvoiceError, setHasPendingInvoiceError] = useState(false)
    const [hasVersionConflictError, setHasVersionConflictError] =
        useState(false)

    const isMidCyclePreviewUnavailable =
        shouldUseMidCyclePreview && !canOpenMidCyclePreview
    const isSubscribeDisabled =
        scheduledChangesBlocking ||
        isBillingSubscriptionLoading ||
        isMidCyclePreviewUnavailable ||
        (!isSubscriptionEnabled && !allowOpenForPaymentBanner)

    const isEnterprisePlan = useMemo(
        () => isEnterprise(selectedPlan),
        [selectedPlan],
    )

    const [showStep, setShowStep] = useState(false)

    const plansByProduct = useMemo(
        () =>
            buildPlansByProduct(
                {
                    helpdesk: currentHelpdeskPlan,
                    automation: currentPlansByProduct?.automation,
                    voice: currentPlansByProduct?.voice,
                    sms: currentPlansByProduct?.sms,
                    convert: currentPlansByProduct?.convert,
                },
                {
                    helpdesk: helpdeskAvailablePlans,
                    automation: automateAvailablePlansAll,
                    voice: voiceAvailablePlans,
                    sms: smsAvailablePlans,
                    convert: convertAvailablePlans,
                },
            ),
        [
            currentHelpdeskPlan,
            helpdeskAvailablePlans,
            currentPlansByProduct,
            automateAvailablePlansAll,
            voiceAvailablePlans,
            smsAvailablePlans,
            convertAvailablePlans,
        ],
    )

    const selectedPlans: SelectedPlans = useMemo(
        () => ({
            [ProductType.Helpdesk]: {
                plan: currentHelpdeskPlan,
                isSelected: !!currentHelpdeskPlan,
            },
            [ProductType.Automation]: {
                plan: selectedPlan as AutomatePlan | undefined,
                isSelected: !!selectedPlan,
            },
            [ProductType.Voice]: {
                plan: currentPlansByProduct?.voice,
                isSelected: !!currentPlansByProduct?.voice,
            },
            [ProductType.SMS]: {
                plan: currentPlansByProduct?.sms,
                isSelected: !!currentPlansByProduct?.sms,
            },
            [ProductType.Convert]: {
                plan: currentPlansByProduct?.convert,
                isSelected: !!currentPlansByProduct?.convert,
            },
        }),
        [currentHelpdeskPlan, selectedPlan, currentPlansByProduct],
    )

    const totalProductAmount = useMemo(
        () =>
            (currentHelpdeskPlan?.amount ?? 0) +
            (currentPlansByProduct?.automation?.amount ?? 0) +
            (currentPlansByProduct?.voice?.amount ?? 0) +
            (currentPlansByProduct?.sms?.amount ?? 0) +
            (currentPlansByProduct?.convert?.amount ?? 0),
        [currentHelpdeskPlan, currentPlansByProduct],
    )

    const currency = helpdeskAvailablePlans[0]?.currency ?? 'usd'

    const [{ loading: isConfirmSubmitting }, handleConfirmSubscription] =
        useAsyncFn(async () => {
            if (!selectedPlan?.plan_id || !subscription) return
            setHasPendingInvoiceError(false)
            setHasVersionConflictError(false)
            try {
                const productsToSubmit = buildAutomateProductsToSubmit(
                    selectedPlan,
                    currentPlansByProduct,
                )
                await dispatch(
                    updateSubscriptionsForPlans({
                        products: productsToSubmit,
                        notifications: [
                            {
                                status: NotificationStatus.Success,
                                message: 'Your subscription was updated.',
                            },
                        ],
                        subscriptionResourceVersion:
                            subscription.resource_version,
                        subscriptionRenewalRampResourceVersion:
                            subscription.schedule_resource_version ?? undefined,
                    }),
                )
                void queryClient.invalidateQueries({
                    queryKey: getSubscriptionQuery.queryKey,
                })
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.billing.getBillingState(),
                })
                setIsConfirmModalOpen(false)
                onSubscribe?.()
                onClose()
                history.push(BILLING_BASE_PATH)
            } catch (error) {
                if (isPendingInvoiceError(error)) {
                    setHasPendingInvoiceError(true)
                } else if (isVersionConflictError(error)) {
                    setHasVersionConflictError(true)
                } else {
                    reportError(
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    )
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            showDismissButton: true,
                            message: isGorgiasApiError(error)
                                ? error.response.data.error.msg
                                : "Sorry, we couldn't update your subscription. Please try again.",
                        }),
                    )
                }
            }
        }, [
            selectedPlan,
            subscription,
            currentPlansByProduct,
            dispatch,
            queryClient,
            onSubscribe,
            onClose,
            history,
        ])

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false)
        setHasPendingInvoiceError(false)
        setHasVersionConflictError(false)
    }

    const onConfirm = () => {
        logEvent(SegmentEvent.AutomatePaywallModalUpsellSubscribe, {
            location: history?.location.pathname,
        })
        if (shouldUseMidCyclePreview) {
            // No-op when subscription/cadence are still loading; the Subscribe
            // CTA is already disabled via isSubscribeDisabled in this state.
            if (canOpenMidCyclePreview) {
                setIsConfirmModalOpen(true)
            }
            return
        }
        if (selectedPlan?.plan_id) {
            void handleSubscriptionUpdate([
                ...currentPlanIds,
                selectedPlan.plan_id,
            ]).then((didUpdate) => {
                if (!didUpdate) return
                onSubscribe?.()
                history.push(BILLING_BASE_PATH)
            })
        }
    }

    const onConfirmEnterprise = () => {
        onOpenContactSupport({
            domain,
            from,
            to: BILLING_SUPPORT_EMAIL,
            subject: isEnterprisePlan
                ? `New Enterprise plan request - ${domain}`
                : `New custom plan request for yearly contract subscription - ${domain}`,
            zapierHook: ZAPIER_BILLING_HOOK,
        })
        onClose()
    }

    const onSelectPlanClick = () => {
        setShowROICalculatorStep?.(false)
        setShowStep(true)
    }

    const handleOnClose = () => {
        setShowStep(false)
        onClose()
    }

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomatePaywallModalUpsell, {
            location: history?.location.pathname,
        })
    })

    return (
        <>
            <Modal
                isOpen={isOpen && !isConfirmModalOpen}
                toggle={handleOnClose}
                className={classnames(css.modal, {
                    [css.wide]: false,
                })}
                fade={fade}
                centered
                container={appNode ?? undefined}
            >
                {showROICalculatorStep ? (
                    <ROICalculatorModalStep
                        onSelectPlanClick={onSelectPlanClick}
                        handleOnClose={handleOnClose}
                    />
                ) : (
                    <AutomateModalStep
                        handleOnClose={handleOnClose}
                        automateAvailablePlans={automateAvailablePlans}
                        hasAutomate={hasAccess}
                        header={header}
                        isTrialingSubscription={isTrialingSubscription}
                        isEnterprisePlan={isEnterprisePlan}
                        cadence={cadence}
                        selectedPlan={selectedPlan}
                        setSelectedPlan={setSelectedPlan}
                        setIsSubscriptionEnabled={setIsSubscriptionEnabled}
                        image={image}
                        handleUnsubscribeClick={handleUnsubscribeClick}
                        footer={Footer}
                        isSubscriptionUpdating={isSubscriptionUpdating}
                        onConfirmEnterprise={onConfirmEnterprise}
                        showStep={showStep}
                        setShowROICalculatorStep={setShowROICalculatorStep}
                        onConfirm={onConfirm}
                        confirmLabel={confirmLabel}
                        isYearlyPlan={isYearlyPlan}
                        isSubscribeDisabled={isSubscribeDisabled}
                        isUpdateDisabled={isUpdateDisabled}
                        isSelectionBlocked={scheduledChangesBlocking}
                        disabledTooltip={disabledTooltip}
                    />
                )}
            </Modal>
            {canOpenMidCyclePreview && (
                <ConfirmChangesModal
                    isOpen={isConfirmModalOpen}
                    onClose={handleCloseConfirmModal}
                    onConfirm={() => void handleConfirmSubscription()}
                    isConfirming={isConfirmSubmitting}
                    selectedPlans={selectedPlans}
                    cadence={cadence}
                    periodEnd={subscription.current_billing_cycle_end_datetime}
                    plansByProduct={plansByProduct}
                    totalProductAmount={totalProductAmount}
                    totalCancelledAmount={0}
                    cancelledProducts={[]}
                    currency={currency}
                    subscriptionResourceVersion={subscription.resource_version}
                    subscriptionRenewalRampResourceVersion={
                        subscription.schedule_resource_version ?? undefined
                    }
                    pendingInvoiceError={hasPendingInvoiceError}
                    versionConflictError={hasVersionConflictError}
                    isPaymentMethodMissing={isPaymentMethodMissing}
                />
            )}
        </>
    )
}

export default AutomateSubscriptionModal
