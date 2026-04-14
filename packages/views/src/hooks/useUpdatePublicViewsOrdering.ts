import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    useCreateAccountSetting,
    useUpdateAccountSetting,
} from '@gorgias/helpdesk-queries'
import type { AccountSettingsItem } from '@gorgias/helpdesk-types'

import type { PublicViewsOrderingData } from '../types'
import {
    PUBLIC_VIEWS_ORDERING_QUERY_KEY,
    usePublicViewsOrderingSetting,
} from './usePublicViewsOrdering'

export function useUpdatePublicViewsOrdering() {
    const queryClient = useQueryClient()
    const current = usePublicViewsOrderingSetting()
    const { mutateAsync: createAccountSetting } = useCreateAccountSetting()
    const { mutateAsync: updateAccountSetting } = useUpdateAccountSetting()

    return useCallback(
        async (nextData: PublicViewsOrderingData) => {
            const cached = queryClient.getQueryData(
                PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            )

            queryClient.setQueryData(
                PUBLIC_VIEWS_ORDERING_QUERY_KEY,
                patchCache(cached, nextData),
            )

            try {
                if (current.id != null) {
                    await updateAccountSetting({
                        id: current.id,
                        data: { type: 'views-ordering', data: nextData },
                    })
                } else {
                    const response = await createAccountSetting({
                        data: { type: 'views-ordering', data: nextData },
                    })
                    queryClient.setQueryData(
                        PUBLIC_VIEWS_ORDERING_QUERY_KEY,
                        patchCache(cached, nextData, response.data.id),
                    )
                }
            } catch (error) {
                queryClient.setQueryData(
                    PUBLIC_VIEWS_ORDERING_QUERY_KEY,
                    cached,
                )
                throw error
            }
        },
        [queryClient, current.id, createAccountSetting, updateAccountSetting],
    )
}

type AccountSettingsCache = {
    data: {
        data: AccountSettingsItem[]
    }
}

function isAccountSettingsCache(value: unknown): value is AccountSettingsCache {
    if (typeof value !== 'object' || value === null || !('data' in value)) {
        return false
    }
    const outer = value.data
    if (typeof outer !== 'object' || outer === null || !('data' in outer)) {
        return false
    }
    return Array.isArray(outer.data)
}

function patchCache(
    cached: unknown,
    nextData: PublicViewsOrderingData,
    settingId?: number,
) {
    if (!isAccountSettingsCache(cached)) return cached

    const existingEntry = cached.data.data[0] ?? { type: 'views-ordering' }

    return {
        ...cached,
        data: {
            ...cached.data,
            data: [
                {
                    ...existingEntry,
                    ...(settingId != null ? { id: settingId } : {}),
                    data: nextData,
                },
            ],
        },
    }
}
