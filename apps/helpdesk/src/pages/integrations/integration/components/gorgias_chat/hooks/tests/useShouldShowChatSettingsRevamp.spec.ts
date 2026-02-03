import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import type { StoreIntegration } from 'models/integration/types'

import useShouldShowChatSettingsRevamp from '../useShouldShowChatSettingsRevamp'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const useFlagMock = useFlag as jest.Mock
const useAiAgentAccessMock = useAiAgentAccess as jest.Mock

describe('useRevampShouldShowChatPreview', () => {
    const mockShopifyIntegration: StoreIntegration = {
        id: 1,
        type: IntegrationType.Shopify,
        meta: {
            shop_name: 'test-shop',
            shop_domain: 'test-shop.myshopify.com',
        },
    } as StoreIntegration

    const mockBigCommerceIntegration: StoreIntegration = {
        id: 2,
        type: IntegrationType.BigCommerce,
        meta: {
            store_hash: 'test-store-hash',
            shop_domain: 'test-store.mybigcommerce.com',
        },
    } as StoreIntegration

    const mockMagento2Integration: StoreIntegration = {
        id: 3,
        type: IntegrationType.Magento2,
        meta: {
            store_url: 'https://test-store.com',
        },
    } as StoreIntegration

    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockReturnValue(false)
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    describe('when revamp is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('returns false when user has AI agent access with Shopify integration', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(false)
            expect(useFlag).toHaveBeenCalledWith(
                FeatureFlagKey.ChatSettingsRevamp,
            )
            expect(useAiAgentAccessMock).toHaveBeenCalledWith('test-shop')
        })

        it('returns true when user does not have AI agent access with Shopify integration', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
            expect(useAiAgentAccessMock).toHaveBeenCalledWith('test-shop')
        })

        it('returns false when user has AI agent access with BigCommerce integration', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockBigCommerceIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(false)
            expect(useAiAgentAccessMock).toHaveBeenCalledWith('test-store-hash')
        })

        it('returns true when user does not have AI agent access with BigCommerce integration', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockBigCommerceIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
            expect(useAiAgentAccessMock).toHaveBeenCalledWith('test-store-hash')
        })

        it('returns false when user has AI agent access with Magento2 integration', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockMagento2Integration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(false)
            expect(useAiAgentAccessMock).toHaveBeenCalledWith(
                'https://test-store.com',
            )
        })

        it('returns true when user does not have AI agent access with Magento2 integration', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockMagento2Integration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
            expect(useAiAgentAccessMock).toHaveBeenCalledWith(
                'https://test-store.com',
            )
        })

        it('returns true when store integration is undefined', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(undefined),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
            expect(useAiAgentAccessMock).toHaveBeenCalledWith(undefined)
        })
    })

    describe('when revamp is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('returns true when user has AI agent access', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true when user does not have AI agent access', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true when store integration is undefined', () => {
            useAiAgentAccessMock.mockReturnValue({
                hasAccess: false,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(undefined),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })
    })
})
