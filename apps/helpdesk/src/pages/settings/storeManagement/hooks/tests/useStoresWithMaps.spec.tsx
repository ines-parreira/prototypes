import { renderHook } from '@repo/testing'

import { useGetStoreMappingsByAccountId } from '@gorgias/helpdesk-queries'

import useAllIntegrations from 'hooks/useAllIntegrations'
import { Integration, IntegrationType } from 'models/integration/types'

import useStoresWithMaps from '../useStoresWithMaps'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetStoreMappingsByAccountId: jest.fn(),
}))

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('useStoresWithMaps', () => {
    const mockStoreMappings = [
        { store_id: 1, integration_id: 100 },
        { store_id: 1, integration_id: 101 },
    ]

    const mockIntegrations = [
        { id: 1, type: IntegrationType.Shopify, name: 'Test Store' },
        { id: 2, type: IntegrationType.Magento2, name: 'Test Store 2' },
        { id: 100, type: IntegrationType.Email, name: 'Email Channel' },
        { id: 101, type: IntegrationType.GorgiasChat, name: 'Chat Channel' },
    ] as Integration[]

    const mockRefetch = jest.fn()

    beforeEach(() => {
        ;(useGetStoreMappingsByAccountId as jest.Mock).mockReturnValue({
            data: { data: { data: mockStoreMappings } },
            refetch: mockRefetch,
        })
        ;(useAllIntegrations as jest.Mock).mockReturnValue({
            integrations: mockIntegrations,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return enriched stores with assigned channels', () => {
        const { result } = renderHook(() => useStoresWithMaps())

        expect(result.current.enrichedStores).toHaveLength(2)
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

    it('should return unassigned channels', () => {
        const { result } = renderHook(() => useStoresWithMaps())

        expect(result.current.unassignedChannels).toEqual([])
    })

    it('should handle empty data', () => {
        ;(useGetStoreMappingsByAccountId as jest.Mock).mockReturnValue({
            data: undefined,
            refetch: mockRefetch,
        })
        ;(useAllIntegrations as jest.Mock).mockReturnValue({
            integrations: undefined,
        })

        const { result } = renderHook(() => useStoresWithMaps())

        expect(result.current.enrichedStores).toEqual([])
        expect(result.current.unassignedChannels).toEqual([])
    })

    it('should expose refetch function', () => {
        const { result } = renderHook(() => useStoresWithMaps())

        expect(result.current.refetchMapping).toBe(mockRefetch)
    })
})
