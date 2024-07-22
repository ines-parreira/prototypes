import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import {useShopifyIntegrations} from 'pages/stats/convert/hooks/useShopifyIntegrations'
import {assumeMock} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {useHasAccessToAILibrary} from '../useHasAccessToAILibrary'

jest.mock('pages/stats/convert/hooks/useShopifyIntegrations')

const mockedUseShopifyIntegrations = assumeMock(useShopifyIntegrations)

describe('useHasAccessToAILibrary', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseShopifyIntegrations.mockImplementation(
            () =>
                [{id: 1}, {id: 2}] as unknown as ReturnType<
                    typeof useShopifyIntegrations
                >
        )
        mockFlags({
            [FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]: true,
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                true,
        })
    })

    it('should return true if feature flags are enabled for multiple brands', () => {
        const {result} = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(true)
    })

    it('should return false if there are multiple brands and feature flags are not enabled', () => {
        mockFlags({
            [FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]: false,
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                false,
        })

        const {result} = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(false)
    })

    it('should return true if there are not multiple brands', () => {
        mockFlags({
            [FeatureFlagKey.ObservabilityShowAILibraryForMultiBrands]: false,
            [FeatureFlagKey.ObservabilityAllowAIGeneratedArticlesForMultiStore]:
                false,
        })
        mockedUseShopifyIntegrations.mockImplementation(
            () =>
                [{id: 1}] as unknown as ReturnType<
                    typeof useShopifyIntegrations
                >
        )

        const {result} = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(true)
    })
})
