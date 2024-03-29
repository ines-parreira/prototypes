import React, {useReducer, useState} from 'react'
import Modal from 'pages/common/components/modal/Modal'
import {ProductType} from 'models/billing/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {SegmentEvent} from 'common/segment'
import {trackBillingEvent} from '../../../../../models/billing/resources'
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
import useCancellationFlowStepsStateMachine from './hooks/useCancellationFlowStepsStateMachine'
import ProductFeaturesFOMOFooter from './ProductFeaturesFOMO/ProductFeaturesFOMOFooter'
import CancellationReasonsFooter from './CancellationReasons/CancellationReasonsFooter'
import ChurnMitigationOfferFooter from './ChurnMitigationOffer/ChurnMitigationOfferFooter'
import CancellationSummaryFooter from './CancellationSummary/CancellationSummaryFooter'
import {sendAcceptedChurnMitigationOfferToSupport} from './resources'
import useFindChurnMitigationOfferId from './hooks/useFindChurnMitigationOffer'

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
    const dispatch = useAppDispatch()
    const {cancellationStep, switchToNextStep, resetCancellationFlow} =
        useCancellationFlowStepsStateMachine()
    const [cancellationReasonsState, dispatchCancellationReasonsAction] =
        useReducer(cancellationReasonsReducer, DEFAULT_STATE)
    const productCancellationScenario =
        findCancellationScenarioByProductType(productType)

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isFirstOpen, setIsFirstOpened] = useState(true)

    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)
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

    const correspondingChurnMitigationOfferId = useFindChurnMitigationOfferId(
        cancellationReasonsState.primaryReason,
        cancellationReasonsState.secondaryReason,
        productCancellationScenario.reasonsToCanduContents
    )

    const handleAcceptOffer = async () => {
        setIsSubmitting(true)
        const isSent = await sendAcceptedChurnMitigationOfferToSupport({
            productType: productType.toString(),
            accountDomain: currentAccount.get('domain'),
            userEmail: currentUser.get('email'),
            primaryReason: cancellationReasonsState.primaryReason!.label,
            secondaryReason:
                cancellationReasonsState.secondaryReason?.label || null,
            otherReason: cancellationReasonsState.otherReason?.label || null,
            correspondingChurnMitigationOfferId:
                correspondingChurnMitigationOfferId,
        })

        if (isSent) {
            await dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        'We are happy you changed your mind! ' +
                        'Our support team will reach out to you shortly regarding this offer.',
                })
            )
            handleOnClose()
            setIsSubmitting(false)
        } else {
            await dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        "Couldn't send the request to our support team. " +
                        'If the problem persists, please contact our billing team via chat or ' +
                        'at <a href="mailto:support@gorgias.com">support@gorgias.com</a> to make this change.',
                    allowHTML: true,
                })
            )
            setIsSubmitting(false)
        }

        await trackBillingEvent(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: cancellationReasonsState.primaryReason!.label,
                secondary_reason:
                    cancellationReasonsState.secondaryReason?.label || null,
                other_reason:
                    cancellationReasonsState.otherReason?.label || null,
                accepted: true,
            }
        )
    }

    const handleSubmitCancellation = async () => {
        setIsSubmitting(true)
        const isCancelled = await dispatch(
            productCancellationScenario.cancelProductAction()
        )
        setIsSubmitting(false)

        if (isCancelled) {
            handleOnClose()
        }
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
                                canduContentId={
                                    correspondingChurnMitigationOfferId
                                }
                            />
                        }
                        footer={
                            <ChurnMitigationOfferFooter
                                onAccept={handleAcceptOffer}
                                onContinue={async () => {
                                    switchToNextStep()
                                    await trackBillingEvent(
                                        SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
                                        {
                                            product_type: productType,
                                            primary_reason:
                                                cancellationReasonsState.primaryReason!
                                                    .label,
                                            secondary_reason:
                                                cancellationReasonsState
                                                    .secondaryReason?.label ||
                                                null,
                                            other_reason:
                                                cancellationReasonsState
                                                    .otherReason?.label || null,
                                            accepted: false,
                                        }
                                    )
                                }}
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
                                onConfirm={handleSubmitCancellation}
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
