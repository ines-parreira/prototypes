import { renderHook } from '@repo/testing'

import {
    MAGENTO2_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import type {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import { GorgiasChatInstallationMethod } from 'models/integration/types'
import * as useGetChatInstallationStatus from 'pages/convert/common/hooks/useGetChatInstallationStatus'
import * as useShopifyThemeAppExtension from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyThemeAppExtension'

import useIsManualInstallationMethodRequired from '../useIsManualInstallationMethodRequired'

const useGetChatInstallationStatusSpy = jest.spyOn(
    useGetChatInstallationStatus,
    'default',
)

const useShopifyThemeAppExtensionSpy = jest.spyOn(
    useShopifyThemeAppExtension,
    'default',
)

describe('useIsManualInstallationMethodRequired', () => {
    const chatIntegration = {
        type: 'gorgias_chat',
        id: '174',
    } as unknown as GorgiasChatIntegration
    const shopifyIntegration = {
        type: SHOPIFY_INTEGRATION_TYPE,
    } as ShopifyIntegration

    beforeEach(() => {
        useShopifyThemeAppExtensionSpy.mockReturnValue({
            isInstalled: false,
            isLoaded: false,
        })
    })

    it('should return true if storeIntegration is not connected to Shopify', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true,
            method: null,
        })

        const { result } = renderHook(() =>
            useIsManualInstallationMethodRequired(chatIntegration, {
                // @ts-ignore
                type: MAGENTO2_INTEGRATION_TYPE,
            }),
        )

        expect(result.current).toBe(true)
    })

    it('should return true if chat is not installed', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: false,
            method: GorgiasChatInstallationMethod.ScriptTag,
        })

        const { result } = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration,
            ),
        )

        expect(result.current).toBe(true)
    })

    it('should return true if chat installation method is null', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true,
            method: null,
        })

        const { result } = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration,
            ),
        )

        expect(result.current).toBe(true)
    })

    it('should return true if is connected to Shopify, chat is not installed and method is theme app', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true, // DB data can say it's installed, but we verify on Shopify side too later
            method: GorgiasChatInstallationMethod.ThemeAppExtension,
        })

        const { result } = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration,
            ),
        )

        expect(result.current).toBe(true)
    })

    it('should return false if is connected to Shopify, chat is installed and method is theme app', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true, // DB data can say it's installed, but we verify on Shopify side too later
            method: GorgiasChatInstallationMethod.ThemeAppExtension,
        })
        useShopifyThemeAppExtensionSpy.mockReturnValue({
            isInstalled: true,
            isLoaded: true,
        })

        const { result } = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration,
            ),
        )

        expect(result.current).toBe(false)
    })

    it('should return false if is connected to Shopify, chat is installed and method is not null', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true,
            method: GorgiasChatInstallationMethod.ScriptTag,
        })

        const { result } = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration,
            ),
        )

        expect(result.current).toBe(false)
    })
})
