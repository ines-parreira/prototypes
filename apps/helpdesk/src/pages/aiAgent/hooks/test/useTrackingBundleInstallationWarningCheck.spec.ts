import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useListBundles } from 'models/convert/bundle/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')
const mockUseCanUseAiSalesAgent = jest.mocked(useCanUseAiSalesAgent)
const mockUseAtLeastOneStoreHasActiveTrial = jest.mocked(
    useAtLeastOneStoreHasActiveTrial,
)

jest.mock('models/convert/bundle/queries', () => ({
    useListBundles: jest.fn(),
}))
const mockUseListBundles = jest.mocked(useListBundles)

jest.mock('pages/automate/common/hooks/useShopifyIntegrations')
const mockUseShopifyIntegrations = jest.mocked(useShopifyIntegrations)

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const mockUseStoreActivations = jest.mocked(useStoreActivations)

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
        mockUseFlag.mockImplementation(
            (key) =>
                key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                key ===
                    FeatureFlagKey.AiShoppingAssistantTrackingBundleWarningBanner ||
                false,
        )

        mockUseShopifyIntegrations.mockReturnValue([
            { meta: { shop_name: STORE_1 }, id: STORE_1_INTEGRATION_ID },
            { meta: { shop_name: STORE_2 }, id: STORE_2_INTEGRATION_ID },
        ] as any)

        mockUseListBundles.mockReturnValue({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        mockUseStoreActivations.mockReturnValue({
            storeActivations: STORE_ACTIVATIONS,
            allStoreActivations: {},
            isFetchLoading: false,
        } as any)

        mockUseCanUseAiSalesAgent.mockReturnValue(true)
        mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(false)
    })

    it('should return undefined when no store activations are provided', () => {
        mockUseStoreActivations.mockReturnValueOnce({
            storeActivations: {},
            allStoreActivations: {},
            isFetchLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should disable queries when ai shopping assistant is not enabled', () => {
        mockUseFlag.mockReturnValueOnce(false)
        renderHook(() => useTrackingBundleInstallationWarningCheck({}))

        expect(mockUseListBundles).toHaveBeenCalledWith({ enabled: false })
        expect(mockUseStoreActivations).toHaveBeenCalledWith({
            storeName: undefined,
            enabled: false,
            withChatIntegrationsStatus: false,
            withStoresKnowledgeStatus: false,
        })
    })

    it('should disable queries when user cannot use ai sales agent', () => {
        mockUseCanUseAiSalesAgent.mockReturnValueOnce(false)

        renderHook(() => useTrackingBundleInstallationWarningCheck({}))

        expect(mockUseListBundles).toHaveBeenCalledWith({ enabled: false })
        expect(mockUseStoreActivations).toHaveBeenCalledWith({
            storeName: undefined,
            enabled: false,
            withChatIntegrationsStatus: false,
            withStoresKnowledgeStatus: false,
        })
    })

    it('should enabled queries when one store has an active trial', () => {
        mockUseCanUseAiSalesAgent.mockReturnValueOnce(false)
        mockUseAtLeastOneStoreHasActiveTrial.mockReturnValue(true)

        renderHook(() => useTrackingBundleInstallationWarningCheck({}))

        expect(mockUseListBundles).toHaveBeenCalledWith({ enabled: true })
        expect(mockUseStoreActivations).toHaveBeenCalledWith({
            storeName: undefined,
            enabled: true,
            withChatIntegrationsStatus: true,
            withStoresKnowledgeStatus: true,
        })
    })

    it('should call store activation with storeName', () => {
        renderHook(() =>
            useTrackingBundleInstallationWarningCheck({
                storeName: STORE_1,
            }),
        )

        expect(mockUseStoreActivations).toHaveBeenCalledWith({
            storeName: STORE_1,
            enabled: true,
            withChatIntegrationsStatus: true,
            withStoresKnowledgeStatus: true,
        })
    })

    it('should return first chat of first store when no active installations are returned', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toEqual(
            STORE_1_CHAT_INTEGRATION_ID,
        )
    })

    it('should return undefined when data is returned (by cache) but query is disabled', () => {
        mockUseCanUseAiSalesAgent.mockReturnValue(false)
        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return undefined when store integration is installed and seen within last 72 hours', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return undefined when all chat integrations are installed and seen within last 72 hours', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID_2,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return undefined with uninstalled chat integrations but tracking banner disabled', () => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
        )

        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toBeUndefined()
    })

    it('should return the first uninstalled chat integration', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toEqual(
            STORE_2_CHAT_INTEGRATION_ID_2,
        )
    })

    it('should return the first installed chat integration that was not seen in the last 72 hours on the store', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: moment()
                        .subtract(100, 'hours')
                        .toDate(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID_2,
                    last_loaded_datetime: new Date(),
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )

        expect(result.current.uninstalledChatIntegrationId).toEqual(
            STORE_2_CHAT_INTEGRATION_ID,
        )
    })

    it('should return the first installed chat integration that was never seen on the store', () => {
        mockUseListBundles.mockReturnValueOnce({
            data: [
                {
                    shop_integration_id: STORE_1_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID,
                    last_loaded_datetime: new Date(),
                },
                {
                    shop_integration_id: STORE_2_CHAT_INTEGRATION_ID_2,
                },
            ],
        } as any)

        const { result } = renderHook(() =>
            useTrackingBundleInstallationWarningCheck({}),
        )
        expect(result.current.uninstalledChatIntegrationId).toEqual(
            STORE_2_CHAT_INTEGRATION_ID_2,
        )
    })
})
