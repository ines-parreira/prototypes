import { appQueryClient } from '@repo/api-resources'

import { mockView } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AllViewSectionsQueryData } from '../../hooks/allViewSectionsQuery'
import type { AllViewsQueryData } from '../../hooks/allViewsQuery'
import type { ViewSection } from '../../types'
import { syncViewRealtimeEvent } from '../viewRealtimeEventStore'

const viewsQueryKey = queryKeys.views.listAllViews({ limit: 100 })
const viewSectionsQueryKey = queryKeys.views.listAllViewSections({
    limit: 100,
})

const createViewsQueryData = (
    views: ReturnType<typeof mockView>[],
): AllViewsQueryData =>
    ({
        pages: [
            {
                data: {
                    data: views,
                },
            },
        ],
        pageParams: [undefined],
    }) as AllViewsQueryData

const createSection = (
    overrides: Partial<ViewSection> & Pick<ViewSection, 'id'>,
): ViewSection => ({
    decoration: null,
    id: overrides.id,
    name: `Section ${overrides.id}`,
    private: false,
    ...overrides,
})

const createSectionsQueryData = (
    sections: ViewSection[],
): AllViewSectionsQueryData =>
    ({
        pages: [
            {
                data: {
                    data: sections,
                },
            },
        ],
        pageParams: [undefined],
    }) as AllViewSectionsQueryData

beforeEach(() => {
    appQueryClient.clear()
})

describe('syncViewRealtimeEvent', () => {
    it('adds created visible views to cached list-all views data', () => {
        const existingView = mockView({ id: 1 })
        const createdView = mockView({ id: 2 })
        appQueryClient.setQueryData(
            viewsQueryKey,
            createViewsQueryData([existingView]),
        )

        syncViewRealtimeEvent({
            type: 'view-created',
            view: createdView,
            isViewVisibleToCurrentUser: true,
        })

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewsQueryKey)
                ?.pages[0].data.data,
        ).toEqual([existingView, createdView])
    })

    it('removes created hidden views from cached list-all views data', () => {
        const hiddenView = mockView({ id: 1 })
        appQueryClient.setQueryData(
            viewsQueryKey,
            createViewsQueryData([hiddenView]),
        )

        syncViewRealtimeEvent({
            type: 'view-created',
            view: hiddenView,
            isViewVisibleToCurrentUser: false,
        })

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewsQueryKey)
                ?.pages[0].data.data,
        ).toEqual([])
    })

    it('updates visible views in cached list-all views data', () => {
        const existingView = mockView({ id: 1, name: 'Old name' })
        const updatedView = mockView({ id: 1, name: 'Updated name' })
        appQueryClient.setQueryData(
            viewsQueryKey,
            createViewsQueryData([existingView]),
        )

        syncViewRealtimeEvent({
            type: 'view-updated',
            view: updatedView,
            isViewVisibleToCurrentUser: true,
        })

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewsQueryKey)
                ?.pages[0].data.data,
        ).toEqual([updatedView])
    })

    it('removes hidden updated views from cached list-all views data', () => {
        const hiddenView = mockView({ id: 1 })
        appQueryClient.setQueryData(
            viewsQueryKey,
            createViewsQueryData([hiddenView]),
        )

        syncViewRealtimeEvent({
            type: 'view-updated',
            view: hiddenView,
            isViewVisibleToCurrentUser: false,
        })

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewsQueryKey)
                ?.pages[0].data.data,
        ).toEqual([])
    })

    it('removes deleted views from cached list-all views data', () => {
        const deletedView = mockView({ id: 1 })
        const remainingView = mockView({ id: 2 })
        appQueryClient.setQueryData(
            viewsQueryKey,
            createViewsQueryData([deletedView, remainingView]),
        )

        syncViewRealtimeEvent({
            type: 'view-deleted',
            viewId: deletedView.id,
        })

        expect(
            appQueryClient.getQueryData<AllViewsQueryData>(viewsQueryKey)
                ?.pages[0].data.data,
        ).toEqual([remainingView])
    })

    it('adds created sections to cached list-all view sections data', () => {
        const existingSection = createSection({ id: 1 })
        const createdSection = createSection({ id: 2 })
        appQueryClient.setQueryData(
            viewSectionsQueryKey,
            createSectionsQueryData([existingSection]),
        )

        syncViewRealtimeEvent({
            type: 'view-section-created',
            section: createdSection,
        })

        expect(
            appQueryClient.getQueryData<AllViewSectionsQueryData>(
                viewSectionsQueryKey,
            )?.pages[0].data.data,
        ).toEqual([existingSection, createdSection])
    })

    it('updates cached list-all view sections data', () => {
        const existingSection = createSection({ id: 1 })
        const updatedSection = createSection({
            id: 1,
            name: 'Updated section',
        })
        appQueryClient.setQueryData(
            viewSectionsQueryKey,
            createSectionsQueryData([existingSection]),
        )

        syncViewRealtimeEvent({
            type: 'view-section-updated',
            section: updatedSection,
        })

        expect(
            appQueryClient.getQueryData<AllViewSectionsQueryData>(
                viewSectionsQueryKey,
            )?.pages[0].data.data,
        ).toEqual([updatedSection])
    })

    it('removes deleted sections from cached list-all view sections data', () => {
        const deletedSectionId = 1
        const deletedSection = createSection({ id: deletedSectionId })
        const remainingSection = createSection({ id: 2 })
        appQueryClient.setQueryData(
            viewSectionsQueryKey,
            createSectionsQueryData([deletedSection, remainingSection]),
        )

        syncViewRealtimeEvent({
            type: 'view-section-deleted',
            sectionId: deletedSectionId,
        })

        expect(
            appQueryClient.getQueryData<AllViewSectionsQueryData>(
                viewSectionsQueryKey,
            )?.pages[0].data.data,
        ).toEqual([remainingSection])
    })
})
