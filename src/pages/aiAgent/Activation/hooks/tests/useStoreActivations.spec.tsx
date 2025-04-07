import { StoreActivation } from '../../components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { getStoreConfigurationFixture } from '../tests/fixtures/store-configurations.fixture'
import { computeActivationPercentage } from '../useStoreActivations'

describe('computeActivationPercentage', () => {
    const createStoreActivation = (
        chatEnabled: boolean,
        emailEnabled: boolean,
        salesEnabled: boolean,
    ): StoreActivation => ({
        name: 'Test Store',
        title: 'Test Store',
        alerts: [],
        configuration: getStoreConfigurationFixture({
            storeName: 'test-store',
            shopType: 'shopify',
        }),
        sales: {
            isDisabled: false,
            enabled: salesEnabled,
        },
        support: {
            enabled: chatEnabled || emailEnabled,
            chat: {
                enabled: chatEnabled,
                isIntegrationMissing: false,
            },
            email: {
                enabled: emailEnabled,
                isIntegrationMissing: false,
            },
        },
    })

    it('returns 0% when no stores are present', () => {
        const state = {}
        expect(computeActivationPercentage(state)).toBe(0)
    })

    it('returns 0% when all features are disabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, false, false),
        }
        expect(computeActivationPercentage(state)).toBe(0)
    })

    it('returns 33% when only chat is enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, false, false),
        }
        expect(computeActivationPercentage(state)).toBe(33)
    })

    it('returns 33% when only email is enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(33)
    })

    it('returns 33% when only sales is enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, false, true),
        }
        expect(computeActivationPercentage(state)).toBe(33)
    })

    it('returns 67% when chat and email are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(67)
    })

    it('returns 67% when chat and sales are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, false, true),
        }
        expect(computeActivationPercentage(state)).toBe(67)
    })

    it('returns 67% when email and sales are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(false, true, true),
        }
        expect(computeActivationPercentage(state)).toBe(67)
    })

    it('returns 100% when all features are enabled for a single store', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
        }
        expect(computeActivationPercentage(state)).toBe(100)
    })

    it('returns 50% when one store has all features enabled and another has none', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
            store2: createStoreActivation(false, false, false),
        }
        expect(computeActivationPercentage(state)).toBe(50)
    })

    it('returns 83% when one store has all features enabled and another has one disabled', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
            store2: createStoreActivation(true, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(83)
    })

    it('returns 78% when one store has all features enabled and another has two features enabled', () => {
        const state = {
            store1: createStoreActivation(true, true, true),
            store2: createStoreActivation(true, true, false),
            store3: createStoreActivation(true, true, false),
        }
        expect(computeActivationPercentage(state)).toBe(78)
    })
})
