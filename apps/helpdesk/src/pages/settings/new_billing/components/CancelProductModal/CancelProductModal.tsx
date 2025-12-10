import type React from 'react'
import { useReducer, useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import _capitalize from 'lodash/capitalize'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {
    getCurrentAutomatePlan,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import type { CurrentProductsUsages } from 'state/billing/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { trackBillingEvent } from '../../../../../models/billing/resources'
import { cancelHelpdeskAutoRenewal } from '../../../../../state/currentAccount/actions'
import { BILLING_SUPPORT_EMAIL, ZAPIER_REMOVE_AAO_HOOK } from '../../constants'
import { sendRemoveNotificationZap } from '../../utils/sendRemoveNotificationZap'
import type { SelectedPlans } from '../../views/BillingProcessView/BillingProcessView'
import CancellationReasons from './CancellationReasons'
import CancellationReasonsFooter from './CancellationReasons/CancellationReasonsFooter'
import CancellationSummary from './CancellationSummary'
import CancellationSummaryFooter from './CancellationSummary/CancellationSummaryFooter'
import type { SubscriptionProducts } from './CancellationSummary/types'
import ChurnMitigationOffer from './ChurnMitigationOffer'
import ChurnMitigationOfferFooter from './ChurnMitigationOffer/ChurnMitigationOfferFooter'
import { CancellationFlowStep } from './constants'
import {
    findCancellationScenarioByProductType,
    formatCancellationReasonsForZapier,
} from './helpers'
import useCancellationFlowStepsStateMachine from './hooks/useCancellationFlowStepsStateMachine'
import useFindChurnMitigationOfferId from './hooks/useFindChurnMitigationOffer'
import ProductFeaturesFOMO from './ProductFeaturesFOMO'
import ProductFeaturesFOMOFooter from './ProductFeaturesFOMO/ProductFeaturesFOMOFooter'
import { cancellationReasonsReducer, DEFAULT_STATE } from './reducers'
import { sendAcceptedChurnMitigationOfferToSupport } from './resources'
import { CancellationReasonsActionType } from './types'
import Step from './UI/Step'

type CancelProductModelProps = {
    onClose: () => void
    isOpen: boolean
    productType: ProductType
    subscriptionProducts: SubscriptionProducts
    periodEnd: string
    currentUsage?: CurrentProductsUsages
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    onCancellationConfirmed?: () => void
    updateSubscription: () => Promise<unknown>
}

const CancelProductModal = ({
    onClose,
    isOpen,
    productType,
    subscriptionProducts,
    periodEnd,
    currentUsage,
    selectedPlans,
    setSelectedPlans,
    onCancellationConfirmed,
    updateSubscription,
}: CancelProductModelProps) => {
    const dispatch = useAppDispatch()
    const { cancellationStep, switchToNextStep, resetCancellationFlow } =
        useCancellationFlowStepsStateMachine()
    const [cancellationReasonsState, dispatchCancellationReasonsAction] =
        useReducer(cancellationReasonsReducer, DEFAULT_STATE)
    const productCancellationScenario =
        findCancellationScenarioByProductType(productType)

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isFirstOpen, setIsFirstOpened] = useState(true)

    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
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
        productCancellationScenario.reasonsToCanduContents,
    )

    const handleAcceptOffer = async () => {
        setIsSubmitting(true)
        const isSent = await sendAcceptedChurnMitigationOfferToSupport({
            productType: productType.toString(),
            accountDomain: currentAccount.get('domain'),
            userEmail: currentUser.get('email'),
            primaryReason:
                cancellationReasonsState.primaryReason?.label ??
                'No level 1 reason',
            secondaryReason:
                cancellationReasonsState.secondaryReason?.label || null,
            otherReason:
                cancellationReasonsState.additionalDetails?.label || null,
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
                }),
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
                }),
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
                    cancellationReasonsState.additionalDetails?.label || null,
                accepted: true,
            },
        )
    }

    const handleSubmitCancellation = async () => {
        setIsSubmitting(true)
        let isCancelled = false

        try {
            if (productType === ProductType.Helpdesk) {
                isCancelled = await dispatch(
                    cancelHelpdeskAutoRenewal(selectedPlans),
                )
            } else {
                await updateSubscription()
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: `You have removed ${productCancellationScenario.productDisplayName} from your subscription`,
                    }),
                )
                isCancelled = true
            }
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: `Failed to remove ${productCancellationScenario.productDisplayName}. Please try again or contact support.`,
                }),
            )
            isCancelled = false
        } finally {
            setIsSubmitting(false)
        }

        if (isCancelled) {
            onCancellationConfirmed?.()
            handleOnClose()
        }
    }

    const handleSendCancellationEvents = async () => {
        await trackBillingEvent(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: cancellationReasonsState.primaryReason!.label,
                secondary_reason:
                    cancellationReasonsState.secondaryReason?.label || null,
                other_reason:
                    cancellationReasonsState.additionalDetails?.label || null,
                accepted: false,
            },
        )

        if (productType === ProductType.Automation && currentUsage) {
            const domain = currentAccount.get('domain')
            const from = currentUser.get('email')
            const subject = `Remove AI Agent - ${domain}`
            const message = formatCancellationReasonsForZapier(
                cancellationReasonsState.primaryReason,
                cancellationReasonsState.secondaryReason,
                cancellationReasonsState.additionalDetails,
            )

            await sendRemoveNotificationZap({
                zapierHook: ZAPIER_REMOVE_AAO_HOOK,
                subject,
                message,
                from,
                to: BILLING_SUPPORT_EMAIL,
                account: domain,
                freeTrial: currentAccount.get('is_trialing') || false,
                helpdeskPlan: currentHelpdeskPlan?.name ?? '',
                automationPlan: currentAutomatePlan?.name ?? '',
            })
        }

        // Mark the product as removed in pending changes (except for Helpdesk)
        if (productType !== ProductType.Helpdesk) {
            setSelectedPlans((prev) => ({
                ...prev,
                [productType]: {
                    ...prev[productType],
                    isSelected: false,
                    plan: undefined,
                },
            }))
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
                                    await handleSendCancellationEvents()
                                    switchToNextStep()
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
                    title={`Cancel ${_capitalize(productType)} auto-renewal`}
                />
                {renderStep()}
            </Modal>
        </>
    )
}

export default CancelProductModal
