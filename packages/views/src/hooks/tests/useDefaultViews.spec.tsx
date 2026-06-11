import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import {
    useDefaultViews,
    useDefaultViewsError,
    useDefaultViewsLoading,
} from '../useDefaultViews'

const inboxView = mockView({ id: 1, name: 'Inbox', category: 'system' })
const unassignedView = mockView({
    id: 2,
    name: 'Unassigned',
    category: 'system',
})
const allView = mockView({ id: 3, name: 'All', category: 'system' })
const spamView = mockView({ id: 4, name: 'Spam', category: 'system' })
const defaultVisibilitySetting = {
    id: 42,
    type: 'views-visibility',
    data: { hidden_views: [] },
}

const server = setupServer()
let visibilitySetting:
    | {
          id: number
          type: string
          data: { hidden_views: number[] }
      }
    | undefined
let visibilitySettingDelay: Promise<void> | undefined
let orderingSettingDelay: Promise<void> | undefined

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    visibilitySetting = defaultVisibilitySetting
    visibilitySettingDelay = undefined
    orderingSettingDelay = undefined
    server.use(mockSystemViewsHandler(), mockAccountSettingsHandler())
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useDefaultViews', () => {
    it('returns SDK system views', async () => {
        const { result } = renderHook(() => useDefaultViews())

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'All',
                'Spam',
            ])
        })
    })

    it('filters visible system views when requested', async () => {
        visibilitySetting = {
            id: 42,
            type: 'views-visibility',
            data: { hidden_views: [2, 4] },
        }

        const { result } = renderHook(() =>
            useDefaultViews({ isVisible: true }),
        )

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual(['Inbox', 'All'])
        })
    })

    it('uses the first views-visibility setting when duplicated settings exist', async () => {
        server.use(
            mockListAccountSettingsHandler(async ({ request }) => {
                const type = new URL(request.url).searchParams.get('type')

                const data =
                    type === 'views-visibility'
                        ? [
                              {
                                  id: 41,
                                  type: 'views-visibility',
                                  data: { hidden_views: [] },
                              },
                              {
                                  id: 42,
                                  type: 'views-visibility',
                                  data: { hidden_views: [2] },
                              },
                          ]
                        : []

                return HttpResponse.json(
                    mockListAccountSettingsResponse({ data }),
                )
            }).handler,
        )

        const { result } = renderHook(() =>
            useDefaultViews({ isVisible: true }),
        )

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'All',
                'Spam',
            ])
        })
    })

    it('returns default views while the views-visibility setting is loading', async () => {
        let releaseVisibilitySetting: (() => void) | undefined
        visibilitySetting = {
            id: 42,
            type: 'views-visibility',
            data: { hidden_views: [2] },
        }
        visibilitySettingDelay = new Promise<void>((resolve) => {
            releaseVisibilitySetting = resolve
        })

        const { result } = renderHook(() =>
            useDefaultViews({ isVisible: true }),
        )

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'All',
                'Spam',
            ])
        })

        releaseVisibilitySetting?.()

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'All',
                'Spam',
            ])
        })
    })

    it('returns default views while the views-ordering setting is loading', async () => {
        let releaseOrderingSetting: (() => void) | undefined
        orderingSettingDelay = new Promise<void>((resolve) => {
            releaseOrderingSetting = resolve
        })

        const { result } = renderHook(() => useDefaultViews())

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'All',
                'Spam',
            ])
        })

        releaseOrderingSetting?.()
    })

    it('shows all system views when the views-visibility setting is missing', async () => {
        visibilitySetting = undefined

        const { result } = renderHook(() =>
            useDefaultViews({ isVisible: true }),
        )

        await waitFor(() => {
            expect(result.current.map((v) => v.name)).toEqual([
                'Inbox',
                'Unassigned',
                'All',
                'Spam',
            ])
        })
    })

    it('does not fetch SDK data when disabled', () => {
        const requestedUrls: string[] = []
        server.use(
            mockListViewsHandler(async ({ request }) => {
                requestedUrls.push(request.url)
                return HttpResponse.json(
                    mockListViewsResponse({
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        data: [inboxView],
                    }),
                )
            }).handler,
            mockListAccountSettingsHandler(async ({ request }) => {
                requestedUrls.push(request.url)
                return HttpResponse.json(
                    mockListAccountSettingsResponse({ data: [] }),
                )
            }).handler,
        )

        const { result } = renderHook(() =>
            useDefaultViews({ isEnabled: false }),
        )

        expect(result.current).toEqual([])
        expect(requestedUrls).toEqual([])
    })
})

describe('useDefaultViewsLoading', () => {
    it('reports loading while visible default views are loading', async () => {
        let releaseVisibilitySetting: (() => void) | undefined
        visibilitySettingDelay = new Promise<void>((resolve) => {
            releaseVisibilitySetting = resolve
        })

        const { result } = renderHook(() =>
            useDefaultViewsLoading({ isVisible: true }),
        )

        expect(result.current).toBe(true)

        releaseVisibilitySetting?.()

        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })

    it('reports loading while SDK system views are loading', async () => {
        let releaseSystemViews: (() => void) | undefined
        const systemViewsLoaded = new Promise<void>((resolve) => {
            releaseSystemViews = resolve
        })
        server.use(
            mockListViewsHandler(async () => {
                await systemViewsLoaded
                return HttpResponse.json(
                    mockListViewsResponse({
                        meta: {
                            next_cursor: null,
                            prev_cursor: null,
                            total_resources: 0,
                        },
                        data: [inboxView],
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() =>
            useDefaultViewsLoading({ isVisible: true }),
        )

        expect(result.current).toBe(true)

        releaseSystemViews?.()

        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })
})

describe('useDefaultViewsError', () => {
    it('reports an error when the views-visibility request fails', async () => {
        server.use(
            mockListAccountSettingsHandler(async ({ request }) => {
                const type = new URL(request.url).searchParams.get('type')
                if (type === 'views-visibility') {
                    return new HttpResponse(null, { status: 500 })
                }

                return HttpResponse.json(
                    mockListAccountSettingsResponse({ data: [] }),
                )
            }).handler,
        )

        const { result } = renderHook(() =>
            useDefaultViewsError({ isVisible: true }),
        )

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})

function mockSystemViewsHandler() {
    return mockListViewsHandler(async () =>
        HttpResponse.json(
            mockListViewsResponse({
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                    total_resources: 0,
                },
                data: [spamView, allView, unassignedView, inboxView],
            }),
        ),
    ).handler
}

function mockAccountSettingsHandler() {
    return mockListAccountSettingsHandler(async ({ request }) => {
        const type = new URL(request.url).searchParams.get('type')
        if (type === 'views-visibility') {
            await visibilitySettingDelay
        }
        if (type === 'views-ordering') {
            await orderingSettingDelay
        }

        const data =
            type === 'views-visibility' && visibilitySetting
                ? [visibilitySetting]
                : []

        return HttpResponse.json(mockListAccountSettingsResponse({ data }))
    }).handler
}
