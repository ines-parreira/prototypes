import { renderHook } from '@repo/testing/vitest'
import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AllViewsQueryData } from '../allViewsQuery'
import { ALL_VIEWS_QUERY_PARAMS } from '../allViewsQuery'
import { PRIVATE_VIEWS_ORDERING_QUERY_KEY } from '../usePrivateViewsOrdering'
import { PUBLIC_VIEWS_ORDERING_QUERY_KEY } from '../usePublicViewsOrdering'
import { useViewsOrderingCacheSync } from '../useViewsOrderingCacheSync'

const createViewsQueryData = (
    views: Array<{ id: number; section_id: number | null }>,
) =>
    ({
        pages: [
            {
                data: {
                    data: views,
                },
            },
        ],
        pageParams: [undefined],
    }) as unknown as AllViewsQueryData

describe('useViewsOrderingCacheSync', () => {
    it('updates public ordering cache before invalidating it', () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const nextOrdering = {
            views: {
                1: { display_order: 1 },
            },
            view_sections: {
                2: { display_order: 0 },
            },
        }

        result.current.queryClient.setQueryData(
            PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            {
                data: {
                    data: [
                        {
                            id: 42,
                            type: 'views-ordering',
                            data: {
                                views: {},
                                view_sections: {},
                            },
                        },
                    ],
                },
            },
        )

        result.current.syncViewsOrderingQueryCache(nextOrdering, false, 42)

        expect(
            result.current.queryClient.getQueryData(
                PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            ),
        ).toEqual({
            data: {
                data: [
                    {
                        id: 42,
                        type: 'views-ordering',
                        data: nextOrdering,
                    },
                ],
            },
        })
    })

    it('creates the public ordering cache when it is missing', () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const nextOrdering = {
            views: {
                1: { display_order: 1 },
            },
            view_sections: {},
        }

        result.current.syncViewsOrderingQueryCache(nextOrdering, false, 99)

        expect(
            result.current.queryClient.getQueryData(
                PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            ),
        ).toEqual({
            data: {
                data: [
                    {
                        id: 99,
                        type: 'views-ordering',
                        data: nextOrdering,
                    },
                ],
            },
        })
    })

    it('updates private ordering cache', () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const nextOrdering = {
            views: {
                3: { display_order: 0 },
            },
            view_sections: {},
        }

        result.current.syncViewsOrderingQueryCache(nextOrdering, true, 77)

        expect(
            result.current.queryClient.getQueryData(
                PRIVATE_VIEWS_ORDERING_QUERY_KEY,
            ),
        ).toEqual({
            id: 77,
            data: nextOrdering,
        })
    })

    it('cancels active view queries before patching moved view section', async () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const invalidateQueries = vi.spyOn(
            result.current.queryClient,
            'invalidateQueries',
        )
        const cancelQueries = vi.spyOn(
            result.current.queryClient,
            'cancelQueries',
        )

        await result.current.syncViewQueriesForSectionMove(
            { id: 4, section_id: null },
            { id: 4, section_id: 10 },
        )

        expect(cancelQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.views.listAllViews(),
        })
        expect(cancelQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.views.getView(4),
        })
        expect(invalidateQueries).not.toHaveBeenCalled()
    })

    it('invalidates view list and view detail after section move succeeds', async () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const invalidateQueries = vi.spyOn(
            result.current.queryClient,
            'invalidateQueries',
        )

        const cacheSync = await result.current.syncViewQueriesForSectionMove(
            { id: 4, section_id: null },
            { id: 4, section_id: 10 },
        )

        expect(invalidateQueries).not.toHaveBeenCalled()

        cacheSync.invalidate()

        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.views.listAllViews(),
        })
        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.views.getView(4),
        })
    })

    it('patches moved view section in view query caches and can roll back', async () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const viewListQueryKey = queryKeys.views.listAllViews(
            ALL_VIEWS_QUERY_PARAMS,
        )
        const viewDetailQueryKey = queryKeys.views.getView(4)
        const view = { id: 4, section_id: null }

        result.current.queryClient.setQueryData(
            viewListQueryKey,
            createViewsQueryData([view]),
        )
        result.current.queryClient.setQueryData(viewDetailQueryKey, {
            data: view,
        })

        const cacheSync = await result.current.syncViewQueriesForSectionMove(
            view,
            {
                id: 4,
                section_id: 10,
            },
        )

        expect(
            result.current.queryClient.getQueryData<AllViewsQueryData>(
                viewListQueryKey,
            )?.pages[0].data.data,
        ).toEqual([{ id: 4, section_id: 10 }])
        expect(
            result.current.queryClient.getQueryData(viewDetailQueryKey),
        ).toEqual({
            data: { id: 4, section_id: 10 },
        })

        cacheSync.rollback()

        expect(
            result.current.queryClient.getQueryData<AllViewsQueryData>(
                viewListQueryKey,
            )?.pages[0].data.data,
        ).toEqual([view])
        expect(
            result.current.queryClient.getQueryData(viewDetailQueryKey),
        ).toEqual({
            data: view,
        })
    })

    it('does not sync view queries when section is unchanged', async () => {
        const { result } = renderHook(() => {
            const queryClient = useQueryClient()
            return {
                queryClient,
                ...useViewsOrderingCacheSync(),
            }
        })
        const invalidateQueries = vi.spyOn(
            result.current.queryClient,
            'invalidateQueries',
        )
        const cancelQueries = vi.spyOn(
            result.current.queryClient,
            'cancelQueries',
        )

        await result.current.syncViewQueriesForSectionMove(
            { id: 4, section_id: 10 },
            { id: 4, section_id: 10 },
        )

        expect(cancelQueries).not.toHaveBeenCalled()
        expect(invalidateQueries).not.toHaveBeenCalled()
    })
})
