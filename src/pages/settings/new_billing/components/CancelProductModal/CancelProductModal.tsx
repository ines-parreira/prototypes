import React, {useReducer, useState} from 'react'
import Modal from 'pages/common/components/modal/Modal'
import {ProductType} from 'models/billing/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import CancellationReasons from './CancellationReasons'
import ProductFeaturesFOMO from './ProductFeaturesFOMO'
import ChurnMitigationOffer from './ChurnMitigationOffer'
import {CancellationReasonsActionType} from './types'
import {cancellationReasonsReducer, DEFAULT_STATE} from './reducers'
import CancellationSummary from './CancellationSummary'
import {findCancellationScenarioByProductType} from './helpers'
import {SubscriptionProducts} from './CancellationSummary/types'
import {CancellationFlowStep} from './constants'
import Step from './UI/Step'
import {useCancellationFlowStepsStateMachine} from './hooks'
import ProductFeaturesFOMOFooter from './ProductFeaturesFOMO/ProductFeaturesFOMOFooter'
import CancellationReasonsFooter from './CancellationReasons/CancellationReasonsFooter'
import ChurnMitigationOfferFooter from './ChurnMitigationOffer/ChurnMitigationOfferFooter'
import CancellationSummaryFooter from './CancellationSummary/CancellationSummaryFooter'

type CancelProductModelProps = {
    onClose: () => void
    isOpen: boolean
    productType: ProductType
    subscriptionProducts: SubscriptionProducts
    periodEnd: string
}

const CancelProductModal = ({
    onClose,
    isOpen,
    productType,
    subscriptionProducts,
    periodEnd,
}: CancelProductModelProps) => {
    const {cancellationStep, switchToNextStep, resetCancellationFlow} =
        useCancellationFlowStepsStateMachine()
    const [cancellationReasonsState, dispatchCancellationReasonsAction] =
        useReducer(cancellationReasonsReducer, DEFAULT_STATE)
    const productCancellationScenario =
        findCancellationScenarioByProductType(productType)

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isFirstOpen, setIsFirstOpened] = useState(true)

    const resetAll = () => {
        setIsFirstOpened(false)
        dispatchCancellationReasonsAction({
            type: CancellationReasonsActionType.Reset,
        })
        resetCancellationFlow()
    }

    if (isFirstOpen && isOpen) {
        // Always make sure the freshly open modal resets all the states.
        resetAll()
    }

    const handleOnClose = () => {
        onClose()
        setIsFirstOpened(true)
    }

    const acceptChurnMitigationOffer = () => {
        setIsSubmitting(true)
        // TODO: Submit accepted candu content id and selected reasons to Zapier
        setIsSubmitting(false)
        handleOnClose()
    }

    const submitCancellation = () => {
        setIsSubmitting(true)
        // TODO: Submit cancellation to Zapier
        setIsSubmitting(false)
        handleOnClose()
    }

    const renderStep = () => {
        switch (cancellationStep) {
            case CancellationFlowStep.productFeaturesFOMO:
                return (
                    <Step
                        body={
                            <ProductFeaturesFOMO
                                periodEnd={periodEnd}
                                features={productCancellationScenario.features}
                            />
                        }
                        footer={
                            <ProductFeaturesFOMOFooter
                                onClose={handleOnClose}
                                productType={productType}
                                onContinue={switchToNextStep}
                            />
                        }
                    />
                )
            case CancellationFlowStep.cancellationReasons:
                return (
                    <Step
                        body={
                            <CancellationReasons
                                reasons={productCancellationScenario.reasons}
                                dispatchCancellationReasonsAction={
                                    dispatchCancellationReasonsAction
                                }
                                reasonsState={cancellationReasonsState}
                            />
                        }
                        footer={
                            <CancellationReasonsFooter
                                onClose={handleOnClose}
                                productType={productType}
                                onContinue={switchToNextStep}
                                continueDisabled={
                                    !cancellationReasonsState.completed
                                }
                            />
                        }
                    />
                )
            case CancellationFlowStep.churnMitigationOffer:
                return (
                    <Step
                        body={
                            <ChurnMitigationOffer
                                reasonsToCanduContent={
                                    productCancellationScenario.reasonsToCanduContents
                                }
                                primaryReason={
                                    cancellationReasonsState.primaryReason!
                                }
                                secondaryReason={
                                    cancellationReasonsState.secondaryReason
                                }
                            />
                        }
                        footer={
                            <ChurnMitigationOfferFooter
                                onAccept={acceptChurnMitigationOffer}
                                onContinue={switchToNextStep}
                                isLoading={isSubmitting}
                            />
                        }
                    />
                )
            case CancellationFlowStep.cancellationSummary:
                return (
                    <Step
                        body={
                            <CancellationSummary
                                subscriptionProducts={subscriptionProducts}
                                cancellingProducts={
                                    productCancellationScenario.productsToCancel
                                }
                                periodEnd={periodEnd}
                            />
                        }
                        footer={
                            <CancellationSummaryFooter
                                onConfirm={submitCancellation}
                                isLoading={isSubmitting}
                            />
                        }
                    />
                )
        }
    }
    return (
        <>
            <Modal isOpen={isOpen} onClose={handleOnClose} size="medium">
                <ModalHeader
                    title={`Cancel ${
                        productType.charAt(0).toUpperCase() +
                        productType.slice(1)
                    } auto-renewal`}
                />
                {renderStep()}
            </Modal>
        </>
    )
}

export default CancelProductModal
