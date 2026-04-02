import { Fragment } from 'react'

import {
    BILLING_PAYMENT_CARD_PATH,
    formatAmount,
    formatNumTickets,
    PRODUCT_INFO,
} from '@repo/billing'
import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    Card,
    Color,
    Heading,
    Icon,
    Separator,
    Tag,
    Text,
} from '@gorgias/axiom'
import type { TagColor } from '@gorgias/axiom'

import type { BillingState, Plan, ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPrice,
    getPlanPriceFormatted,
    isTrial,
} from 'models/billing/utils'
import type {
    ResolvedPlan,
    ResolvedPlanStatus,
} from 'pages/settings/new_billing/components/BillingInternalViewUI/InternalManagePlanView/useInternalPlanEditor'

const STATUS_TAG: Record<
    ResolvedPlanStatus,
    { label: string; color: TagColor } | null
> = {
    unchanged: null,
    upgraded: { label: 'Upgraded', color: Color.Purple },
    downgraded: { label: 'Downgraded', color: Color.Red },
    added: { label: 'Added', color: Color.Purple },
    removed: { label: 'Removed', color: Color.Red },
}

function getProductDescription(plan: Plan, productType: ProductType): string {
    if (isTrial(plan)) return 'Trial'
    const info = PRODUCT_INFO[productType]
    return `${plan.name} - ${formatNumTickets(plan.num_quota_tickets ?? 0)} ${info.counter}/${plan.cadence}`
}

function getProductPrice(plan: Plan, productType: ProductType): string {
    if (isTrial(plan)) {
        const info = PRODUCT_INFO[productType]
        return `${getOverageUnitPriceFormatted(plan)} ${info.perTicket}`
    }
    return `${getPlanPriceFormatted(plan)}/${plan.cadence}`
}

function SummaryProductRow({
    productType,
    plan,
    currentPlan,
    status,
}: {
    productType: ProductType
    plan: Plan | null
    currentPlan: Plan | null
    status: ResolvedPlanStatus
}) {
    const isRemoved = status === 'removed'
    const displayPlan = plan ?? (isRemoved ? currentPlan : null)
    const priceChanged =
        ((status === 'upgraded' || status === 'downgraded') &&
            currentPlan !== null) ||
        isRemoved
    const tag = STATUS_TAG[status]

    return (
        <Box justifyContent="space-between" alignItems="flex-start">
            <Box flexDirection="column">
                <Box alignItems="center" gap="xs">
                    <Text variant="bold">
                        {PRODUCT_INFO[productType].title}
                    </Text>
                    {tag && <Tag color={tag.color}>{tag.label}</Tag>}
                </Box>
                {displayPlan && (
                    <Text size="sm" color="content-neutral-secondary">
                        {getProductDescription(displayPlan, productType)}
                    </Text>
                )}
            </Box>
            <Box alignItems="center" gap="xs">
                {priceChanged && currentPlan && (
                    <Text color="content-neutral-tertiary">
                        <s>{getProductPrice(currentPlan, productType)}</s>
                    </Text>
                )}
                {!isRemoved && plan && (
                    <Text>{getProductPrice(plan, productType)}</Text>
                )}
            </Box>
        </Box>
    )
}

type InternalSummaryProps = {
    billingState: BillingState
    resolvedPlans: ResolvedPlan[]
    hasChanges: boolean
}

export function InternalSummary({
    billingState,
    resolvedPlans,
    hasChanges,
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
                    <Button isDisabled={!hasChanges}>Preview changes</Button>
                </Box>
            </Box>
        </Card>
    )
}
