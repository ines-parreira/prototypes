import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import type {
    ShopifyIntegration,
    ShopifyIntegrationMeta,
} from 'models/integration/types'
import type { RootState } from 'state/types'

import { useShopContext } from './useShopContext'

jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')

const mockExtractShopNameFromUrl = jest.requireMock(
    'pages/aiAgent/utils/extractShopNameFromUrl',
).extractShopNameFromUrl as jest.Mock

describe('useShopContext', () => {
    const mockShopifyIntegrations = [
        {
            type: IntegrationType.Shopify,
            meta: {
                shop_name: 'store-alpha',
                shop_domain: 'store-alpha.myshopify.com',
            } as Omit<ShopifyIntegrationMeta, 'oauth'>,
        } as ShopifyIntegration,
        {
            type: IntegrationType.Shopify,
            meta: {
                shop_name: 'store-beta',
                shop_domain: 'store-beta.myshopify.com',
            } as Omit<ShopifyIntegrationMeta, 'oauth'>,
        } as ShopifyIntegration,
    ]

    const createMockState = (integrations = mockShopifyIntegrations) => {
        return {
            integrations: fromJS({
                integrations,
            }),
        } as RootState
    }

    const originalLocation = window.location

    beforeEach(() => {
        jest.clearAllMocks()
        delete (window as any).location
        ;(window as unknown as { location: Location }).location = {
            href: 'http://localhost/app',
        } as Location
        mockExtractShopNameFromUrl.mockReturnValue(undefined)
    })

    afterEach(() => {
        ;(window as unknown as { location: Location }).location =
            originalLocation
    })

    it('returns shop name from first integration when URL extraction returns undefined', () => {
        const mockStore = configureMockStore([thunk])(
            createMockState(mockShopifyIntegrations),
        )

        const { result } = renderHook(() => useShopContext(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.shopName).toBe('store-alpha')
        expect(result.current.storeUrl).toBe(
            'https://store-alpha.myshopify.com',
        )
    })

    it('returns shop name from URL when available', () => {
        mockExtractShopNameFromUrl.mockReturnValue('store-beta')
        const mockStore = configureMockStore([thunk])(
            createMockState(mockShopifyIntegrations),
        )

        const { result } = renderHook(() => useShopContext(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.shopName).toBe('store-beta')
        expect(result.current.storeUrl).toBe('https://store-beta.myshopify.com')
    })

    it('returns undefined shop name when no integrations exist', () => {
        const mockStore = configureMockStore([thunk])(createMockState([]))

        const { result } = renderHook(() => useShopContext(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.shopName).toBeUndefined()
        expect(result.current.storeUrl).toBeNull()
    })

    it('prefers URL shop name over first integration', () => {
        mockExtractShopNameFromUrl.mockReturnValue('url-shop')
        const mockShopifyIntegrationsWithUrlShop = [
            ...mockShopifyIntegrations,
            {
                type: IntegrationType.Shopify,
                meta: {
                    shop_name: 'url-shop',
                    shop_domain: 'url-shop.myshopify.com',
                } as Omit<ShopifyIntegrationMeta, 'oauth'>,
            } as ShopifyIntegration,
        ]
        const mockStore = configureMockStore([thunk])(
            createMockState(mockShopifyIntegrationsWithUrlShop),
        )

        const { result } = renderHook(() => useShopContext(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(result.current.shopName).toBe('url-shop')
        expect(result.current.storeUrl).toBe('https://url-shop.myshopify.com')
    })

    it('calls extractShopNameFromUrl with current window location', () => {
        const mockStore = configureMockStore([thunk])(
            createMockState(mockShopifyIntegrations),
        )

        renderHook(() => useShopContext(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore}>{children}</Provider>
            ),
        })

        expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
            'http://localhost/app',
        )
    })
})
