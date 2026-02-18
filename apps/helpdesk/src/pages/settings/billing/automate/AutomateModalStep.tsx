import classNames from 'classnames'
import { ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { AutomatePlan, Cadence, Plan } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import PlanSubscriptionDescription from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'

import css from './AutomateSubscriptionModal.less'

type Props = {
    handleOnClose: () => void
    hasAutomate: boolean
    header: string
    automateAvailablePlans: AutomatePlan[]
    isTrialingSubscription: boolean
    isEnterprisePlan: boolean
    cadence?: Cadence
    selectedPlan?: Plan
    setSelectedPlan: React.Dispatch<React.SetStateAction<Plan | undefined>>
    setIsSubscriptionEnabled: React.Dispatch<React.SetStateAction<boolean>>
    image?: string
    handleUnsubscribeClick: () => void
    footer: React.ElementType
    isSubscriptionUpdating: boolean
    onConfirmEnterprise: () => void
    showStep?: boolean
    setShowROICalculatorStep?: (value: boolean) => void
    onConfirm: () => void
    confirmLabel: string
    isSubscriptionEnabled: boolean
    isYearlyPlan: boolean
}

const AutomateModalStep = ({
    handleOnClose,
    hasAutomate,
    header,
    automateAvailablePlans,
    isTrialingSubscription,
    isEnterprisePlan,
    cadence,
    selectedPlan,
    setSelectedPlan,
    setIsSubscriptionEnabled,
    image,
    handleUnsubscribeClick,
    footer: Footer,
    isSubscriptionUpdating,
    onConfirmEnterprise,
    showStep = false,
    setShowROICalculatorStep,
    onConfirm,
    confirmLabel,
    isSubscriptionEnabled,
    isYearlyPlan,
}: Props) => (
    <>
        <ModalHeader toggle={handleOnClose}>{header}</ModalHeader>
        <ModalBody
            className={css.modalBody}
            data-candu-id={
                hasAutomate
                    ? 'cancel-automation-addon-modal-body'
                    : 'manage-automation-addon-modal-body'
            }
        >
            <PlanSubscriptionDescription
                productType={ProductType.Automation}
                availablePlans={automateAvailablePlans}
                isTrialing={isTrialingSubscription}
                isEnterprisePlan={isEnterprisePlan}
                cadence={cadence}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                setIsSubscriptionEnabled={setIsSubscriptionEnabled}
                trackingSource="subscription_modal_ai_agent"
                isYearlyPlan={isYearlyPlan}
            />
            {!!image && (
                <img
                    alt="automation features"
                    src={image}
                    className={css.image}
                />
            )}
        </ModalBody>
        {hasAutomate ? (
            <ModalFooter
                className={classNames(css.footer, css.footerUnsubscribe)}
            >
                <Button
                    intent="destructive"
                    onClick={handleUnsubscribeClick}
                    isLoading={isSubscriptionUpdating}
                >
                    Cancel subscription
                </Button>
                <Button intent="secondary" onClick={handleOnClose}>
                    OK
                </Button>
            </ModalFooter>
        ) : isEnterprisePlan || isYearlyPlan ? (
            <Footer
                confirmLabel="Contact Us"
                isUpdating={isSubscriptionUpdating}
                onClose={handleOnClose}
                onConfirm={onConfirmEnterprise}
            />
        ) : showStep ? (
            <ModalFooter
                className={classNames(css.footer, css.footerSpaceBetween)}
            >
                <span className={css.step}>Step 2 of 2</span>
                <div className={css.ROIButtons}>
                    <Button
                        onClick={() => setShowROICalculatorStep?.(true)}
                        intent="secondary"
                    >
                        Back
                    </Button>
                    <Button intent="primary" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </ModalFooter>
        ) : (
            <Footer
                confirmLabel={confirmLabel}
                isUpdating={isSubscriptionUpdating}
                isDisabled={!isSubscriptionEnabled}
                onClose={handleOnClose}
                onConfirm={onConfirm}
            />
        )}
    </>
)

export default AutomateModalStep
