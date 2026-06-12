import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
} from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { useAllIntegrations } from '../useAllIntegrations'

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

const createMockResponse = (data: Integration[], nextCursor: string | null) =>
    mockListIntegrationsResponse({
        data,
        meta: {
            next_cursor: nextCursor,
            prev_cursor: null,
        },
    })

const mockIntegration1: Integration = {
    id: 1,
    name: 'Integration 1',
    type: 'phone',
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),
    meta: {
        phone_number: '+1234567890',
        display_name: ' 1',
        routing: {
            rules: [],
        },
    },
}

const mockIntegration2: Integration = {
    id: 2,
    name: 'Integration 2',
    type: 'phone',
    created_datetime: new Date().toISOString(),
    updated_datetime: new Date().toISOString(),
    meta: {
        phone_number: '+1111111111',
        display_name: '2',
        routing: {
            rules: [],
        },
    },
}

describe('useAllIntegrations', () => {
    it('should return loading state initially', () => {
        server.use(
            mockListIntegrationsHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(createMockResponse([], null))
            }).handler,
        )

        const { result } = renderHook(() => useAllIntegrations())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.integrations).toStrictEqual([])
    })

    it('should fetch and return integrations successfully', async () => {
        const mockData = createMockResponse(
            [mockIntegration1, mockIntegration2],
            null,
        )

        const listIntegrationsMock = mockListIntegrationsHandler(async () =>
            HttpResponse.json(mockData),
        )
        const waitForListIntegrationsRequest =
            listIntegrationsMock.waitForRequest(server)
        server.use(listIntegrationsMock.handler)

        const { result } = renderHook(() => useAllIntegrations())

        await waitFor(() => {
            expect(result.current.integrations).toEqual(mockData.data)
        })
        await waitForListIntegrationsRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('cursor')).toBe(null)
            expect(searchParams.get('limit')).toBe('100')
        })
    })

    it('should handle pagination correctly', async () => {
        const firstPage = createMockResponse([mockIntegration1], 'next_page')
        const secondPage = createMockResponse([mockIntegration2], null)
        const requests: URL[] = []

        server.use(
            mockListIntegrationsHandler(async ({ request }) => {
                const url = new URL(request.url)
                requests.push(url)

                return HttpResponse.json(
                    url.searchParams.get('cursor') === 'next_page'
                        ? secondPage
                        : firstPage,
                )
            }).handler,
        )

        const { result } = renderHook(() => useAllIntegrations())

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.integrations).toEqual([
            ...firstPage.data,
            ...secondPage.data,
        ])
        expect(requests).toHaveLength(2)
        expect(requests[0].searchParams.get('cursor')).toBe(null)
        expect(requests[0].searchParams.get('limit')).toBe('100')
        expect(requests[1].searchParams.get('cursor')).toBe('next_page')
        expect(requests[1].searchParams.get('limit')).toBe('100')
    })
})
