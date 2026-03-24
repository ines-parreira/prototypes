import type React from 'react'
import { useReducer, useState } from 'react'

import type { SelectedPlans } from '@repo/billing'
import { BILLING_SUPPORT_EMAIL, ZAPIER_REMOVE_AAO_HOOK } from '@repo/billing'
import { SegmentEvent } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {
    getCurrentAutomatePlan,
    getCurrentConvertPlan,
    getCurrentHelpdeskPlan,
    getCurrentSmsPlan,
    getCurrentVoicePlan,
} from 'state/billing/selectors'
import type { CurrentProductsUsages, ProductToPlan } from 'state/billing/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { trackBillingEvent } from '../../../../../models/billing/resources'
import { cancelHelpdeskAutoRenewal } from '../../../../../state/currentAccount/actions'
import { reportCRMGrowthError } from '../../utils/reportCRMGrowthError'
import { sendRemoveNotificationZap } from '../../utils/sendRemoveNotificationZap'
import CancellationReasons from './CancellationReasons'
import CancellationReasonsFooter from './CancellationReasons/CancellationReasonsFooter'
import CancellationSummary from './CancellationSummary'
import CancellationSummaryFooter from './CancellationSummary/CancellationSummaryFooter'
import ChurnMitigationOffer from './ChurnMitigationOffer'
import ChurnMitigationOfferFooter from './ChurnMitigationOffer/ChurnMitigationOfferFooter'
import {
    CancellationFlowStep,
    PRIMARY_REASON_LABEL_TO_INTERNAL_NAME,
    SECONDARY_REASON_LABEL_TO_INTERNAL_NAME,
} from './constants'
import type {
    CancellationPrimaryReasonLabel,
    CancellationSecondaryReasonLabel,
} from './constants'
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
    subscriptionProducts: ProductToPlan
    periodEnd: string
    currentUsage?: CurrentProductsUsages
    selectedPlans: SelectedPlans
    setSelectedPlans: React.Dispatch<React.SetStateAction<SelectedPlans>>
    onCancellationConfirmed?: () => void
    updateSubscription: () => Promise<unknown>
    cancelledProducts?: ProductType[]
}

