import { useMemo } from 'react'

import type { AgentStatusWithSystem } from '../types'
import { resolveActiveStatus } from '../utils/resolveActiveStatus'
import { useSelectableAgentAvailabilityStatuses } from './useSelectableAgentAvailabilityStatuses'
import { useUserAvailability } from './useUserAvailability'

type UseUserAvailabilityStatusParams = {
    userId: number
}

/**
 * Hook that resolves the active agent status for a user.
 * Combines user availability status and selectable statuses to determine the current active status.
 *
 * @param userId - The user ID to get the active status for
 * @returns The active agent status or undefined if not found
 *
 * @example
 * const { status, availability } = useUserAvailabilityStatus({ userId: 123 })
 */
export const useUserAvailabilityStatus = ({
    userId,
}: UseUserAvailabilityStatusParams) => {
    const { availability } = useUserAvailability({
        userId,
    })

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
