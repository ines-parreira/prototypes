import type { ElementType } from 'react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'
import { Modal, ModalFooter } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import { UserRole } from 'config/types/user'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { Plan } from 'models/billing/types'
import { isEnterprise, isYearlyContractPlan } from 'models/billing/utils'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal/ContactSupportModal'
import {
    BILLING_BASE_PATH,
    BILLING_SUPPORT_EMAIL,
    ZAPIER_BILLING_HOOK,
} from 'pages/settings/new_billing/constants'
import { useCurrentPlanIds } from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import {
    getAvailableAutomatePlans,
    getAvailableHelpdeskPlans,
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
    getCurrentPlansByProduct,
} from 'state/billing/selectors'
import { updateSubscription } from 'state/currentAccount/actions'
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { hasRole } from 'utils'

import AutomateModalStep from './AutomateModalStep'
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
}

export const DefaultFooter = ({
    confirmLabel,
    isUpdating,
    isDisabled,
    onClose,
    onConfirm,
}: Pick<Props, 'confirmLabel' | 'onClose'> & FooterProps) => {
    const buttonWrapper = useRef<HTMLDivElement>(null)
    const currentUser = useAppSelector(getCurrentUser)
    const userIsAdmin = hasRole(currentUser, UserRole.Admin)

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
            {!userIsAdmin && (
                <Tooltip target={buttonWrapper}>
                    Reach out to an admin to upgrade.
                </Tooltip>
            )}
        </ModalFooter>
    )
}

const AutomateSubscriptionModal = ({
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
}: Props) => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { hasAccess } = useAiAgentAccess()
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const cadence = useAppSelector(getCurrentHelpdeskCadence)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const currentPlansByProduct = useAppSelector(getCurrentPlansByProduct)
    const currentPlanIds = useCurrentPlanIds()
    const helpdeskAvailablePlans = useAppSelector(getAvailableHelpdeskPlans)
    const helpdeskAvailablePlansIds = helpdeskAvailablePlans
        .filter((plan) => plan.cadence === cadence)
        .map((plan) => plan.plan_id)
    const isYearlyPlan = isYearlyContractPlan(currentHelpdeskPlan)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const appNode = useAppNode()

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const planIdsWithoutAutomate = currentPlanIds.filter(
        (planId) => planId !== currentPlansByProduct?.automation?.plan_id,
    )

    const [{ loading: isSubscriptionUpdating }, handleSubscriptionUpdate] =
        useAsyncFn(async (prices: string[]) => {
            try {
                await dispatch(updateSubscription({ prices }))
                onClose()
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: String(error),
                    }),
                )
            }
        }, [])
    const header = headerDescription
        ? headerDescription
        : hasAccess
          ? 'Manage AI Agent'
          : 'Subscribe to AI Agent'

    const onConfirm = () => {
        logEvent(SegmentEvent.AutomatePaywallModalUpsellSubscribe, {
            location: history?.location.pathname,
        })
        selectedPlan?.plan_id &&
            void handleSubscriptionUpdate([
                ...currentPlanIds,
                selectedPlan.plan_id,
            ]).then(() => onSubscribe && onSubscribe())
        history.push(BILLING_BASE_PATH)
    }

    const handleUnsubscribeClick = () => {
        currentHelpdeskPlan &&
            void handleSubscriptionUpdate(planIdsWithoutAutomate)
    }

    const automateAvailablePlans = useAppSelector(
        getAvailableAutomatePlans,
    ).filter((plan) => plan.num_quota_tickets && plan.cadence === cadence)

    const helpdeskOptionIndex = Math.max(
        helpdeskAvailablePlansIds.indexOf(currentHelpdeskPlan?.plan_id || ''),
        0,
    )

    const automatePreselectedOption = Math.min(5, helpdeskOptionIndex)
    const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(
        automateAvailablePlans?.[automatePreselectedOption],
    )

    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)
    const [showContactSupportModal, setShowContactSupportModal] =
        useState(false)

    const isEnterprisePlan = useMemo(
        () => isEnterprise(selectedPlan),
        [selectedPlan],
    )

    const [showStep, setShowStep] = useState(false)

    const onConfirmEnterprise = () => {
        setShowContactSupportModal(true)
        onClose()
    }

    const onCloseEnterprise = () => {
        setShowContactSupportModal(false)
    }

    const onSelectPlanClick = () => {
        setShowROICalculatorStep?.(false)
        setShowStep(true)
    }

    const handleOnClose = () => {
        setShowStep(false)
        onClose()
    }

    useEffect(() => {
        if (isOpen) {
            logEvent(SegmentEvent.AutomatePaywallModalUpsell, {
                location: history?.location.pathname,
            })
        }
    }, [isOpen, history])

    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={handleOnClose}
                className={classnames(css.modal, {
                    [css.wide]: false,
                })}
                fade={fade}
                centered
                container={appNode ?? undefined}
            >
                {showROICalculatorStep && (
                    <ROICalculatorModalStep
                        onSelectPlanClick={onSelectPlanClick}
                        handleOnClose={handleOnClose}
                    />
                )}
                {!showROICalculatorStep && isOpen && (
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
                        isSubscriptionEnabled={isSubscriptionEnabled}
                        isYearlyPlan={isYearlyPlan}
                    />
                )}
            </Modal>
            {(isEnterprisePlan || isYearlyPlan) && (
                <ContactSupportModal
                    isOpen={showContactSupportModal}
                    handleOnClose={onCloseEnterprise}
                    domain={domain}
                    from={from}
                    to={BILLING_SUPPORT_EMAIL}
                    subject={
                        isEnterprisePlan
                            ? `New Enterprise plan request - ${domain}`
                            : `New custom plan request for yearly contract subscription - ${domain}`
                    }
                    zapierHook={ZAPIER_BILLING_HOOK}
                />
            )}
        </>
    )
}

export default AutomateSubscriptionModal
