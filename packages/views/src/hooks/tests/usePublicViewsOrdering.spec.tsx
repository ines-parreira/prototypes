import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
} from '@gorgias/helpdesk-mocks'

import { usePublicViewsOrdering } from '../usePublicViewsOrdering'

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

describe('usePublicViewsOrdering', () => {
    it('returns empty ordering when no settings exist', async () => {
        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json(
                    mockListAccountSettingsResponse({ data: [] }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => usePublicViewsOrdering())

        await waitFor(() => {
            expect(result.current).toEqual({
                views: {},
                views_top: {},
                views_bottom: {},
                view_sections: {},
            })
        })
    })

    it('returns ordering data from account settings', async () => {
        const ordering = {
            views: { '1': { display_order: 1 } },
            views_top: { '2': { display_order: 2 } },
            views_bottom: {},
            view_sections: {},
        }
        server.use(
            mockListAccountSettingsHandler(async () =>
                HttpResponse.json(
                    mockListAccountSettingsResponse({
                        data: [
                            { id: 42, type: 'views-ordering', data: ordering },
                        ],
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => usePublicViewsOrdering())

        await waitFor(() => {
            expect(result.current).toEqual(ordering)
        })
    })
})
