import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateCurrentUserSettingsHandler,
    mockUpdateCurrentUserSettingsHandler,
} from '@gorgias/helpdesk-mocks'

import type { PrivateViewsOrderingData } from '../../types'
import { usePrivateViewsOrdering } from '../usePrivateViewsOrdering'
import { useUpdatePrivateViewsOrdering } from '../useUpdatePrivateViewsOrdering'

const win = window as Record<string, any>

const nextOrdering: PrivateViewsOrderingData = {
    views: { '1': { display_order: 1 }, '2': { display_order: 2 } },
    view_sections: { '10': { display_order: 1 } },
}

const server = setupServer()
let savedGorgiasState: unknown

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
    savedGorgiasState = win.GORGIAS_STATE
})

afterEach(() => {
    server.resetHandlers()
    win.GORGIAS_STATE = savedGorgiasState
})

afterAll(() => {
    server.close()
})

function useHooks() {
    const ordering = usePrivateViewsOrdering()
    const updateOrdering = useUpdatePrivateViewsOrdering()
    return { ordering, updateOrdering }
}

describe('useUpdatePrivateViewsOrdering', () => {
    it('creates a new user setting when no settingId exists', async () => {
        server.use(
            mockCreateCurrentUserSettingsHandler(async () =>
                HttpResponse.json({
                    id: 77,
                    type: 'views-ordering',
                    data: nextOrdering,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await result.current.updateOrdering(nextOrdering)

        await waitFor(() => {
            expect(result.current.ordering).toEqual(nextOrdering)
        })
    })

    it('updates an existing user setting when settingId exists', async () => {
        win.GORGIAS_STATE = {
            ...win.GORGIAS_STATE,
            currentUser: {
                ...win.GORGIAS_STATE?.currentUser,
                settings: [
                    {
                        id: 33,
                        type: 'views-ordering',
                        data: { views: {}, view_sections: {} },
                    },
                ],
            },
        }

        server.use(
            mockUpdateCurrentUserSettingsHandler(async () =>
                HttpResponse.json({
                    id: 33,
                    type: 'views-ordering',
                    data: nextOrdering,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(result.current.ordering.views).toEqual({})
        })

        await result.current.updateOrdering(nextOrdering)

        await waitFor(() => {
            expect(result.current.ordering).toEqual(nextOrdering)
        })
    })

    it('rolls back on error', async () => {
        server.use(
            mockCreateCurrentUserSettingsHandler(
                async () => new HttpResponse(null, { status: 500 }),
            ).handler,
        )

        const { result } = renderHook(() => useHooks())

        await waitFor(() => {
            expect(result.current.ordering).toEqual({
                views: {},
                view_sections: {},
            })
        })

        await expect(
            result.current.updateOrdering(nextOrdering),
        ).rejects.toThrow()

        await waitFor(() => {
            expect(result.current.ordering).toEqual({
                views: {},
                view_sections: {},
            })
        })
    })
})
