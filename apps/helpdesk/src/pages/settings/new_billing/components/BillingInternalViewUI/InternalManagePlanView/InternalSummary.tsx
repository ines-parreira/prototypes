import { Fragment } from 'react'

import { BILLING_PAYMENT_CARD_PATH, formatAmount } from '@repo/billing'
import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    Card,
    Heading,
    Icon,
    Separator,
    Text,
} from '@gorgias/axiom'

import type { BillingState } from 'models/billing/types'
import { getPlanPrice, isTrial } from 'models/billing/utils'
import type { ResolvedPlan } from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

import { SummaryProductRow } from './SummaryProductRow'

type InternalSummaryProps = {
    billingState: BillingState
    resolvedPlans: ResolvedPlan[]
    hasChanges: boolean
    onPreviewChanges: () => void
}

export function InternalSummary({
    billingState,
    resolvedPlans,
    hasChanges,
    onPreviewChanges,
}: InternalSummaryProps) {
    const { credit_card } = billingState.customer
    const cadence = billingState.current_plans.helpdesk.cadence
    const currency = billingState.current_plans.helpdesk.currency ?? 'usd'

    const totalPrice = resolvedPlans.reduce((sum, { plan }) => {
        if (!plan || isTrial(plan)) return sum
        return sum + getPlanPrice(plan)
    }, 0)

    const currentTotalPrice = resolvedPlans.reduce((sum, { currentPlan }) => {
        if (!currentPlan || isTrial(currentPlan)) return sum
        return sum + getPlanPrice(currentPlan)
    }, 0)

    const totalChanged = hasChanges && totalPrice !== currentTotalPrice

    const visiblePlans = resolvedPlans.filter(
        ({ plan, currentPlan, status }) =>
            !(plan === null && currentPlan === null && status === 'unchanged'),
    )

    return (
        <Card
            elevation="default"
            flexDirection="column"
            gap="md"
            flexGrow={1}
            flexBasis={0}
        >
            <Box>
                <Heading size="xl">Summary</Heading>
            </Box>
            <Separator />
            <Box
                flexDirection="column"
                paddingBottom="lg"
                paddingTop="xs"
                paddingLeft="md"
                paddingRight="md"
                gap="md"
            >
                <Box justifyContent="space-between">
                    <Text
                        size="xs"
                        color="content-neutral-tertiary"
                        variant="bold"
                    >
                        PRODUCT
                    </Text>
                    <Text
                        size="xs"
                        color="content-neutral-tertiary"
                        variant="bold"
                    >
                        PRICE
                    </Text>
                </Box>
                <Separator variant="dashed" />
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
                <Separator />
                <Box justifyContent="space-between">
                    <Text variant="bold">Total</Text>
                    <Box alignItems="center" gap="xs">
                        {totalChanged && (
                            <Text
                                variant="bold"
                                color="content-neutral-tertiary"
                            >
                                <s>
                                    {formatAmount(currentTotalPrice, currency)}
                                </s>
                            </Text>
                        )}
                        <Text variant="bold">
                            {formatAmount(totalPrice, currency)}/{cadence}
                        </Text>
                    </Box>
                </Box>
                <Box justifyContent="flex-end">
                    <Text size="sm" color="content-neutral-secondary">
                        Prices exclusive of sales tax
                    </Text>
                </Box>
                {credit_card && (
                    <>
                        <Separator />
                        <Box alignItems="center" justifyContent="space-between">
                            <Box alignItems="center" gap="sm">
                                <Icon name="credit-card" />
                                <Text>
                                    {credit_card.brand} ending with{' '}
                                    <Text variant="bold" as="span">
                                        {credit_card.last4}
                                    </Text>
                                </Text>
                            </Box>
                            <Link to={BILLING_PAYMENT_CARD_PATH}>
                                <Text color="content-accent-default" size="sm">
                                    Change Payment Method
                                </Text>
                            </Link>
                        </Box>
                    </>
                )}
                <Box justifyContent="flex-end" paddingTop="sm">
                    <Button isDisabled={!hasChanges} onClick={onPreviewChanges}>
                        Preview changes
                    </Button>
                </Box>
            </Box>
        </Card>
    )
}
