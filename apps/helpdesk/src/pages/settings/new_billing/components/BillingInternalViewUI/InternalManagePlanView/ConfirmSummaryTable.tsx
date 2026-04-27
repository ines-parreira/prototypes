import { Fragment } from 'react'

import { formatAmount } from '@repo/billing'

import { Box, Separator, Text } from '@gorgias/axiom'

import type { BillingState } from 'models/billing/types'
import { getPlanPrice, isTrial } from 'models/billing/utils'
import { BalanceDueRow } from 'pages/settings/new_billing/components/BalanceDueRow'
import { SummaryProductRow } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/SummaryProductRow'
import type { ResolvedPlan } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

import css from './ConfirmSummaryTable.less'

type ConfirmSummaryTableProps = {
    billingState: BillingState
    resolvedPlans: ResolvedPlan[]
    balanceDue?: number | null
    isEstimateLoading?: boolean
    estimateErrorMessage?: string
    onRetryEstimate?: () => void
}

export function ConfirmSummaryTable({
    billingState,
    resolvedPlans,
    balanceDue,
    isEstimateLoading = false,
    estimateErrorMessage,
    onRetryEstimate,
}: ConfirmSummaryTableProps) {
    const cadence = billingState.current_plans.helpdesk.cadence
    const currency = billingState.current_plans.helpdesk.currency ?? 'usd'

    const { totalPrice, currentTotalPrice } = resolvedPlans.reduce(
        (acc, { plan, currentPlan }) => {
            if (plan && !isTrial(plan)) {
                acc.totalPrice += getPlanPrice(plan)
            }
            if (currentPlan && !isTrial(currentPlan)) {
                acc.currentTotalPrice += getPlanPrice(currentPlan)
            }
            return acc
        },
        { totalPrice: 0, currentTotalPrice: 0 },
    )

    const totalChanged = totalPrice !== currentTotalPrice

    const visiblePlans = resolvedPlans.filter(
        ({ plan, currentPlan }) => plan !== null || currentPlan !== null,
    )

    const balanceDueText =
        balanceDue == null
            ? '—'
            : `${formatAmount(Math.max(balanceDue, 0), currency)} due today`

    return (
        <Box flexDirection="column" gap="sm" w="100%">
            <Box justifyContent="space-between">
                <Text size="xs" color="content-neutral-tertiary" variant="bold">
                    PRODUCT
                </Text>
                <Text size="xs" color="content-neutral-tertiary" variant="bold">
                    PRICE
                </Text>
            </Box>
            <Separator />
            {visiblePlans.map(
                ({ productType, plan, currentPlan, status }, index) => (
                    <Fragment key={productType}>
                        {index > 0 && <Separator variant="dashed" />}
                        <SummaryProductRow
                            productType={productType}
                            plan={plan}
                            currentPlan={currentPlan}
                            status={status}
                        />
                    </Fragment>
                ),
            )}
            <Separator variant="dashed" />
            <Box flexDirection="column" gap="sm">
                <Box justifyContent="space-between">
                    <Text variant="bold">Total</Text>
                    <Box alignItems="center" gap="xs">
                        {totalChanged && (
                            <Text color="content-neutral-tertiary">
                                <s>
                                    {formatAmount(currentTotalPrice, currency)}
                                </s>
                            </Text>
                        )}
                        <Text variant="bold" className={css.highlighted}>
                            {formatAmount(totalPrice, currency)}/{cadence}
                        </Text>
                    </Box>
                </Box>
                <BalanceDueRow
                    isLoading={isEstimateLoading}
                    errorMessage={estimateErrorMessage}
                    onRetry={onRetryEstimate}
                >
                    {balanceDueText}
                </BalanceDueRow>
                <Box marginTop="sm" marginBottom="sm" flexDirection="column">
                    <Text
                        size="sm"
                        color="content-neutral-secondary"
                        align="end"
                    >
                        Prices exclusive of sales tax
                    </Text>
                    <Separator />
                </Box>
            </Box>
        </Box>
    )
}
