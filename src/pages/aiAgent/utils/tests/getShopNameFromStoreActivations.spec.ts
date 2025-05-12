import { StoreActivation } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { isStoreEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'

import { getShopNameFromStoreActivations } from '../getShopNameFromStoreActivations'

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils', () => ({
    getStoresEligibleForTrial: jest.fn(),
    isStoreEligibleForTrial: jest.fn(),
}))

describe('getShopNameFromStoreActivations', () => {
    it('should return an empty string if no stores are present', () => {
        const result = getShopNameFromStoreActivations({})
        expect(result).toBe('')
    })

    it('should return the only store key if there is one store', () => {
        const storeActivations = {
            store1: {} as StoreActivation,
        }
        const result = getShopNameFromStoreActivations(storeActivations)
        expect(result).toBe('store1')
    })

    it('should return the first eligible store name if eligible stores exist', () => {
        const storeActivations = {
            store1: {
                configuration: { storeName: 'Store 1' },
            } as StoreActivation,
            store2: {
                configuration: { storeName: 'Store 2' },
            } as StoreActivation,
        }
        ;(isStoreEligibleForTrial as jest.Mock).mockImplementation((store) => {
            return store.configuration.storeName === 'Store 2'
        })

        const result = getShopNameFromStoreActivations(storeActivations)
        expect(result).toBe('Store 2')
    })

    it('should return the first store key if no eligible stores exist', () => {
        const storeActivations = {
            store1: {
                configuration: { storeName: 'Store 1' },
            } as StoreActivation,
            store2: {
                configuration: { storeName: 'Store 2' },
            } as StoreActivation,
        }
        ;(isStoreEligibleForTrial as jest.Mock).mockReturnValue(false)

        const result = getShopNameFromStoreActivations(storeActivations)
        expect(result).toBe('store1')
    })
})
