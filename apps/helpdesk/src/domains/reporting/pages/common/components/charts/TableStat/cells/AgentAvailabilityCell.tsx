import { useCallback } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import {
    AgentAvailabilityStatusSelect,
    useUpdateUserAvailabilityStatus,
} from '@repo/agent-status'
import { isAdmin } from '@repo/utils'

import { Box, Icon, LegacyBadge, Skeleton, Text } from '@gorgias/axiom'

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
        status,
        agentPhoneUnavailabilityStatus,
        isLoading,
        isError,
        // isPhoneError is tracked separately but we don't show phone errors in UI
        // If phone status fails, we simply won't have agentPhoneUnavailabilityStatus
    } = useAvailabilityCellData({ userId })

    const canEditStatus = isAdmin(currentUser.toJS())

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

    if (isLoading) {
        return <Skeleton width={80} height={24} />
    }

    if (isError) {
        return (
            <Box gap="xs">
                <Icon name="triangle-warning" color="red" />
                <Text color="critical">Failed to load status</Text>
            </Box>
        )
    }

    // Phone status takes precedence
    if (agentPhoneUnavailabilityStatus) {
        return (
            <LegacyBadge type="warning">
                {agentPhoneUnavailabilityStatus.name}
            </LegacyBadge>
        )
    }

    return (
        <AgentAvailabilityStatusSelect
            activeAvailabilityStatus={status}
            onSelect={handleSelectStatus}
            isDisabled={!canEditStatus}
        />
    )
}
