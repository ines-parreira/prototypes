import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import type { StoreMapping } from 'models/storeMapping/types'

import getUnassignedChannels from '../getUnassignedChannels'

describe('getUnassignedChannels', () => {
    const mockIntegrations: Integration[] = [
        { id: 1, type: IntegrationType.Email, name: 'Email' } as Integration,
        {
            id: 2,
            type: IntegrationType.GorgiasChat,
            name: 'Chat',
        } as Integration,
        { id: 3, type: IntegrationType.Phone, name: 'Phone' } as Integration,
        { id: 4 } as Integration,
    ]

    const mockStoreMappings: StoreMapping[] = [
        { store_id: 1, integration_id: 1 },
        { store_id: 1, integration_id: 2 },
    ]

    it('should return unassigned eligible channels', () => {
        const result = getUnassignedChannels(
            mockIntegrations,
            mockStoreMappings,
        )
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual(
            expect.objectContaining({
                id: 3,
                type: IntegrationType.Phone,
                name: 'Phone',
            }),
        )
    })

    it('should handle empty integrations', () => {
        const result = getUnassignedChannels([], mockStoreMappings)
        expect(result).toEqual([])
    })

    it('should handle empty mappings', () => {
        const result = getUnassignedChannels(mockIntegrations, [])
        expect(result).toHaveLength(3)
    })
})
