import { StoreMapping } from 'models/storeMapping/types'

import groupIntegrationsByStore from '../groupIntegrationsByStore'

describe('groupIntegrationsByStore', () => {
    it('should group channel records from mappings', () => {
        const mockMappings: StoreMapping[] = [
            { store_id: 1, integration_id: 100 },
            { store_id: 1, integration_id: 101 },
            { store_id: 2, integration_id: 102 },
        ]

        const result = groupIntegrationsByStore(mockMappings)

        expect(result).toEqual([
            {
                store_id: 1,
                integrations: [100, 101],
            },
            {
                store_id: 2,
                integrations: [102],
            },
        ])
    })

    it('should handle empty mappings', () => {
        const result = groupIntegrationsByStore([])
        expect(result).toEqual([])
    })

    it('should handle single store with single integration', () => {
        const mockMappings: StoreMapping[] = [
            { store_id: 1, integration_id: 100 },
        ]

        const result = groupIntegrationsByStore(mockMappings)

        expect(result).toEqual([
            {
                store_id: 1,
                integrations: [100],
            },
        ])
    })
})
