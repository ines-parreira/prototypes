import { useCallback } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import { AgentAvailabilityStatusSelect } from '@repo/agent-status'
import { isAdmin, isTeamLead } from '@repo/permissions'
import { useUpdateUserAvailability } from '@repo/users'

import {
    Box,
    Icon,
    LegacyBadge,
    Skeleton,
    toast,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAvailabilityCellData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellData'
import { useAppSelector } from 'hooks/useAppSelector'

type Props = {
    userId: number
}

export function AgentAvailabilityCell({ userId }: Props) {
    const { update } = useUpdateUserAvailability(userId)
    const currentUser = useAppSelector((state) => state.currentUser)

    const {
        status: agentAvailabilityStatus,
        agentPhoneUnavailabilityStatus,
        isOnActiveCall,
        isLoading,
        errorMessage,
        hasNoData,
    } = useAvailabilityCellData({ userId })

    const canEditStatus =
        isAdmin(currentUser.toJS()) || isTeamLead(currentUser.toJS())

    const handleSelectStatus = useCallback(
        async (status: AgentStatusWithSystem) => {
            try {
                await (status.id === 'available' || status.id === 'unavailable'
                    ? update(status.id)
                    : update('custom', status.id))
            } catch {
                toast.error('Failed to update status. Please try again.')
            }
        },
        [update],
    )

    if (isLoading && hasNoData) {
        return <Skeleton width={80} height={24} />
    }

    if (isOnActiveCall && agentPhoneUnavailabilityStatus) {
        return (
            <LegacyBadge type="warning">
                {agentPhoneUnavailabilityStatus.name}
            </LegacyBadge>
        )
    }

    return (
        <Box gap="xs" alignItems="center">
            {!hasNoData && (
                <AgentAvailabilityStatusSelect
                    activeAvailabilityStatus={
                        agentPhoneUnavailabilityStatus ||
                        agentAvailabilityStatus
                    }
                    onSelect={handleSelectStatus}
                    isDisabled={!canEditStatus}
                />
            )}
            {errorMessage && (
                <Tooltip
                    trigger={
                        <Icon
                            name="warning-triangle"
                            color="orange"
                            size="sm"
                            aria-label="warning-triangle"
                        />
                    }
                >
                    <TooltipContent>{errorMessage}</TooltipContent>
                </Tooltip>
            )}
        </Box>
    )
}
