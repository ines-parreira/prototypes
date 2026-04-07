import { formatNumTickets, PRODUCT_INFO } from '@repo/billing'

import { Box, Color, Tag, Text } from '@gorgias/axiom'
import type { TagColor } from '@gorgias/axiom'

import type { Plan, ProductType } from 'models/billing/types'
import {
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    isTrial,
} from 'models/billing/utils'

import type { ResolvedPlanStatus } from './useInternalPlanEditor'

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

type SummaryProductRowProps = {
    productType: ProductType
    plan: Plan | null
    currentPlan: Plan | null
    status: ResolvedPlanStatus
}

export function SummaryProductRow({
    productType,
    plan,
    currentPlan,
    status,
}: SummaryProductRowProps) {
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
                    <Text variant="bold">
                        {getProductPrice(plan, productType)}
                    </Text>
                )}
            </Box>
        </Box>
    )
}
