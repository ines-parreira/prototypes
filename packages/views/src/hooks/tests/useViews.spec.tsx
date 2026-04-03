import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewsHandler,
    mockListViewsResponse,
    mockView,
} from '@gorgias/helpdesk-mocks'

import { useViews } from '../useViews'

const view1 = mockView({ id: 1, name: 'Open tickets' })
const view2 = mockView({ id: 2, name: 'Unassigned' })

const mockListViews = mockListViewsHandler(async () =>
    HttpResponse.json(mockListViewsResponse({ data: [view1, view2] })),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListViews.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useViews', () => {
    it('returns empty array while loading', () => {
        const { result } = renderHook(() => useViews())

        expect(result.current.views).toEqual([])
    })

    it('fetches and returns views', async () => {
        const { result } = renderHook(() => useViews())

        await waitFor(() => {
            expect(result.current.views).toEqual([view1, view2])
        })
    })
})
