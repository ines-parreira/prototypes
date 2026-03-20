import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/types'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import useShopifyCheckoutChatInstallation from '../useShopifyCheckoutChatInstallation'

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

describe('useShopifyCheckoutChatInstallation', () => {
    const mockIntegration = fromJS({})

    const mockStoreIntegration = {
        id: '1',
        name: 'gorgias-store',
        type: IntegrationType.Shopify,
    }

    beforeEach(() => {
        useInstallationStatusMock.mockReturnValue({
            installedOnShopifyCheckout: false,
        })
        useStoreIntegrationMock.mockReturnValue({
            storeIntegration: mockStoreIntegration,
            isConnectedToShopify: true,
        })
    })

    it('returns correct data when Shopify integration exists and chat is installed', () => {
        // Given
        useInstallationStatusMock.mockReturnValue({
            installedOnShopifyCheckout: true,
        })

        // When
        const result = useShopifyCheckoutChatInstallation(mockIntegration)

        // Then
        expect(result).toEqual({
            installedOnShopifyCheckout: true,
            shopifyCheckoutChatInstallationUrl:
                'https://admin.shopify.com/store/gorgias-store/settings/checkout/editor',
        })
    })

    it('returns correct data when Shopify integration exists and chat is not installed', () => {
        // When
        const result = useShopifyCheckoutChatInstallation(mockIntegration)

        // Then
        expect(result).toEqual({
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl:
                'https://admin.shopify.com/store/gorgias-store/settings/checkout/editor',
        })
    })

    it('returns correct data when store integration does not exist', () => {
        // Given
        useStoreIntegrationMock.mockReturnValue({
            storeIntegration: undefined,
            isConnectedToShopify: false,
        })

        // When
        const result = useShopifyCheckoutChatInstallation(mockIntegration)

        // Then
        expect(result).toEqual({
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl: null,
        })
    })

    it('returns correct data when store integration exist but it is not Shopify integration', () => {
        // Given
        useStoreIntegrationMock.mockReturnValue({
            storeIntegration: mockIntegration,
            isConnectedToShopify: false,
        })

        // When
        const result = useShopifyCheckoutChatInstallation(mockIntegration)

        // Then
        expect(result).toEqual({
            installedOnShopifyCheckout: false,
            shopifyCheckoutChatInstallationUrl: null,
        })
    })
})
