import { renderHook } from '@repo/testing'

import { IntegrationType } from 'models/integration/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

import { useCanEnableAiAgentDuringTrial } from '../useCanEnableAiAgentDuringTrial'

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
jest.mock(
    'pages/aiAgent/components/ShoppingAssistant/utils/extractShopNameFromUrl',
)

const mockUseAppSelector = jest.fn()
const mockUseTrialAccess = jest.fn()
const mockExtractShopNameFromUrl = jest.fn()

jest.requireMock('hooks/useAppSelector').default = mockUseAppSelector
jest.requireMock('pages/aiAgent/trial/hooks/useTrialAccess').useTrialAccess =
    mockUseTrialAccess
jest.requireMock(
    'pages/aiAgent/components/ShoppingAssistant/utils/extractShopNameFromUrl',
).extractShopNameFromUrl = mockExtractShopNameFromUrl

const createMockShopifyIntegration = (shopName: string) => ({
    id: 123,
    type: IntegrationType.Shopify,
    meta: {
        shop_name: shopName,
    },
})

describe('useCanEnableAiAgentDuringTrial', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockExtractShopNameFromUrl.mockReturnValue('test-shop')
    })

    it('should return correct values during trial period', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('test-shop'),
            createMockShopifyIntegration('other-shop'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.AiAgent,
            hasCurrentStoreTrialStarted: true,
            hasCurrentStoreTrialExpired: false,
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useCanEnableAiAgentDuringTrial('other-shop'),
        )

        expect(result.current.isDuringTrial).toBe(true)
        expect(result.current.storeIntegration).toEqual(
            mockShopifyIntegrations[1],
        )
        expect(result.current.isLoading).toBe(false)
        expect(mockUseTrialAccess).toHaveBeenCalledWith('other-shop')
    })

    it('should return correct values when trial has expired', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('test-shop'),
            createMockShopifyIntegration('other-shop'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.AiAgent,
            hasCurrentStoreTrialStarted: true,
            hasCurrentStoreTrialExpired: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useCanEnableAiAgentDuringTrial())

        expect(result.current.isDuringTrial).toBe(false)
        expect(result.current.storeIntegration).toEqual(
            mockShopifyIntegrations[0],
        )
        expect(result.current.isLoading).toBe(false)
    })

    it('should return correct values when trial has not started', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('test-shop'),
            createMockShopifyIntegration('other-shop'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.AiAgent,
            hasCurrentStoreTrialStarted: false,
            hasCurrentStoreTrialExpired: false,
            isLoading: false,
        })

        const { result } = renderHook(() => useCanEnableAiAgentDuringTrial())

        expect(result.current.isDuringTrial).toBe(false)
        expect(result.current.storeIntegration).toEqual(
            mockShopifyIntegrations[0],
        )
        expect(result.current.isLoading).toBe(false)
    })

    it('should return correct values when trial type is not AiAgent', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('test-shop'),
            createMockShopifyIntegration('other-shop'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.ShoppingAssistant,
            hasCurrentStoreTrialStarted: true,
            hasCurrentStoreTrialExpired: false,
            isLoading: false,
        })

        const { result } = renderHook(() => useCanEnableAiAgentDuringTrial())

        expect(result.current.isDuringTrial).toBe(false)
        expect(result.current.storeIntegration).toEqual(
            mockShopifyIntegrations[0],
        )
        expect(result.current.isLoading).toBe(false)
    })

    it('should handle when no matching integration is found', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('other-shop-1'),
            createMockShopifyIntegration('other-shop-2'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockExtractShopNameFromUrl.mockReturnValue('test-shop')
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.AiAgent,
            hasCurrentStoreTrialStarted: true,
            hasCurrentStoreTrialExpired: false,
            isLoading: false,
        })

        const { result } = renderHook(() => useCanEnableAiAgentDuringTrial())

        expect(result.current.storeIntegration).toBeUndefined()
        expect(result.current.isDuringTrial).toBe(true)
    })

    it('should handle loading state from useTrialAccess', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('test-shop'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.AiAgent,
            hasCurrentStoreTrialStarted: true,
            hasCurrentStoreTrialExpired: false,
            isLoading: true,
        })

        const { result } = renderHook(() => useCanEnableAiAgentDuringTrial())

        expect(result.current.isLoading).toBe(true)
    })

    it('should handle error state from useTrialAccess', () => {
        const mockShopifyIntegrations = [
            createMockShopifyIntegration('test-shop'),
        ]

        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)
        mockUseTrialAccess.mockReturnValue({
            trialType: TrialType.AiAgent,
            hasCurrentStoreTrialStarted: true,
            hasCurrentStoreTrialExpired: false,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => useCanEnableAiAgentDuringTrial())

        expect(result.current.isError).toBe(true)
    })
})
