import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewSectionsHandler,
    mockListViewSectionsResponse,
} from '@gorgias/helpdesk-mocks'

import { useAllViewSections } from '../useAllViewSections'

const section1 = { id: 1, name: 'Urgent', private: false }
const section2 = { id: 2, name: 'Personal', private: true }

const mockListViewSections = mockListViewSectionsHandler(async () =>
    HttpResponse.json(
        mockListViewSectionsResponse({ data: [section1, section2] }),
    ),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListViewSections.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useAllViewSections', () => {
    it('returns empty array while loading', () => {
        const { result } = renderHook(() => useAllViewSections())

        expect(result.current).toEqual([])
    })

    it('fetches and returns view sections', async () => {
        const { result } = renderHook(() => useAllViewSections())

        await waitFor(() => {
            expect(result.current).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: 1, name: 'Urgent' }),
                    expect.objectContaining({ id: 2, name: 'Personal' }),
                ]),
            )
        })
    })
})
