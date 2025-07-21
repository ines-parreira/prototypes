import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'

import { useStoreIntegration } from '../useStoreIntegration'

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const useAppSelectorMock = useAppSelector as jest.Mock

describe('useStoreIntegration', () => {
    const mockIntegration = fromJS({
        meta: {
            shop_integration_id: '1',
        },
    })

    const mockStoreIntegrations = [
        {
            id: '1',
            name: 'gorgias-store',
            type: IntegrationType.Shopify,
        },
    ]

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(mockStoreIntegrations)
    })

    it('returns store integration and connection statuses when integration is found', () => {
        // When
        const result = useStoreIntegration(mockIntegration)

        // Then
        expect(result).toEqual({
            storeIntegration: {
                id: '1',
                name: 'gorgias-store',
                type: IntegrationType.Shopify,
            },
            isConnected: true,
            isConnectedToShopify: true,
        })
    })

    it('returns correct result if integration is not found', () => {
        // Given
        useAppSelectorMock.mockReturnValue([])

        // When
        const result = useStoreIntegration(mockIntegration)

        // Then
        expect(result).toEqual({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })
    })

    it('handles cases where integration has no shop_integration_id', () => {
        // Given
        const notConnectedIntegration = fromJS({
            meta: {},
        })

        // When
        const result = useStoreIntegration(notConnectedIntegration)

        // THen
        expect(result).toEqual({
            storeIntegration: undefined,
            isConnected: false,
            isConnectedToShopify: false,
        })
    })

    it('returns false for isConnectedToShopify when integration is not Shopify', () => {
        // Given
        useAppSelectorMock.mockReturnValue([
            {
                id: '1',
                name: 'gorgias-store',
                type: IntegrationType.BigCommerce,
            },
        ])

        // When
        const result = useStoreIntegration(mockIntegration)

        // When
        expect(result).toEqual({
            storeIntegration: {
                id: '1',
                name: 'gorgias-store',
                type: IntegrationType.BigCommerce,
            },
            isConnected: true,
            isConnectedToShopify: false,
        })
    })
})
