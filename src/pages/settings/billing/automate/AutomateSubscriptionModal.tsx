import React, {ElementType, useEffect, useMemo, useRef, useState} from 'react'
import {Modal, ModalFooter} from 'reactstrap'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'
import {Tooltip} from '@gorgias/ui-kit'

import {useAppNode} from 'appNode'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    getAvailableAutomatePlans,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskPlan,
    getHasAutomate,
    getAvailableHelpdeskPlans,
} from 'state/billing/selectors'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'

import {
    BILLING_BASE_PATH,
    BILLING_SUPPORT_EMAIL,
    ENTERPRISE_PRICE_ID,
    ZAPIER_BILLING_HOOK,
} from 'pages/settings/new_billing/constants'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal/ContactSupportModal'
import {
    getCurrentAccountState,
    isTrialing,
} from 'state/currentAccount/selectors'
import {useCurrentPriceIds} from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import {Plan} from 'models/billing/types'
import {SegmentEvent, logEvent} from 'common/segment'
import css from './AutomateSubscriptionModal.less'
import ROICalculatorModalStep from './ROICalculatorModalStep'
import AutomateModalStep from './AutomateModalStep'

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
    const hasAutomate = useAppSelector(getHasAutomate)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const isTrialingSubscription = useAppSelector(isTrialing)
    const helpdeskAvailablePlans = useAppSelector(getAvailableHelpdeskPlans)
    const helpdeskAvailablePlansPriceIds = helpdeskAvailablePlans
        .filter((plan) => plan.interval === interval)
        .map((plan) => plan.price_id)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const appNode = useAppNode()

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const currentPriceIds: string[] = useCurrentPriceIds()
    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(async (prices: string[]) => {
            try {
                await dispatch(updateSubscription({prices}))
                onClose()
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: String(error),
                    })
                )
            }
        }, [])
    const header = headerDescription
        ? headerDescription
        : hasAutomate
          ? 'Manage Automate'
          : 'Subscribe to Automate'

    const onConfirm = () => {
        logEvent(SegmentEvent.AutomatePaywallModalUpsellSubscribe, {
            location: history?.location.pathname,
        })
        selectedPlan?.price_id &&
            void handleSubscriptionUpdate([
                ...currentPriceIds,
                selectedPlan.price_id,
            ]).then(() => onSubscribe && onSubscribe())
        history.push(BILLING_BASE_PATH)
    }

    const handleUnsubscribeClick = () => {
        currentHelpdeskPlan &&
            void handleSubscriptionUpdate([currentHelpdeskPlan.price_id])
    }

    const automateAvailablePlans = useAppSelector(
        getAvailableAutomatePlans
    ).filter((plan) => plan.num_quota_tickets && plan.interval === interval)
    const helpdeskOptionIndex = Math.max(
        helpdeskAvailablePlansPriceIds.indexOf(
            currentHelpdeskPlan?.price_id || ''
        ),
        0
    )

    const automatePreselectedOption = Math.min(5, helpdeskOptionIndex)
    const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(
        automateAvailablePlans?.[automatePreselectedOption]
    )

    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)
    const [showContactSupportModal, setShowContactSupportModal] =
        useState(false)

    const isEnterprisePlan = useMemo(
        () => selectedPlan?.price_id === ENTERPRISE_PRICE_ID,
        [selectedPlan]
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
                        hasAutomate={hasAutomate}
                        header={header}
                        isTrialingSubscription={isTrialingSubscription}
                        isEnterprisePlan={isEnterprisePlan}
                        interval={interval}
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
                    />
                )}
            </Modal>
            {isEnterprisePlan && (
                <ContactSupportModal
                    isOpen={showContactSupportModal}
                    handleOnClose={onCloseEnterprise}
                    domain={domain}
                    from={from}
                    to={BILLING_SUPPORT_EMAIL}
                    subject={`New Enterprise plan request - ${domain}}`}
                    zapierHook={ZAPIER_BILLING_HOOK}
                />
            )}
        </>
    )
}

export default AutomateSubscriptionModal
