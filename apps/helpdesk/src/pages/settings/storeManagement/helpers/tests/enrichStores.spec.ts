import type { Integration } from 'models/integration/types'

import enrichStores from '../enrichStores'

describe('enrichStores', () => {
    const mockStoreToChannelsMapping = [
        { store_id: 1, integration_id: 100 },
        { store_id: 1, integration_id: 101 },
    ]

    const mockAllIntegrations = [
        { id: 1, type: 'shopify', name: 'Test Store' },
        { id: 2, type: 'magento2', name: 'Test Store 2' },
        { id: 3, type: 'other', name: 'Non-store integration' },
        { id: 100, type: 'email', name: 'Email Channel' },
        {
            id: 101,
            type: 'gorgias_chat',
            name: 'Chat Channel',
        },
    ] as Integration[]

    it('should filter and enrich stores with assigned channels', () => {
        const result = enrichStores(
            mockStoreToChannelsMapping,
            mockAllIntegrations,
        )

        expect(result.length).toBe(2)
        expect(result[0].store).toEqual(
            expect.objectContaining({
                id: 1,
                type: 'shopify',
                name: 'Test Store',
            }),
        )
        expect(result[0].assignedChannels).toHaveLength(2)
    })

    it('should handle empty data', () => {
        const result = enrichStores([], [])

        expect(result).toEqual([])
    })
})