const getModalHeaderTitle = (
    step: CancellationFlowStep,
    productDisplayName: string,
): string => {
    switch (step) {
        case CancellationFlowStep.productFeaturesFOMO:
            return `Are you sure you want to cancel your ${productDisplayName} plan?`
        case CancellationFlowStep.cancellationReasons:
        case CancellationFlowStep.cancellationSummary:
            return `Cancel ${productDisplayName} auto-renewal`
        case CancellationFlowStep.churnMitigationOffer:
            return "Before you go—let's find the best option for your business"
        default:
            return `Cancel ${productDisplayName} auto-renewal`
    }
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
    cancelledProducts = [],
}: CancelProductModelProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
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
    const currentVoicePlan = useAppSelector(getCurrentVoicePlan)
    const currentSmsPlan = useAppSelector(getCurrentSmsPlan)
    const currentConvertPlan = useAppSelector(getCurrentConvertPlan)
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
        if (cancellationStep === CancellationFlowStep.cancellationSummary) {
            setSelectedPlans((prev) => ({
                ...prev,
                [productType]: {
                    ...prev[productType],
                    isSelected: true,
                },
            }))
        }
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

        try {
            const primaryReasonLabel =
                cancellationReasonsState.primaryReason?.label
            const secondaryReasonLabel =
                cancellationReasonsState.secondaryReason?.label

            const primaryReasonInternal =
                primaryReasonLabel &&
                primaryReasonLabel in PRIMARY_REASON_LABEL_TO_INTERNAL_NAME
                    ? PRIMARY_REASON_LABEL_TO_INTERNAL_NAME[
                          primaryReasonLabel as CancellationPrimaryReasonLabel
                      ]
                    : 'unknown'

            const secondaryReasonInternal =
                secondaryReasonLabel &&
                secondaryReasonLabel in SECONDARY_REASON_LABEL_TO_INTERNAL_NAME
                    ? SECONDARY_REASON_LABEL_TO_INTERNAL_NAME[
                          secondaryReasonLabel as CancellationSecondaryReasonLabel
                      ]
                    : null

            await trackBillingEvent(
                SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
                {
                    product_type: productType,
                    primary_reason: primaryReasonInternal,
                    secondary_reason: secondaryReasonInternal,
                    other_reason:
                        cancellationReasonsState.additionalDetails?.label ||
                        null,
                    accepted: true,
                },
            )
        } catch (error) {
            reportCRMGrowthError(
                error,
                'Failed to track churn mitigation offer acceptance event',
            )
        }
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
                        message: `Your ${productCancellationScenario.productDisplayName} auto-renewal has been cancelled.`,
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
            // Invalidate billing state query to refresh currentProducts from server
            const billingStateQueryKey = queryKeys.billing.getBillingState()
            await queryClient.invalidateQueries({
                queryKey: billingStateQueryKey,
            })

            // Reset selectedPlans to sync with the updated currentProducts
            // After query refetch, Redux selectors will have the fresh data
            setSelectedPlans((prev) => ({
                ...prev,
                [ProductType.Helpdesk]: {
                    ...prev[ProductType.Helpdesk],
                    plan: currentHelpdeskPlan,
                    isSelected: !!currentHelpdeskPlan,
                },
                [ProductType.Automation]: {
                    ...prev[ProductType.Automation],
                    plan: currentAutomatePlan,
                    isSelected: !!currentAutomatePlan,
                },
                [ProductType.Voice]: {
                    ...prev[ProductType.Voice],
                    plan: currentVoicePlan,
                    isSelected: !!currentVoicePlan,
                },
                [ProductType.SMS]: {
                    ...prev[ProductType.SMS],
                    plan: currentSmsPlan,
                    isSelected: !!currentSmsPlan,
                },
                [ProductType.Convert]: {
                    ...prev[ProductType.Convert],
                    plan: currentConvertPlan,
                    isSelected: !!currentConvertPlan,
                },
            }))

            onCancellationConfirmed?.()
            handleOnClose()
        }
    }

    const handleSendCancellationEvents = async () => {
        try {
            const primaryReasonLabel =
                cancellationReasonsState.primaryReason?.label
            const secondaryReasonLabel =
                cancellationReasonsState.secondaryReason?.label

            const primaryReasonInternal =
                primaryReasonLabel &&
                primaryReasonLabel in PRIMARY_REASON_LABEL_TO_INTERNAL_NAME
                    ? PRIMARY_REASON_LABEL_TO_INTERNAL_NAME[
                          primaryReasonLabel as CancellationPrimaryReasonLabel
                      ]
                    : 'unknown'

            const secondaryReasonInternal =
                secondaryReasonLabel &&
                secondaryReasonLabel in SECONDARY_REASON_LABEL_TO_INTERNAL_NAME
                    ? SECONDARY_REASON_LABEL_TO_INTERNAL_NAME[
                          secondaryReasonLabel as CancellationSecondaryReasonLabel
                      ]
                    : null

            await trackBillingEvent(
                SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
                {
                    product_type: productType,
                    primary_reason: primaryReasonInternal,
                    secondary_reason: secondaryReasonInternal,
                    other_reason:
                        cancellationReasonsState.additionalDetails?.label ||
                        null,
                    accepted: false,
                },
            )
        } catch (error) {
            reportCRMGrowthError(
                error,
                'Failed to track cancellation offer rejection event',
            )
        }

        if (productType === ProductType.Automation && currentUsage) {
            const domain = currentAccount.get('domain')
            const from = currentUser.get('email')
            const subject = `Remove AI Agent - ${domain}`
            const message = formatCancellationReasonsForZapier(
                cancellationReasonsState.primaryReason,
                cancellationReasonsState.secondaryReason,
                cancellationReasonsState.additionalDetails,
            )

            try {
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
            } catch (error) {
                reportCRMGrowthError(
                    error,
                    'Failed to send AI Agent removal notification to support',
                )
            }
        }

        // Mark the product as removed in pending changes (except for Helpdesk)
        // Keep the plan object so anyProductChanged can detect the cancellation
        if (productType !== ProductType.Helpdesk) {
            setSelectedPlans((prev) => ({
                ...prev,
                [productType]: {
                    ...prev[productType],
                    isSelected: false,
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
                                productType={productType}
                                productDisplayName={
                                    productCancellationScenario.productDisplayName
                                }
                            />
                        }
                        footer={
                            <ProductFeaturesFOMOFooter
                                onClose={handleOnClose}
                                productDisplayName={
                                    productCancellationScenario.productDisplayName
                                }
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
                                productDisplayName={
                                    productCancellationScenario.productDisplayName
                                }
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
                                cancelledProducts={cancelledProducts}
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
                    title={getModalHeaderTitle(
                        cancellationStep,
                        productCancellationScenario.productDisplayName,
                    )}
                />
                {renderStep()}
            </Modal>
        </>
    )
}

export default CancelProductModal
