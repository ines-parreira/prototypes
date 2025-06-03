import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useListBundles } from 'models/convert/bundle/queries'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'
import { renderHook } from 'utils/testing/renderHook'

import { useTrackingBundleInstallationWarningCheck } from '../useTrackingBundleInstallationWarningCheck'

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))
const mockUseFlags = jest.mocked(useFlags)

jest.mock('models/convert/bundle/queries', () => ({
    useListBundles: jest.fn(),
}))
const mockUseListBundles = jest.mocked(useListBundles)

jest.mock('pages/automate/common/hooks/useShopifyIntegrations')
const mockUseShopifyIntegrations = jest.mocked(useShopifyIntegrations)

const STORE_1 = 'store-1'
const STORE_2 = 'store-2'

const STORE_1_INTEGRATION_ID = 123
const STORE_2_INTEGRATION_ID = 456

const STORE_1_CHAT_INTEGRATION_ID = 111
const STORE_2_CHAT_INTEGRATION_ID = 999
const STORE_2_CHAT_INTEGRATION_ID_2 = 666

const STORE_ACTIVATIONS = {
    [STORE_1]: {
        configuration: { storeName: STORE_1 },
        sales: { enabled: true },
        support: {
            chat: {
                enabled: true,
                availableChats: [STORE_1_CHAT_INTEGRATION_ID],
            },
        },
    },
    [STORE_2]: {
        configuration: { storeName: STORE_2 },
        sales: { enabled: true },
        support: {
            chat: {
                enabled: true,
                availableChats: [
                    STORE_2_CHAT_INTEGRATION_ID,
                    STORE_2_CHAT_INTEGRATION_ID_2,
                ],
            },
        },
    },
} as any

describe('useTrackingBundleInstallationWarningCheck', () => {
    beforeEach(() => {
        mockUseFlags.mockReturnValue({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
        })

        mockUseShopifyIntegrations.mockReturnValue([
            { meta: { shop_name: STORE_1 }, id: STORE_1_INTEGRATION_ID },
            { meta: { shop_name: STORE_2 }, id: STORE_2_INTEGRATION_ID },
        ] as any)

        mockUseListBundles.mockReturnValue({
            data: [{ shop_integration_id: STORE_1_INTEGRATION_ID }],
        } as any)
    })

    it('should return undefined when no store activations are provided', () => {
        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeActivations: {},
            }),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return disable query when ai shopping assistant is not enabled', () => {
        mockUseFlags.mockReturnValueOnce({
            [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
        })

        renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeActivations: STORE_ACTIVATIONS,
            }),
        )

        expect(mockUseListBundles).toHaveBeenCalledWith({ enabled: false })
    })

    it('should return first chat of first store when no active installations are returned', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeActivations: STORE_ACTIVATIONS,
            }),
        )

        expect(result.current.uninstalledChatIntegrationId).toEqual(
            STORE_1_CHAT_INTEGRATION_ID,
        )
    })

    it('should return undefined when store integration is installed', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                { shop_integration_id: STORE_1_INTEGRATION_ID },
                { shop_integration_id: STORE_2_INTEGRATION_ID },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeActivations: STORE_ACTIVATIONS,
            }),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return undefined when all chat integrations are installed', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                { shop_integration_id: STORE_1_CHAT_INTEGRATION_ID },
                { shop_integration_id: STORE_2_CHAT_INTEGRATION_ID },
                { shop_integration_id: STORE_2_CHAT_INTEGRATION_ID_2 },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeActivations: STORE_ACTIVATIONS,
            }),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return the first uninstalled chat integration', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                { shop_integration_id: STORE_1_INTEGRATION_ID },
                { shop_integration_id: STORE_2_CHAT_INTEGRATION_ID },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeActivations: STORE_ACTIVATIONS,
            }),
        )

        expect(result.current.uninstalledChatIntegrationId).toEqual(
            STORE_2_CHAT_INTEGRATION_ID_2,
        )
    })
})
