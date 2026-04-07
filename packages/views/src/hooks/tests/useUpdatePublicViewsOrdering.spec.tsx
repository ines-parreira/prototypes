import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateAccountSettingHandler,
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
    mockUpdateAccountSettingHandler,
} from '@gorgias/helpdesk-mocks'

import type { PublicViewsOrderingData } from '../../types'
import { usePublicViewsOrdering } from '../usePublicViewsOrdering'
import { useUpdatePublicViewsOrdering } from '../useUpdatePublicViewsOrdering'

const nextOrdering: PublicViewsOrderingData = {
    views: { '1': { display_order: 1 }, '2': { display_order: 2 } },
    views_top: {},
    views_bottom: {},
    view_sections: { '10': { display_order: 1 } },
}

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

function useHooks() {
    const ordering = usePublicViewsOrdering()
    const updateOrdering = useUpdatePublicViewsOrdering()
    return { ordering, updateOrdering }
}

describe('useUpdatePublicViewsOrdering', () => {
    it('creates a new account setting when no settingId exists', async () => {
        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json(
                    mockListAccountSettingsResponse({ data: [] }),
                ),
            ).handler,
            mockCreateAccountSettingHandler(async () =>
                HttpResponse.json({
                    id: 99,
                    type: 'views-ordering',
                    data: nextOrdering,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(result.current.ordering).toEqual({
                views: {},
                views_top: {},
                views_bottom: {},
                view_sections: {},
            })
        })

        await result.current.updateOrdering(nextOrdering)

        await waitFor(() => {
            expect(result.current.ordering).toEqual(nextOrdering)
        })
    })

    it('updates an existing account setting when settingId exists', async () => {
        const existingOrdering: PublicViewsOrderingData = {
            views: { '99': { display_order: 1 } },
            views_top: {},
            views_bottom: {},
            view_sections: {},
        }

        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json(
                    mockListAccountSettingsResponse({
                        data: [
                            {
                                id: 50,
                                type: 'views-ordering',
                                data: existingOrdering,
                            },
                        ],
                    }),
                ),
            ).handler,
            mockUpdateAccountSettingHandler(async () =>
                HttpResponse.json({
                    id: 50,
                    type: 'views-ordering',
                    data: nextOrdering,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(result.current.ordering).toEqual(existingOrdering)
        })

        await result.current.updateOrdering(nextOrdering)

        await waitFor(() => {
            expect(result.current.ordering).toEqual(nextOrdering)
        })
    })

    it('optimistically updates before the request completes', async () => {
        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json(
                    mockListAccountSettingsResponse({ data: [] }),
                ),
            ).handler,
            mockCreateAccountSettingHandler(async () =>
                HttpResponse.json({
                    id: 99,
                    type: 'views-ordering',
                    data: nextOrdering,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(result.current.ordering.views).toEqual({})
        })

        const promise = result.current.updateOrdering(nextOrdering)

        await waitFor(() => {
            expect(result.current.ordering).toEqual(nextOrdering)
        })

        await promise
    })

    it('rolls back on error', async () => {
        const originalOrdering: PublicViewsOrderingData = {
            views: { '1': { display_order: 5 } },
            views_top: {},
            views_bottom: {},
            view_sections: {},
        }

        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json(
                    mockListAccountSettingsResponse({
                        data: [
                            {
                                id: 50,
                                type: 'views-ordering',
                                data: originalOrdering,
                            },
                        ],
                    }),
                ),
            ).handler,
            mockUpdateAccountSettingHandler(
                async () => new HttpResponse(null, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(result.current.ordering).toEqual(originalOrdering)
        })

        await expect(
            result.current.updateOrdering(nextOrdering),
        ).rejects.toThrow()

        await waitFor(() => {
            expect(result.current.ordering).toEqual(originalOrdering)
        })
    })
})
