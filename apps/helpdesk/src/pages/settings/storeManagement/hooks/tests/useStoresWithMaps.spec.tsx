import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockGetStoreMappingsByAccountIdHandler,
    mockGetStoreMappingsByAccountIdResponse,
    mockStoreMapping,
} from '@gorgias/helpdesk-mocks'

import { useAllIntegrations } from 'hooks/useAllIntegrations'
import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'

import { useStoresWithMaps } from '../useStoresWithMaps'

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    useAllIntegrations: jest.fn(),
}))

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

describe('useStoresWithMaps', () => {
    const mockStoreMappings = [
        mockStoreMapping({ store_id: 1, integration_id: 100 }),
        mockStoreMapping({ store_id: 1, integration_id: 101 }),
    ]

    const mockIntegrations = [
        { id: 1, type: IntegrationType.Shopify, name: 'Test Store' },
        { id: 2, type: IntegrationType.Magento2, name: 'Test Store 2' },
        { id: 100, type: IntegrationType.Email, name: 'Email Channel' },
        { id: 101, type: IntegrationType.GorgiasChat, name: 'Chat Channel' },
    ] as Integration[]

    beforeEach(() => {
        server.use(
            mockGetStoreMappingsByAccountIdHandler(async () =>
                HttpResponse.json(
                    mockGetStoreMappingsByAccountIdResponse({
                        data: mockStoreMappings,
                    }),
                ),
            ).handler,
        )
        ;(useAllIntegrations as jest.Mock).mockReturnValue({
            integrations: mockIntegrations,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return enriched stores with assigned channels', async () => {
        const { result } = renderHook(() => useStoresWithMaps())

        await waitFor(() => {
            expect(
                result.current.enrichedStores[0]?.assignedChannels,
            ).toHaveLength(2)
        })
        expect(result.current.enrichedStores[0]).toEqual(
            expect.objectContaining({
                store: expect.objectContaining({
                    id: 1,
                    type: IntegrationType.Shopify,
                    name: 'Test Store',
                }),
                assignedChannels: expect.arrayContaining([
                    expect.objectContaining({
                        id: 100,
                        type: IntegrationType.Email,
                    }),
                    expect.objectContaining({
                        id: 101,
                        type: IntegrationType.GorgiasChat,
                    }),
                ]),
            }),
        )
    })

    it('should return unassigned channels', async () => {
        const { result } = renderHook(() => useStoresWithMaps())

        await waitFor(() => {
            expect(result.current.unassignedChannels).toEqual([])
        })
    })

    it('should handle empty data', async () => {
        server.use(
            mockGetStoreMappingsByAccountIdHandler(async () =>
                HttpResponse.json(
                    mockGetStoreMappingsByAccountIdResponse({ data: [] }),
                ),
            ).handler,
        )
        ;(useAllIntegrations as jest.Mock).mockReturnValue({
            integrations: undefined,
        })

        const { result } = renderHook(() => useStoresWithMaps())

        await waitFor(() => {
            expect(result.current.enrichedStores).toEqual([])
            expect(result.current.unassignedChannels).toEqual([])
        })
    })

    it('should expose refetch function', async () => {
        let requestCount = 0
        server.use(
            mockGetStoreMappingsByAccountIdHandler(async () => {
                requestCount += 1
                return HttpResponse.json(
                    mockGetStoreMappingsByAccountIdResponse({
                        data: mockStoreMappings,
                    }),
                )
            }).handler,
        )
        const { result } = renderHook(() => useStoresWithMaps())

        expect(typeof result.current.refetchMapping).toBe('function')

        await waitFor(() => {
            expect(requestCount).toBe(1)
        })

        await result.current.refetchMapping()

        await waitFor(() => {
            expect(requestCount).toBeGreaterThan(1)
        })
    })
})
