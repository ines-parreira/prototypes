import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import type { StoreIntegration } from 'models/integration/types'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'

import useShouldShowChatSettingsRevamp from '../useShouldShowChatSettingsRevamp'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('hooks/useAppSelector')

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')

const useFlagMock = useFlag as jest.Mock
const useAppSelectorMock = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const useStoreConfigurationMock = useStoreConfiguration as jest.MockedFunction<
    typeof useStoreConfiguration
>

describe('useShouldShowChatSettingsRevamp', () => {
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
        useAppSelectorMock.mockReturnValue({
            get: (key: string) => {
                if (key === 'domain') return 'test-account.gorgias.com'
                return null
            },
        })
        useStoreConfigurationMock.mockReturnValue({
            isLoading: false,
            storeConfiguration: undefined,
            error: undefined,
            isFetched: true,
        })
    })

    describe('when revamp is enabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(true)
        })

        it('returns false for shouldShowPreviewForRevamp when AI agent is enabled with Shopify integration', () => {
            const chatId = 123
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-shop',
                    monitoredChatIntegrations: [chatId],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration, chatId),
            )

            expect(result.current.shouldShowRevamp).toBe(true)
            expect(result.current.shouldShowRevampWhenAiAgentEnabled).toBe(true)
            expect(result.current.shouldShowPreviewForRevamp).toBe(false)
            expect(useFlag).toHaveBeenCalledWith(
                FeatureFlagKey.ChatSettingsRevamp,
            )
        })

        it('returns true for shouldShowPreviewForRevamp when AI agent is not enabled with Shopify integration', () => {
            const chatId = 123
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-shop',
                    monitoredChatIntegrations: [],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration, chatId),
            )

            expect(result.current.shouldShowRevamp).toBe(true)
            expect(result.current.shouldShowRevampWhenAiAgentEnabled).toBe(
                false,
            )
            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns false for shouldShowPreviewForRevamp when AI agent is enabled with BigCommerce integration', () => {
            const chatId = 456
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-store-hash',
                    monitoredChatIntegrations: [chatId],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(
                    mockBigCommerceIntegration,
                    chatId,
                ),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(false)
        })

        it('returns true for shouldShowPreviewForRevamp when AI agent is not enabled with BigCommerce integration', () => {
            const chatId = 456
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-store-hash',
                    monitoredChatIntegrations: [],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(
                    mockBigCommerceIntegration,
                    chatId,
                ),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns false for shouldShowPreviewForRevamp when AI agent is enabled with Magento2 integration', () => {
            const chatId = 789
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'https://test-store.com',
                    monitoredChatIntegrations: [chatId],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(
                    mockMagento2Integration,
                    chatId,
                ),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(false)
        })

        it('returns true for shouldShowPreviewForRevamp when AI agent is not enabled with Magento2 integration', () => {
            const chatId = 789
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'https://test-store.com',
                    monitoredChatIntegrations: [],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(
                    mockMagento2Integration,
                    chatId,
                ),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true for shouldShowPreviewForRevamp when chat is deactivated', () => {
            const chatId = 123
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-shop',
                    monitoredChatIntegrations: [chatId],
                    chatChannelDeactivatedDatetime: '2024-01-01T00:00:00Z',
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration, chatId),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true for shouldShowPreviewForRevamp when store integration is undefined', () => {
            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(undefined),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true for shouldShowPreviewForRevamp when chatId is undefined', () => {
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-shop',
                    monitoredChatIntegrations: [123],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration),
            )

            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })
    })

    describe('when revamp is disabled', () => {
        beforeEach(() => {
            useFlagMock.mockReturnValue(false)
        })

        it('returns true for shouldShowPreviewForRevamp when AI agent is enabled', () => {
            const chatId = 123
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-shop',
                    monitoredChatIntegrations: [chatId],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration, chatId),
            )

            expect(result.current.shouldShowRevamp).toBe(false)
            expect(result.current.shouldShowRevampWhenAiAgentEnabled).toBe(
                false,
            )
            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true for shouldShowPreviewForRevamp when AI agent is not enabled', () => {
            const chatId = 123
            useStoreConfigurationMock.mockReturnValue({
                isLoading: false,
                storeConfiguration: {
                    storeName: 'test-shop',
                    monitoredChatIntegrations: [],
                    chatChannelDeactivatedDatetime: null,
                } as any,
                error: undefined,
                isFetched: true,
            })

            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(mockShopifyIntegration, chatId),
            )

            expect(result.current.shouldShowRevamp).toBe(false)
            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })

        it('returns true for shouldShowPreviewForRevamp when store integration is undefined', () => {
            const { result } = renderHook(() =>
                useShouldShowChatSettingsRevamp(undefined),
            )

            expect(result.current.shouldShowRevamp).toBe(false)
            expect(result.current.shouldShowPreviewForRevamp).toBe(true)
        })
    })
})
