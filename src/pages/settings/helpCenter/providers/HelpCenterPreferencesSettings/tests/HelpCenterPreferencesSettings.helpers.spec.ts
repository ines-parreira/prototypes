import { StoreMapping } from 'models/storeMapping/types'

import {
    integrationIsAlreadyMapped,
    isConnectionGettingCreated,
    isConnectionGettingDeleted,
    isConnectionGettingUpdated,
} from '../HelpCenterPreferencesSettings.helpers'

describe('HelpCenterPreferencesSettings.helpers', () => {
    describe('integrationIsAlreadyMapped', () => {
        const mockStoreMappings: StoreMapping[] = [
            { store_id: 1, integration_id: 100 },
            { store_id: 2, integration_id: 200 },
            { store_id: 3, integration_id: 300 },
        ]

        it('should return true when integration is already mapped', () => {
            const result = integrationIsAlreadyMapped(200, mockStoreMappings)
            expect(result).toBe(true)
        })

        it('should return false when integration is not mapped', () => {
            const result = integrationIsAlreadyMapped(999, mockStoreMappings)
            expect(result).toBe(false)
        })

        it('should return false when store mappings array is empty', () => {
            const result = integrationIsAlreadyMapped(100, [])
            expect(result).toBe(false)
        })

        it('should handle integration in array', () => {
            const result = integrationIsAlreadyMapped(100, mockStoreMappings)
            expect(result).toBe(true)
        })
    })

    describe('isConnectionGettingCreated', () => {
        it('should return true when connection is getting created', () => {
            const result = isConnectionGettingCreated(null, 100)
            expect(result).toBe(true)
        })

        it('should return false when both are null', () => {
            const result = isConnectionGettingCreated(null, null)
            expect(result).toBe(false)
        })

        it('should return false when both are non-null', () => {
            const result = isConnectionGettingCreated(100, 200)
            expect(result).toBe(false)
        })

        it('should return false when connection is getting deleted', () => {
            const result = isConnectionGettingCreated(100, null)
            expect(result).toBe(false)
        })
    })

    describe('isConnectionGettingUpdated', () => {
        it('should return true when connection is getting updated', () => {
            const result = isConnectionGettingUpdated(100, 200)
            expect(result).toBe(true)
        })

        it('should return true when updating to same value', () => {
            const result = isConnectionGettingUpdated(100, 100)
            expect(result).toBe(true)
        })

        it('should return false when current is null', () => {
            const result = isConnectionGettingUpdated(null, 100)
            expect(result).toBe(false)
        })

        it('should return false when new is null', () => {
            const result = isConnectionGettingUpdated(100, null)
            expect(result).toBe(false)
        })

        it('should return false when both are null', () => {
            const result = isConnectionGettingUpdated(null, null)
            expect(result).toBe(false)
        })
    })

    describe('isConnectionGettingDeleted', () => {
        it('should return true when connection is getting deleted', () => {
            const result = isConnectionGettingDeleted(100, null)
            expect(result).toBe(true)
        })

        it('should return false when both are null', () => {
            const result = isConnectionGettingDeleted(null, null)
            expect(result).toBe(false)
        })

        it('should return false when both are non-null', () => {
            const result = isConnectionGettingDeleted(100, 200)
            expect(result).toBe(false)
        })

        it('should return false when connection is getting created', () => {
            const result = isConnectionGettingDeleted(null, 100)
            expect(result).toBe(false)
        })
    })
})
