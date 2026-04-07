import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    useCreateCurrentUserSettings,
    useUpdateCurrentUserSettings,
} from '@gorgias/helpdesk-queries'

import type { PrivateViewsOrderingData } from '../types'
import {
    PRIVATE_VIEWS_ORDERING_QUERY_KEY,
    usePrivateViewsOrderingSetting,
} from './usePrivateViewsOrdering'
import type { PrivateViewsOrderingSetting } from './usePrivateViewsOrdering'

export function useUpdatePrivateViewsOrdering() {
    const queryClient = useQueryClient()
    const current = usePrivateViewsOrderingSetting()
    const { mutateAsync: createUserSetting } = useCreateCurrentUserSettings()
    const { mutateAsync: updateUserSetting } = useUpdateCurrentUserSettings()

    return useCallback(
        async (nextData: PrivateViewsOrderingData) => {
            const previous =
                queryClient.getQueryData<PrivateViewsOrderingSetting>(
                    PRIVATE_VIEWS_ORDERING_QUERY_KEY,
                )

            queryClient.setQueryData<PrivateViewsOrderingSetting>(
                PRIVATE_VIEWS_ORDERING_QUERY_KEY,
                { id: current.id, data: nextData },
            )

            try {
                if (current.id != null) {
                    await updateUserSetting({
                        id: current.id,
                        data: { type: 'views-ordering', data: nextData },
                    })
                } else {
                    const response = await createUserSetting({
                        data: { type: 'views-ordering', data: nextData },
                    })
                    queryClient.setQueryData<PrivateViewsOrderingSetting>(
                        PRIVATE_VIEWS_ORDERING_QUERY_KEY,
                        { id: response.data.id, data: nextData },
                    )
                }
            } catch (error) {
                queryClient.setQueryData(
                    PRIVATE_VIEWS_ORDERING_QUERY_KEY,
                    previous,
                )
                throw error
            }
        },
        [queryClient, current.id, createUserSetting, updateUserSetting],
    )
}
