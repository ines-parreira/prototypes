import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type { AccountSettingsItem, View } from '@gorgias/helpdesk-types'

import type { PrivateViewsOrderingData } from '../types'
import type { AllViewsQueryData } from './allViewsQuery'
import { ALL_VIEWS_QUERY_PARAMS } from './allViewsQuery'
import { PRIVATE_VIEWS_ORDERING_QUERY_KEY } from './usePrivateViewsOrdering'
import type { PrivateViewsOrderingSetting } from './usePrivateViewsOrdering'
import { PUBLIC_VIEWS_ORDERING_QUERY_KEY } from './usePublicViewsOrdering'

type AccountSettingsCache = {
    data: {
        data: AccountSettingsItem[]
    }
}

type ViewResponseCache = {
    data: View
}

export type ViewSectionMoveCacheItem = {
    id: number
    section_id?: number | null
}

type ViewSectionMoveCacheSync = {
    invalidate: () => void
    rollback: () => void
}

const noopViewSectionMoveCacheSync: ViewSectionMoveCacheSync = {
    invalidate: () => {},
    rollback: () => {},
}

export function useViewsOrderingCacheSync() {
    const queryClient = useQueryClient()

    const syncViewsOrderingQueryCache = useCallback(
        (
            nextSettingData: PrivateViewsOrderingData,
            isPrivateSetting: boolean,
            settingId: number,
        ) => {
            if (isPrivateSetting) {
                queryClient.setQueryData<PrivateViewsOrderingSetting>(
                    PRIVATE_VIEWS_ORDERING_QUERY_KEY,
                    {
                        id: settingId,
                        data: nextSettingData,
                    },
                )
                return
            }

            const cached = queryClient.getQueryData(
                PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            )
            queryClient.setQueryData(
                PUBLIC_VIEWS_ORDERING_QUERY_KEY,
                patchPublicViewsOrderingCache(
                    cached,
                    nextSettingData,
                    settingId,
                ),
            )
            void queryClient.invalidateQueries({
                queryKey: PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            })
        },
        [queryClient],
    )

    const syncViewQueriesForSectionMove = useCallback(
        async (
            currentView: ViewSectionMoveCacheItem,
            nextView: ViewSectionMoveCacheItem,
        ): Promise<ViewSectionMoveCacheSync> => {
            if (currentView.section_id === nextView.section_id) {
                return noopViewSectionMoveCacheSync
            }

            const viewListQueryKey = queryKeys.views.listAllViews(
                ALL_VIEWS_QUERY_PARAMS,
            )
            const viewDetailQueryKey = queryKeys.views.getView(nextView.id)

            await Promise.all([
                queryClient.cancelQueries({
                    queryKey: queryKeys.views.listAllViews(),
                }),
                queryClient.cancelQueries({
                    queryKey: queryKeys.views.getView(nextView.id),
                }),
            ])

            const previousViews =
                queryClient.getQueryData<AllViewsQueryData>(viewListQueryKey)
            const previousView =
                queryClient.getQueryData<ViewResponseCache>(viewDetailQueryKey)

            queryClient.setQueryData<AllViewsQueryData>(
                viewListQueryKey,
                patchViewSectionInAllViewsQuery(nextView),
            )
            queryClient.setQueryData<ViewResponseCache>(
                viewDetailQueryKey,
                patchViewSectionInDetailQuery(nextView),
            )

            return {
                invalidate: () => {
                    void queryClient.invalidateQueries({
                        queryKey: queryKeys.views.listAllViews(),
                    })
                    void queryClient.invalidateQueries({
                        queryKey: queryKeys.views.getView(nextView.id),
                    })
                },
                rollback: () => {
                    queryClient.setQueryData(viewListQueryKey, previousViews)
                    queryClient.setQueryData(viewDetailQueryKey, previousView)
                },
            }
        },
        [queryClient],
    )

    return {
        syncViewQueriesForSectionMove,
        syncViewsOrderingQueryCache,
    }
}

function isAccountSettingsCache(value: unknown): value is AccountSettingsCache {
    if (value == null || typeof value !== 'object' || !('data' in value)) {
        return false
    }
    return Array.isArray((value as AccountSettingsCache).data?.data)
}

function patchPublicViewsOrderingCache(
    cached: unknown,
    nextSettingData: PrivateViewsOrderingData,
    settingId: number,
) {
    if (!isAccountSettingsCache(cached)) {
        return {
            data: {
                data: [
                    {
                        id: settingId,
                        type: 'views-ordering',
                        data: nextSettingData,
                    },
                ],
            },
        }
    }

    const existingEntry = cached.data.data[0] ?? { type: 'views-ordering' }

    return {
        ...cached,
        data: {
            ...cached.data,
            data: [
                {
                    ...existingEntry,
                    id: settingId,
                    data: nextSettingData,
                },
            ],
        },
    }
}

function patchViewSectionInAllViewsQuery(nextView: ViewSectionMoveCacheItem) {
    return (
        cached: AllViewsQueryData | undefined,
    ): AllViewsQueryData | undefined => {
        if (!cached?.pages.length) {
            return cached
        }

        return {
            ...cached,
            pages: cached.pages.map((page) => ({
                ...page,
                data: {
                    ...page.data,
                    data: page.data.data.map((view) =>
                        view.id === nextView.id
                            ? {
                                  ...view,
                                  section_id: nextView.section_id ?? null,
                              }
                            : view,
                    ),
                },
            })),
        }
    }
}

function patchViewSectionInDetailQuery(nextView: ViewSectionMoveCacheItem) {
    return (
        cached: ViewResponseCache | undefined,
    ): ViewResponseCache | undefined => {
        if (!cached?.data) {
            return cached
        }

        return {
            ...cached,
            data: {
                ...cached.data,
                section_id: nextView.section_id ?? null,
            },
        }
    }
}
