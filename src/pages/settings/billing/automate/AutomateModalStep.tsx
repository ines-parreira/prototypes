import React from 'react'
import {ModalFooter, ModalHeader, ModalBody} from 'reactstrap'
import classNames from 'classnames'

import PlanSubscriptionDescription from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import {
    AutomatePlan,
    PlanInterval,
    Plan,
    ProductType,
} from 'models/billing/types'
import Button from 'pages/common/components/button/Button'

import css from './AutomateSubscriptionModal.less'

type Props = {
    handleOnClose: () => void
    hasAutomate: boolean
    header: string
    automationPrices: AutomatePlan[]
    isTrialingSubscription: boolean
    isEnterprisePlan: boolean
    interval?: PlanInterval
    selectedPrice?: Plan
    setSelectedPrice: React.Dispatch<React.SetStateAction<Plan | undefined>>
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
}

const AutomateModalStep = ({
    handleOnClose,
    hasAutomate,
    header,
    automationPrices,
    isTrialingSubscription,
    isEnterprisePlan,
    interval,
    selectedPrice,
    setSelectedPrice,
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
                prices={automationPrices}
                isTrialing={isTrialingSubscription}
                isEnterprisePlan={isEnterprisePlan}
                interval={interval}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
                setIsSubscriptionEnabled={setIsSubscriptionEnabled}
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
        ) : isEnterprisePlan ? (
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
