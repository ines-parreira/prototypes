import { Fragment } from 'react'

import { formatAmount } from '@repo/billing'

import { Box, Separator, Text } from '@gorgias/axiom'
import type { InvoiceCadence } from '@gorgias/helpdesk-types'

import type { BillingState } from 'models/billing/types'
import { BalanceDueRow } from 'pages/settings/new_billing/components/BalanceDueRow'
import { SummaryProductRow } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/SummaryProductRow'
import type {
    PriceSummary,
    ResolvedPlan,
} from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

import { DiscountSummaryRow } from './DiscountSummaryRow'

import css from './ConfirmSummaryTable.less'

type ConfirmSummaryTableProps = {
    billingState: BillingState
    resolvedPlans: ResolvedPlan[]
    priceSummary: PriceSummary
    invoiceCadence: InvoiceCadence
    balanceDue?: number | null
    isEstimateLoading?: boolean
    estimateErrorMessage?: string
    onRetryEstimate?: () => void
    showBalanceDue?: boolean
}

export function ConfirmSummaryTable({
    billingState,
    resolvedPlans,
    priceSummary,
    invoiceCadence,
    balanceDue,
    isEstimateLoading = false,
    estimateErrorMessage,
    onRetryEstimate,
    showBalanceDue = true,
}: ConfirmSummaryTableProps) {
    const currency = billingState.current_plans.helpdesk.currency ?? 'usd'

    const {
        totalWithDiscountsInCents,
        discountAmountInCents,
        hasDiscount,
        showStrikethrough,
        strikethroughAmountInCents,
    } = priceSummary

    const visiblePlans = resolvedPlans.filter(
        ({ plan, currentPlan }) => plan !== null || currentPlan !== null,
    )

    const isBalanceNegative = balanceDue != null && balanceDue < 0
    const balanceDueText =
        balanceDue == null
            ? '—'
            : `${formatAmount(balanceDue, currency)} due today`

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
                {hasDiscount && (
                    <DiscountSummaryRow
                        discountAmountInCents={discountAmountInCents}
                        invoiceCadence={invoiceCadence}
                        currency={currency}
                    />
                )}
                <Box justifyContent="space-between">
                    <Text variant="bold">Total</Text>
                    <Box alignItems="center" gap="xs">
                        {showStrikethrough && (
                            <Text color="content-neutral-tertiary">
                                <s>
                                    {formatAmount(
                                        Math.round(strikethroughAmountInCents) /
                                            100,
                                        currency,
                                    )}
                                </s>
                            </Text>
                        )}
                        <Text variant="bold" className={css.highlighted}>
                            {`${formatAmount(Math.round(totalWithDiscountsInCents) / 100, currency)}/${invoiceCadence}`}
                        </Text>
                    </Box>
                </Box>
                {showBalanceDue && (
                    <>
                        <BalanceDueRow
                            isLoading={isEstimateLoading}
                            errorMessage={estimateErrorMessage}
                            onRetry={onRetryEstimate}
                        >
                            <Text className={css.highlighted} variant="bold">
                                {balanceDueText}
                            </Text>
                        </BalanceDueRow>
                        {isBalanceNegative && (
                            <Text size="sm" color="content-neutral-secondary">
                                A negative balance cannot be charged via
                                invoice. Use &ldquo;Apply without invoice&rdquo;
                                instead.
                            </Text>
                        )}
                    </>
                )}
                <Box marginTop="sm" marginBottom="sm" flexDirection="column">
                    <Text
                        size="sm"
                        color="content-neutral-secondary"
                        align="end"
                    >
                        Prices exclusive of sales tax
                    </Text>
                    <Box marginTop="lg">
                        <Separator />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
