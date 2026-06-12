import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetViewHandler,
    mockGetViewResponse,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { useIsTrashLikeView } from '../useIsTrashLikeView'

const viewId = 123
let getViewRequestCount = 0

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    getViewRequestCount = 0
    server.use(
        mockGetViewHandler(async () => {
            getViewRequestCount += 1

            return HttpResponse.json(
                mockGetViewResponse({
                    id: viewId,
                    filters: '',
                }),
            )
        }).handler,
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useIsTrashLikeView', () => {
    it('does not fetch persisted view metadata for draft views', async () => {
        const { result } = renderHook(() =>
            useIsTrashLikeView(viewId, { isDraftView: true }),
        )

        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(result.current).toBe(false)
        expect(getViewRequestCount).toBe(0)
    })

    it('returns false when the current view does not include the trash filter', async () => {
        const { result } = renderHook(() => useIsTrashLikeView(viewId))

        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })

    it('returns false when the current view response is missing', async () => {
        server.use(
            mockGetViewHandler(async () => HttpResponse.json(null)).handler,
        )

        const { result } = renderHook(() => useIsTrashLikeView(viewId))

        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })

    it('returns true when the current view includes the legacy trash filter', async () => {
        server.use(
            mockGetViewHandler(async () =>
                HttpResponse.json(
                    mockGetViewResponse({
                        id: viewId,
                        filters: 'isNotEmpty(ticket.trashed_datetime)',
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useIsTrashLikeView(viewId))

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })

    it('returns true when the trash filter is part of a longer filter string', async () => {
        server.use(
            mockGetViewHandler(async () =>
                HttpResponse.json(
                    mockGetViewResponse({
                        id: viewId,
                        filters:
                            "status = 'open' && isNotEmpty(ticket.trashed_datetime)",
                    }),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useIsTrashLikeView(viewId))

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })
})
