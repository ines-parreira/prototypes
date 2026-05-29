import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { UserAvailabilityDetail } from '@gorgias/helpdesk-types'
import { updateUserAvailabilityInCache } from '../utils'

export const useUpdateUserAvailabilityInCache = () => {
    const client = useQueryClient()

    return useCallback(
        (data: UserAvailabilityDetail) => {
            return updateUserAvailabilityInCache(client, data)
        },
        [client],
    )
}
