import { appQueryClient } from '@repo/api-resources'

import { vi } from 'vitest'
import { mockView } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AllViewsQueryData } from '../../hooks/allViewsQuery'
import {
    getAllViews,
    getView,
    syncViewCreated,
    syncViewDeleted,
    syncViewUpdated,
} from '../viewStore'

const viewListQueryKey = queryKeys.views.listAllViews({ limit: 100 })

const createQueryData = (views: ReturnType<typeof mockView>[]) =>
    createQueryDataPages([views])

const createQueryDataPages = (viewPages: ReturnType<typeof mockView>[][]) =>
    ({
        pages: viewPages.map((views) => ({
            data: {
                data: views,
            },
        })),
        pageParams: viewPages.map(() => undefined),
    }) as AllViewsQueryData

beforeEach(() => {
    vi.restoreAllMocks()
    appQueryClient.clear()
})

describe('getView', () => {
    it('returns the view by ID', () => {
        const view = mockView({ id: 42 })
        appQueryClient.setQueryData(viewListQueryKey, createQueryData([view]))

        expect(getView(42)).toBe(view)
    })

    it('returns undefined for an unknown ID', () => {
        expect(getView(999)).toBeUndefined()
    })
})

describe('getAllViews', () => {
    it('returns all views', () => {
        const views = [mockView({ id: 1 }), mockView({ id: 2 })]
        appQueryClient.setQueryData(viewListQueryKey, createQueryData(views))

        expect(getAllViews()).toEqual(views)
    })

    it('returns an empty array when no views are set', () => {
        expect(getAllViews()).toEqual([])
    })
})

describe('view cache sync', () => {
    it('adds created views to cached list-all views data', () => {
        const existingView = mockView({ id: 1 })
        const createdView = mockView({ id: 2 })
        appQueryClient.setQueryData(
            viewListQueryKey,
            createQueryData([existingView]),
        )

        syncViewCreated(createdView)

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewListQueryKey)
                ?.pages[0].data.data,
        ).toEqual([existingView, createdView])
    })

    it('does not create cached list-all views data when the cache is empty', () => {
        syncViewCreated(mockView({ id: 1 }))

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewListQueryKey),
        ).toBeUndefined()
    })

    it('adds created views only to the first cached page', () => {
        const firstPageView = mockView({ id: 1 })
        const secondPageView = mockView({ id: 2 })
        const createdView = mockView({ id: 3 })
        appQueryClient.setQueryData(
            viewListQueryKey,
            createQueryDataPages([[firstPageView], [secondPageView]]),
        )

        syncViewCreated(createdView)

        expect(
            appQueryClient
                .getQueryData<AllViewsQueryData>(viewListQueryKey)
                ?.pages.map((page) => page.data.data),
        ).toEqual([[firstPageView, createdView], [secondPageView]])
    })

    it('updates cached list-all views data', () => {
        const existingView = mockView({ id: 1, name: 'Old name' })
        const updatedView = mockView({ id: 1, name: 'Updated name' })
        appQueryClient.setQueryData(
            viewListQueryKey,
            createQueryData([existingView]),
        )

        syncViewUpdated(updatedView)

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewListQueryKey)
                ?.pages[0].data.data,
        ).toEqual([updatedView])
    })

    it('updates existing views on later cached pages without changing page order', () => {
        const firstPageView = mockView({ id: 1, name: 'First page' })
        const existingView = mockView({ id: 2, name: 'Old name' })
        const updatedView = mockView({ id: 2, name: 'Updated name' })
        appQueryClient.setQueryData(
            viewListQueryKey,
            createQueryDataPages([[firstPageView], [existingView]]),
        )

        syncViewUpdated(updatedView)

        expect(
            appQueryClient
                .getQueryData<AllViewsQueryData>(viewListQueryKey)
                ?.pages.map((page) => page.data.data),
        ).toEqual([[firstPageView], [updatedView]])
    })

    it('removes deleted views from cached list-all views data', () => {
        const deletedViewId = 1
        const deletedView = mockView({ id: deletedViewId })
        const remainingView = mockView({ id: 2 })
        appQueryClient.setQueryData(
            viewListQueryKey,
            createQueryData([deletedView, remainingView]),
        )

        syncViewDeleted(deletedViewId)

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewListQueryKey)
                ?.pages[0].data.data,
        ).toEqual([remainingView])
    })

    it('removes deleted views from every cached page', () => {
        const deletedViewId = 1
        const deletedViewFromFirstPage = mockView({ id: deletedViewId })
        const deletedViewFromSecondPage = mockView({ id: deletedViewId })
        const remainingView = mockView({ id: 2 })
        appQueryClient.setQueryData(
            viewListQueryKey,
            createQueryDataPages([
                [deletedViewFromFirstPage],
                [remainingView, deletedViewFromSecondPage],
            ]),
        )

        syncViewDeleted(deletedViewId)

        expect(
            appQueryClient
                .getQueryData<AllViewsQueryData>(viewListQueryKey)
                ?.pages.map((page) => page.data.data),
        ).toEqual([[], [remainingView]])
    })

    it('invalidates list-all views after mutating the cache', () => {
        const invalidateQueriesSpy = vi.spyOn(
            appQueryClient,
            'invalidateQueries',
        )
        appQueryClient.setQueryData(viewListQueryKey, createQueryData([]))

        syncViewCreated(mockView({ id: 1 }))

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.views.listAllViews(),
        })
    })
})
