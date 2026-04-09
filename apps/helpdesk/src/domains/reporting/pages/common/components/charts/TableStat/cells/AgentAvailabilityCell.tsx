import { useCallback } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import {
    AgentAvailabilityStatusSelect,
    useUpdateUserAvailabilityStatus,
} from '@repo/agent-status'
import { isAdmin, isTeamLead } from '@repo/permissions'

import {
    Box,
    Icon,
    LegacyBadge,
    Skeleton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useAvailabilityCellData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellData'
import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'

type Props = {
    userId: number
}

export function AgentAvailabilityCell({ userId }: Props) {
    const notify = useNotify()
    const { updateStatusAsync } = useUpdateUserAvailabilityStatus()
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
                await updateStatusAsync(userId, status.id)
            } catch {
                notify.error('Failed to update status. Please try again.')
            }
        },
        [userId, updateStatusAsync, notify],
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
                            name="triangle-warning"
                            color="orange"
                            size="sm"
                            aria-label="triangle-warning"
                        />
                    }
                >
                    <TooltipContent>{errorMessage}</TooltipContent>
                </Tooltip>
            )}
        </Box>
    )
}
