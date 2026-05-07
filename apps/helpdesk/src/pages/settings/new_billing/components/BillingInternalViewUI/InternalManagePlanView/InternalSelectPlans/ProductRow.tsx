import { useMemo } from 'react'

import { formatNumTickets, PRODUCT_INFO } from '@repo/billing'

import type { IconName } from '@gorgias/axiom'
import {
    Box,
    Button,
    Color,
    Icon,
    ListItem,
    Select,
    Tag,
    Text,
} from '@gorgias/axiom'

import type { Plan, PlanId } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import { isTrial } from 'models/billing/utils'

const PRODUCT_TYPE_TO_ICON: Record<ProductType, IconName> = {
    [ProductType.Helpdesk]: 'system-desktop',
    [ProductType.Automation]: 'zap',
    [ProductType.Voice]: 'comm-phone',
    [ProductType.SMS]: 'comm-chat',
    [ProductType.Convert]: 'attach-money',
}

type PlanOption = {
    id: PlanId
    formattedTickets: string
    name: string
}

function getStatusBadge(plan: Plan | null) {
    if (!plan) return <Tag color={Color.Grey}>Inactive</Tag>
    if (isTrial(plan)) return <Tag color={Color.Blue}>Trial</Tag>
    return <Tag color={Color.Green}>Active</Tag>
}

export type ProductRowProps = {
    productType: ProductType
    plan: Plan | null
    catalogPlans: Record<PlanId, Plan> | undefined
    selectedPlanId: PlanId | undefined
    onPlanSelect: (productType: ProductType, planId: PlanId) => void
    isProductActive: boolean
    actionLabel?: string
    onAction?: () => void
}

export function ProductRow({
    productType,
    plan,
    catalogPlans,
    selectedPlanId,
    onPlanSelect,
    isProductActive,
    actionLabel,
    onAction,
}: ProductRowProps) {
    const productInfo = PRODUCT_INFO[productType]

    const planOptions: PlanOption[] = useMemo(
        () =>
            catalogPlans
                ? Object.values(catalogPlans).map((plan) => ({
                      id: plan.plan_id,
                      formattedTickets: formatNumTickets(
                          plan.num_quota_tickets ?? 0,
                      ),
                      name: plan.name,
                  }))
                : [],
        [catalogPlans],
    )
    const selectedOption =
        planOptions.find((o) => o.id === selectedPlanId) ?? null
    const resolvedPlan =
        (selectedPlanId ? catalogPlans?.[selectedPlanId] : undefined) ?? plan

    return (
        <Box flexDirection="column" gap="xs">
            <Box alignItems="center" justifyContent="space-between">
                <Box alignItems="center" gap="sm">
                    <Icon
                        name={PRODUCT_TYPE_TO_ICON[productType]}
                        color="blue"
                        withBackground
                    />
                    <Text variant="bold">{productInfo.title}</Text>
                    {isProductActive && getStatusBadge(resolvedPlan)}
                </Box>
                {actionLabel && onAction && (
                    <Button variant="tertiary" size="sm" onClick={onAction}>
                        {actionLabel}
                    </Button>
                )}
            </Box>
            {isProductActive && (
                <Box alignItems="center" gap="sm">
                    {planOptions.length > 0 && (
                        <Select
                            aria-label={`${productInfo.title} plan`}
                            items={planOptions}
                            selectedItem={selectedOption}
                            onSelect={(option: PlanOption) =>
                                onPlanSelect(productType, option.id)
                            }
                            placeholder="Select a plan"
                            isSearchable
                            maxHeight={300}
                            trigger={({ isOpen }) => (
                                <Button
                                    variant="secondary"
                                    trailingSlot={
                                        isOpen
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                >
                                    {selectedOption?.formattedTickets ??
                                        'Select a plan'}
                                </Button>
                            )}
                        >
                            {(option: PlanOption) => (
                                <ListItem
                                    label={
                                        <Box gap="md" alignItems="center">
                                            <Text>
                                                {option.formattedTickets}
                                            </Text>
                                            <Text
                                                color="content-neutral-tertiary"
                                                size="sm"
                                            >
                                                {option.id}
                                            </Text>
                                            {option.id === plan?.plan_id && (
                                                <Tag color={Color.Purple}>
                                                    Current plan
                                                </Tag>
                                            )}
                                        </Box>
                                    }
                                    textValue={`${option.formattedTickets} ${option.id}`}
                                />
                            )}
                        </Select>
                    )}
                    {resolvedPlan && (
                        <>
                            <Text color="content-neutral-tertiary">
                                {productInfo.counter}/{resolvedPlan.cadence}
                            </Text>
                            <Text>{resolvedPlan.name}</Text>
                            {selectedPlanId === plan?.plan_id &&
                                selectedOption && (
                                    <Tag color={Color.Purple}>Current plan</Tag>
                                )}
                        </>
                    )}
                </Box>
            )}
        </Box>
    )
}
