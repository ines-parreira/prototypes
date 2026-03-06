import { useMemo } from 'react'

import { Box, Color, Tag, Text } from '@gorgias/axiom'

import type { Plan } from 'models/billing/types'
import { getPlanPrice } from 'models/billing/utils'

type SummaryItemTitleProps = {
    title: string
    isSelected: boolean
    selectedPlanId?: string
    currentPlan?: Plan
    availablePlans: Plan[]
}

export function SummaryItemTitle({
    title,
    isSelected,
    selectedPlanId,
    currentPlan,
    availablePlans,
}: SummaryItemTitleProps) {
    const modificationStatus = useMemo(() => {
        if (!isSelected) {
            return null
        }

        const selectedAvailablePlan = availablePlans.find(
            (plan) => plan.plan_id === selectedPlanId,
        )
        if (!selectedAvailablePlan) {
            return null
        }

        if (!currentPlan) {
            return { label: 'Added', color: Color.Purple }
        }

        const currentAvailablePlan = availablePlans.find(
            (plan) => plan.plan_id === currentPlan.plan_id,
        )
        if (!currentAvailablePlan) {
            return null
        }

        const selectedAmount = getPlanPrice(selectedAvailablePlan)
        const currentAmount = getPlanPrice(currentAvailablePlan)

        if (selectedAmount > currentAmount) {
            return { label: 'Upgraded', color: Color.Purple }
        }
        if (selectedAmount < currentAmount) {
            return { label: 'Downgraded', color: Color.Red }
        }

        return null
    }, [availablePlans, selectedPlanId, currentPlan, isSelected])

    return (
        <Box gap="xs" alignItems="center">
            <Text variant="bold">{title}</Text>
            {modificationStatus && (
                <Tag color={modificationStatus.color}>
                    {modificationStatus.label}
                </Tag>
            )}
        </Box>
    )
}
