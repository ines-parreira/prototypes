import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import {fromJS} from 'immutable'
import {assumeMock} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {StoreState} from 'state/types'
import {IntegrationType} from 'models/integration/constants'
import {useHasAccessToAILibrary} from '../useHasAccessToAILibrary'

jest.mock('hooks/useAppSelector')

const mockedUseAppSelector = assumeMock(useAppSelector)

describe('useHasAccessToAILibrary', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [
                        {id: 1, type: IntegrationType.Shopify},
                        {id: 2, type: IntegrationType.BigCommerce},
                    ],
                }),
            } as unknown as StoreState)
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
        mockedUseAppSelector.mockImplementation((selector) =>
            selector({
                integrations: fromJS({
                    integrations: [{id: 1, type: IntegrationType.Shopify}],
                }),
            } as unknown as StoreState)
        )

        const {result} = renderHook(() => useHasAccessToAILibrary())
        expect(result.current).toBe(true)
    })
})
