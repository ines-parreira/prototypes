import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { Tab } from 'pages/integrations/integration/types'

import {
    SHOPIFY_CHECKOUT_BANNER_TABS,
    useShouldShowShopifyCheckoutChatBanner,
} from '../useShouldShowShopifyCheckoutChatBanner'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus',
    () => ({
        useInstallationStatus: jest.fn(),
    }),
)

jest.mock('pages/integrations/integration/hooks/useStoreIntegration', () => ({
    useStoreIntegration: jest.fn(),
}))

const useInstallationStatusMock = useInstallationStatus as jest.Mock
const useStoreIntegrationMock = useStoreIntegration as jest.Mock

describe('useShouldShowShopifyCheckoutChatBanner', () => {
    const mockIntegration = fromJS({ type: IntegrationType.GorgiasChat })

    beforeEach(() => {
        useInstallationStatusMock.mockReturnValue({
            installedOnShopifyCheckout: false,
        })
        useStoreIntegrationMock.mockReturnValue({
            isConnected: false,
        })
    })

    it.each(SHOPIFY_CHECKOUT_BANNER_TABS)(
        'returns true if integration type is gorgias_chat, no store is connected to the integration and tab is %s',
        (tab) => {
            // When
            const result = useShouldShowShopifyCheckoutChatBanner(
                mockIntegration,
                tab,
            )

            // Then
            expect(result).toBe(true)
        },
    )

    it.each(SHOPIFY_CHECKOUT_BANNER_TABS)(
        'returns true if integration type is gorgias_chat, Shopify store is connected to the integration, chat is not installed on Checkout and tab is %s',
        (tab) => {
            // Given
            useStoreIntegrationMock.mockReturnValue({
                isConnected: true,
                isConnectedToShopify: true,
            })

            // When
            const result = useShouldShowShopifyCheckoutChatBanner(
                mockIntegration,
                tab,
            )

            // Then
            expect(result).toBe(true)
        },
    )

    it('returns false if integration type is not gorgias_chat', () => {
        // Given
        const nonChatIntegration = fromJS({ type: IntegrationType.Http })
        const tab = Tab.Appearance

        // When
        const result = useShouldShowShopifyCheckoutChatBanner(
            nonChatIntegration,
            tab,
        )

        // Then
        expect(result).toBe(false)
    })

    it('returns false if tab is not in SHOPIFY_CHECKOUT_BANNER_TABS', () => {
        // Given
        const tab = Tab.Installation

        // When
        const result = useShouldShowShopifyCheckoutChatBanner(
            mockIntegration,
            tab,
        )

        // Then
        expect(result).toBe(false)
    })

    it('returns false if both integration type is not gorgias_chat and tab is not in SHOPIFY_CHECKOUT_BANNER_TABS', () => {
        // Given
        const nonChatIntegration = fromJS({ type: IntegrationType.Http })
        const tab = Tab.Installation

        // When
        const result = useShouldShowShopifyCheckoutChatBanner(
            nonChatIntegration,
            tab,
        )

        // Then
        expect(result).toBe(false)
    })

    it('returns false if tab is not defined', () => {
        // When
        const result = useShouldShowShopifyCheckoutChatBanner(mockIntegration)

        // Then
        expect(result).toBe(false)
    })

    it('returns false if chat is already installed on checkout', () => {
        // Given
        useInstallationStatusMock.mockReturnValue({
            installedOnShopifyCheckout: true,
        })
        const tab = Tab.Appearance

        // When
        const result = useShouldShowShopifyCheckoutChatBanner(
            mockIntegration,
            tab,
        )

        // Then
        expect(result).toBe(false)
    })

    it('returns false if a non Shopify store is connected to the integration', () => {
        // Given
        useStoreIntegrationMock.mockReturnValue({
            isConnected: true,
            isConnectedToShopify: false,
        })
        const tab = Tab.Appearance

        // When
        const result = useShouldShowShopifyCheckoutChatBanner(
            mockIntegration,
            tab,
        )

        // Then
        expect(result).toBe(false)
    })
})
