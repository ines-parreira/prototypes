import { useState } from 'react'

import {
    Box,
    Button,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import type { BillingState } from 'models/billing/types'

import { ConfirmSummaryTable } from './ConfirmSummaryTable'
import { useInternalConfirmChangesEstimate } from './useInternalConfirmChangesEstimate'
import type { ResolvedPlan } from './useInternalPlanEditor'

const INVOICE_ACTIONS = ['with', 'without'] as const
type InvoiceAction = (typeof INVOICE_ACTIONS)[number]

type InternalConfirmModalProps = {
    isOpen: boolean
    onClose: () => void
    resolvedPlans: ResolvedPlan[]
    billingState: BillingState
    onApply: (generateInvoice: boolean) => void
    isSubmitting: boolean
}

export function InternalConfirmModal({
    isOpen,
    onClose,
    resolvedPlans,
    billingState,
    onApply,
    isSubmitting,
}: InternalConfirmModalProps) {
    const [activeAction, setActiveAction] = useState<InvoiceAction | null>(null)

    const {
        data: estimate,
        error: estimateError,
        isLoading: isEstimateLoading,
        isFetching: isEstimateFetching,
        isError: isEstimateError,
        refetch: refetchEstimate,
    } = useInternalConfirmChangesEstimate(
        isOpen,
        resolvedPlans,
        billingState.subscription.resource_version,
        billingState.subscription.schedule_resource_version,
    )

    const hasUpgrade = resolvedPlans.some(
        ({ status }) => status === 'upgraded' || status === 'added',
    )

    const isWriteBlocked =
        !window.USER_IMPERSONATED_AUTHORIZED_FOR_BILLING_WRITE_OPS
    const isApplyDisabled =
        isWriteBlocked || isSubmitting || isEstimateFetching || isEstimateError

    const estimateErrorMessage = isEstimateError
        ? isGorgiasApiError(estimateError)
            ? estimateError.response.data.error.msg
            : 'Failed to load estimate.'
        : undefined

    function handleApply(action: InvoiceAction) {
        setActiveAction(action)
        onApply(action === 'with')
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size={ModalSize.Md}>
            <OverlayHeader
                title="Confirm changes"
                description={
                    <Text>
                        Once you confirm, your changes will take effect
                        immediately.
                    </Text>
                }
            />
            <OverlayContent>
                <ConfirmSummaryTable
                    billingState={billingState}
                    resolvedPlans={resolvedPlans}
                    balanceDue={estimate?.balance_due}
                    isEstimateLoading={isEstimateLoading || isEstimateFetching}
                    estimateErrorMessage={estimateErrorMessage}
                    onRetryEstimate={() => void refetchEstimate()}
                />
            </OverlayContent>
            <OverlayFooter>
                <Box gap="sm">
                    {hasUpgrade ? (
                        <>
                            <Tooltip
                                trigger={
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleApply('without')}
                                        isLoading={
                                            isSubmitting &&
                                            activeAction === 'without'
                                        }
                                        isDisabled={isApplyDisabled}
                                    >
                                        Apply without invoice
                                    </Button>
                                }
                            >
                                {isWriteBlocked && (
                                    <TooltipContent title="You are not authorized to perform this action. Please reach out to the Billing Ops team to do it" />
                                )}
                            </Tooltip>
                            <Tooltip
                                trigger={
                                    <Button
                                        onClick={() => handleApply('with')}
                                        isLoading={
                                            isSubmitting &&
                                            activeAction === 'with'
                                        }
                                        isDisabled={isApplyDisabled}
                                    >
                                        Apply with invoice
                                    </Button>
                                }
                            >
                                {isWriteBlocked && (
                                    <TooltipContent title="You are not authorized to perform this action. Please reach out to the Billing Ops team to do it" />
                                )}
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip
                            trigger={
                                <Button
                                    onClick={() => handleApply('without')}
                                    isLoading={isSubmitting}
                                    isDisabled={isApplyDisabled}
                                >
                                    Apply
                                </Button>
                            }
                        >
                            {isWriteBlocked && (
                                <TooltipContent title="You are not authorized to perform this action. Please reach out to the Billing Ops team to do it" />
                            )}
                        </Tooltip>
                    )}
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
