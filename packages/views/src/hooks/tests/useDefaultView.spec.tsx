import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
    mockListViewSectionsHandler,
    mockListViewSectionsResponse,
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'
import type { View } from '@gorgias/helpdesk-types'

import type {
    PrivateViewsOrderingData,
    PublicViewsOrderingData,
    ViewSection,
} from '../../types'
import { useDefaultView } from '../useDefaultView'

const inboxView = mockView({ id: 1, name: 'Inbox', category: 'system' })
const unassignedView = mockView({
    id: 2,
    name: 'Unassigned',
    category: 'system',
})
const allView = mockView({ id: 3, name: 'All', category: 'system' })
const snoozedView = mockView({ id: 4, name: 'Snoozed', category: 'system' })
const closedView = mockView({ id: 5, name: 'Closed', category: 'system' })
const trashView = mockView({ id: 6, name: 'Trash', category: 'system' })
const spamView = mockView({ id: 7, name: 'Spam', category: 'system' })

const ALL_SYSTEM_VIEWS = [
    inboxView,
    unassignedView,
    allView,
    snoozedView,
    closedView,
    trashView,
    spamView,
]

const { mockPublicOrdering, mockPrivateOrdering } = vi.hoisted(() => {
    const mockPublicOrdering: { current: PublicViewsOrderingData } = {
        current: {
            views: {},
            views_top: {},
            views_bottom: {},
            view_sections: {},
        },
    }
    const mockPrivateOrdering: { current: PrivateViewsOrderingData } = {
        current: { views: {}, view_sections: {} },
    }
    return { mockPublicOrdering, mockPrivateOrdering }
})

vi.mock('../usePublicViewsOrdering', () => ({
    usePublicViewsOrdering: () => mockPublicOrdering.current,
}))

vi.mock('../usePrivateViewsOrdering', () => ({
    usePrivateViewsOrdering: () => mockPrivateOrdering.current,
}))

function buildListViewsHandler(views: View[]) {
    return mockListViewsHandler(async () =>
        HttpResponse.json(
            mockListViewsResponse({
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                    total_resources: views.length,
                },
                data: views,
            }),
        ),
    ).handler
}

function buildListViewSectionsHandler(sections: ViewSection[]) {
    return mockListViewSectionsHandler(async () =>
        HttpResponse.json(
            mockListViewSectionsResponse({
                meta: { next_cursor: null, prev_cursor: null },
                data: sections,
            }),
        ),
    ).handler
}

function buildVisibilityHandler(hiddenViewIds: number[]) {
    return mockListAccountSettingsHandler(async () =>
        HttpResponse.json(
            mockListAccountSettingsResponse({
                data: [
                    {
                        id: 1,
                        type: 'views-visibility',
                        data: { hidden_views: hiddenViewIds },
                    },
                ],
            }),
        ),
    ).handler
}

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        buildListViewsHandler(ALL_SYSTEM_VIEWS),
        buildListViewSectionsHandler([]),
        buildVisibilityHandler([]),
    )
    mockPublicOrdering.current = {
        views: {},
        views_top: {},
        views_bottom: {},
        view_sections: {},
    }
    mockPrivateOrdering.current = { views: {}, view_sections: {} }
    window.localStorage.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useDefaultView', () => {
    it('returns Inbox by default when all system views are visible', async () => {
        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('Inbox')
        })
    })

    it('returns null while data is loading', () => {
        const { result } = renderHook(() => useDefaultView())

        expect(result.current).toBeNull()
    })

    it('respects views_top ordering when picking the top system view', async () => {
        mockPublicOrdering.current = {
            views: {},
            views_top: {
                '1': { display_order: 2 },
                '2': { display_order: 1 },
            },
            views_bottom: {},
            view_sections: {},
        }

        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('Unassigned')
        })
    })

    it('falls back past hidden top system views', async () => {
        server.use(buildVisibilityHandler([inboxView.id, unassignedView.id]))

        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('All')
        })
    })

    it('falls back to the first public view when all top system views are hidden', async () => {
        const publicViewA = mockView({
            id: 100,
            name: 'Public A',
            category: 'user',
            visibility: 'public',
        })
        const publicViewB = mockView({
            id: 101,
            name: 'Public B',
            category: 'user',
            visibility: 'public',
        })

        server.use(
            buildListViewsHandler([
                ...ALL_SYSTEM_VIEWS,
                publicViewA,
                publicViewB,
            ]),
            buildVisibilityHandler([1, 2, 3, 4]),
        )
        mockPublicOrdering.current = {
            views: {
                '100': { display_order: 2 },
                '101': { display_order: 1 },
            },
            views_top: {},
            views_bottom: {},
            view_sections: {},
        }

        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('Public B')
        })
    })

    it('falls back to bottom system view when no public/private views exist and all top are hidden', async () => {
        server.use(buildVisibilityHandler([1, 2, 3, 4]))

        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('Closed')
        })
    })

    it('returns first private view when viewCategories localStorage prefers private', async () => {
        window.localStorage.setItem(
            'viewCategories',
            JSON.stringify(['private', 'public']),
        )

        const privateView = mockView({
            id: 200,
            name: 'My Private',
            category: 'user',
            visibility: 'private',
        })
        const publicView = mockView({
            id: 201,
            name: 'Some Public',
            category: 'user',
            visibility: 'public',
        })

        server.use(
            buildListViewsHandler([
                ...ALL_SYSTEM_VIEWS,
                privateView,
                publicView,
            ]),
            buildVisibilityHandler([1, 2, 3, 4]),
        )

        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('My Private')
        })
    })

    it('uses the first child of a section when the section is the first navbar element', async () => {
        const section: ViewSection = {
            id: 10,
            name: 'Section A',
            private: false,
        }
        const viewInSection = mockView({
            id: 300,
            name: 'Section View',
            category: 'user',
            visibility: 'public',
            section_id: 10,
        })
        const standaloneView = mockView({
            id: 301,
            name: 'Standalone',
            category: 'user',
            visibility: 'public',
        })

        server.use(
            buildListViewsHandler([
                ...ALL_SYSTEM_VIEWS,
                viewInSection,
                standaloneView,
            ]),
            buildListViewSectionsHandler([section]),
            buildVisibilityHandler([1, 2, 3, 4]),
        )

        mockPublicOrdering.current = {
            views: { '301': { display_order: 2 } },
            views_top: {},
            views_bottom: {},
            view_sections: { '10': { display_order: 1 } },
        }

        const { result } = renderHook(() => useDefaultView())

        await waitFor(() => {
            expect(result.current?.name).toBe('Section View')
        })
    })
})
