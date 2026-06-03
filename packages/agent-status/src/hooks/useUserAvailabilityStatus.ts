import { useMemo } from 'react'

import { useUserAvailability } from '@repo/users'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import type { AgentStatusWithSystem } from '../types'
import { resolveActiveStatus } from '../utils/resolveActiveStatus'
import { useSelectableAgentAvailabilityStatuses } from './useSelectableAgentAvailabilityStatuses'

type UseUserAvailabilityStatusParams = {
    userId: number
}

type UseUserAvailabilityStatusReturn = {
    status: AgentStatusWithSystem | undefined
    availability: UserAvailability | undefined
}

/**
 * Hook that resolves the active agent status for a user.
 * Combines user availability status and selectable statuses to determine the current active status.
 *
 * @param userId - The user ID to get the active status for
 * @returns The active agent status (or undefined) and the raw availability payload
 *
 * @example
 * const { status, availability } = useUserAvailabilityStatus({ userId: 123 })
 */
export const useUserAvailabilityStatus = ({
    userId,
}: UseUserAvailabilityStatusParams): UseUserAvailabilityStatusReturn => {
    const availability = useUserAvailability(userId)

    const { allStatuses } = useSelectableAgentAvailabilityStatuses()

    const status = useMemo<AgentStatusWithSystem | undefined>(
        () => resolveActiveStatus(availability, allStatuses),
        [availability, allStatuses],
    )

    return {
        status,
        availability,
    }
}
