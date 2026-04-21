import * as views from '@repo/views'

import { mockView } from '@gorgias/helpdesk-mocks'
import { useGetView } from '@gorgias/helpdesk-queries'
import type * as HelpdeskQueries from '@gorgias/helpdesk-queries'

import { useDefaultViews } from '../../../../sidebar/hooks/useDefaultViews'
import { renderHook } from '../../../../tests/render.utils'
import { getViewDisplayName } from '../../../../utils/views'
import { useViewSearchMenuData } from '../useViewSearchMenuData'

vi.mock('@repo/views')
vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const actual = await importOriginal<typeof HelpdeskQueries>()

    return {
        ...actual,
        useGetView: vi.fn(),
    }
})
vi.mock('../../../../sidebar/hooks/useDefaultViews', () => ({
    useDefaultViews: vi.fn(),
}))

const mockUseGetView = vi.mocked(useGetView)
const mockUseDefaultViews = vi.mocked(useDefaultViews)
const mockUseAllViews = vi.mocked(views.useAllViews)
const mockUsePublicViews = vi.mocked(views.usePublicViews)
const mockUsePrivateViews = vi.mocked(views.usePrivateViews)
const mockUseAllViewSections = vi.mocked(views.useAllViewSections)
const mockUsePublicViewsOrdering = vi.mocked(views.usePublicViewsOrdering)
const mockUsePrivateViewsOrdering = vi.mocked(views.usePrivateViewsOrdering)

const defaultView = mockView({
    id: 1,
    name: 'Inbox',
    category: 'system',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'inbox',
    section_id: null,
    decoration: null,
})

const hiddenDefaultView = mockView({
    id: 8,
    name: 'Closed',
    category: 'system',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'closed',
    section_id: null,
})

const privateRootView = mockView({
    id: 2,
    name: 'Private backlog',
    category: 'custom',
    visibility: 'private',
    decoration: { emoji: '✨' },
    type: 'ticket-list',
    slug: 'private-backlog',
    section_id: null,
})

const privateSectionView = mockView({
    id: 3,
    name: 'VIP follow-up',
    category: 'custom',
    visibility: 'private',
    type: 'ticket-list',
    slug: 'vip-follow-up',
    section_id: 11,
})

const privateSecondSectionView = mockView({
    id: 6,
    name: 'Billing review',
    category: 'custom',
    visibility: 'private',
    type: 'ticket-list',
    slug: 'billing-review',
    section_id: 12,
})

const sharedRootView = mockView({
    id: 4,
    name: 'Shared queue',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-queue',
    section_id: null,
})

const sharedSectionView = mockView({
    id: 5,
    name: 'Shared escalations',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-escalations',
    section_id: 21,
})

const sharedSecondSectionView = mockView({
    id: 7,
    name: 'Shared handoff',
    category: 'custom',
    visibility: 'public',
    type: 'ticket-list',
    slug: 'shared-handoff',
    section_id: 22,
})

const allViews = [
    defaultView,
    privateRootView,
    privateSectionView,
    privateSecondSectionView,
    sharedRootView,
    sharedSectionView,
    sharedSecondSectionView,
]

describe('useViewSearchMenuData', () => {
    beforeEach(() => {
        mockUseGetView.mockReturnValue({
            data: { data: defaultView },
        } as never)
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: [defaultView, hiddenDefaultView],
            visibleSystemViews: [defaultView],
        } as never)
        mockUseAllViews.mockReturnValue(allViews as never)
        mockUsePublicViews.mockReturnValue([
            sharedRootView,
            sharedSectionView,
            sharedSecondSectionView,
        ] as never)
        mockUsePrivateViews.mockReturnValue([
            privateRootView,
            privateSectionView,
            privateSecondSectionView,
        ] as never)
        mockUseAllViewSections.mockReturnValue([
            { id: 11, name: 'My section', private: true },
            { id: 12, name: 'Billing section', private: true },
            { id: 21, name: 'Team section', private: false },
            { id: 22, name: 'Escalations', private: false },
        ] as never)
        mockUsePublicViewsOrdering.mockReturnValue({
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: {
                '22': { display_order: 1 },
                '21': { display_order: 2 },
            },
        } as never)
        mockUsePrivateViewsOrdering.mockReturnValue({
            views: {},
            view_sections: {
                '12': { display_order: 1 },
                '11': { display_order: 2 },
            },
        } as never)
    })

    it('groups root and section views using the section ordering data', () => {
        const { result } = renderHook(() =>
            useViewSearchMenuData({ viewId: 1, searchValue: '' }),
        )

        expect(result.current.activeView).toEqual(defaultView)
        expect(result.current.viewName).toBe(getViewDisplayName(defaultView))
        expect(result.current.defaultViews).toEqual([defaultView])
        expect(result.current.sharedRootViews).toEqual([sharedRootView])
        expect(result.current.privateRootViews).toEqual([privateRootView])
        expect(
            result.current.sharedSectionViews.map(
                ({ section }) => section.name,
            ),
        ).toEqual(['Escalations', 'Team section'])
        expect(
            result.current.privateSectionViews.map(
                ({ section }) => section.name,
            ),
        ).toEqual(['Billing section', 'My section'])
    })

    it('falls back to the all-views data when the active view query is not loaded', () => {
        mockUseGetView.mockReturnValue({
            data: undefined,
        } as never)

        const { result } = renderHook(() =>
            useViewSearchMenuData({ viewId: 2, searchValue: '' }),
        )

        expect(result.current.activeView).toEqual(privateRootView)
        expect(result.current.viewName).toBe('✨ Private backlog')
    })

    it('builds search results with the expected private and shared breadcrumbs', () => {
        const { result } = renderHook(() =>
            useViewSearchMenuData({ viewId: 1, searchValue: '' }),
        )

        const breadcrumbsByViewId = Object.fromEntries(
            result.current.searchResults.map(({ view, breadcrumb }) => [
                view.id,
                breadcrumb,
            ]),
        )

        expect(breadcrumbsByViewId[defaultView.id]).toBeUndefined()
        expect(breadcrumbsByViewId[privateRootView.id]).toBe('Private')
        expect(breadcrumbsByViewId[privateSectionView.id]).toBe(
            'Private > My section',
        )
        expect(breadcrumbsByViewId[sharedRootView.id]).toBe('Shared')
        expect(breadcrumbsByViewId[sharedSectionView.id]).toBe(
            'Shared > Team section',
        )
        expect(breadcrumbsByViewId[hiddenDefaultView.id]).toBeUndefined()
    })

    it('only exposes visible default views in the menu and search results', () => {
        const { result } = renderHook(() =>
            useViewSearchMenuData({ viewId: 1, searchValue: 'clo' }),
        )

        expect(result.current.defaultViews).toEqual([defaultView])
        expect(
            result.current.searchResults.map(({ view }) => view.id),
        ).not.toContain(hiddenDefaultView.id)
    })

    it('falls back to default system views when visible system views are unavailable', () => {
        mockUseDefaultViews.mockReturnValue({
            defaultSystemViews: [defaultView],
            visibleSystemViews: undefined,
        } as never)

        const { result } = renderHook(() =>
            useViewSearchMenuData({ viewId: 1, searchValue: 'ass' }),
        )

        expect(result.current.defaultViews).toEqual([defaultView])
        expect(
            result.current.searchResults.map(({ view }) => view.id),
        ).toContain(defaultView.id)
    })
})
