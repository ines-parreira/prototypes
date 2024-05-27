import {renderHook} from '@testing-library/react-hooks'
import * as useGetChatInstallationStatus from 'pages/convert/common/hooks/useGetChatInstallationStatus'
import {
    MAGENTO2_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import {
    GorgiasChatInstallationMethod,
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import useIsManualInstallationMethodRequired from '../useIsManualInstallationMethodRequired'

const useGetChatInstallationStatusSpy = jest.spyOn(
    useGetChatInstallationStatus,
    'default'
)

describe('useIsManualInstallationMethodRequired', () => {
    const chatIntegration = {
        type: 'gorgias_chat',
        id: '174',
    } as unknown as GorgiasChatIntegration
    const shopifyIntegration = {
        type: SHOPIFY_INTEGRATION_TYPE,
    } as ShopifyIntegration

    it('should return true if storeIntegration is not connected to Shopify', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true,
            method: null,
        })

        const {result} = renderHook(() =>
            useIsManualInstallationMethodRequired(chatIntegration, {
                // @ts-ignore
                type: MAGENTO2_INTEGRATION_TYPE,
            })
        )

        expect(result.current).toBe(true)
    })

    it('should return true if chat is not installed', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: false,
            method: GorgiasChatInstallationMethod.ScriptTag,
        })

        const {result} = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration
            )
        )

        expect(result.current).toBe(true)
    })

    it('should return true if chat installation method is null', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true,
            method: null,
        })

        const {result} = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration
            )
        )

        expect(result.current).toBe(true)
    })

    it('should return false if is connected to Shopify, chat is installed and method is not null', () => {
        useGetChatInstallationStatusSpy.mockReturnValue({
            installed: true,
            method: GorgiasChatInstallationMethod.ScriptTag,
        })

        const {result} = renderHook(() =>
            useIsManualInstallationMethodRequired(
                chatIntegration,
                shopifyIntegration
            )
        )

        expect(result.current).toBe(false)
    })
})
