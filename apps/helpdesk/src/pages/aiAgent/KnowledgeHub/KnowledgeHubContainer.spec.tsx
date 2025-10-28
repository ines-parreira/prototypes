import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'

import { KnowledgeHubContainer } from './KnowledgeHubContainer'
import { KnowledgeHubHeader } from './KnowledgeHubHeader/KnowledgeHubHeader'

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')
jest.mock('./KnowledgeHubHeader/KnowledgeHubHeader', () => ({
    KnowledgeHubHeader: jest.fn(({ type, shopName }) => (
        <div data-testid="knowledge-hub-header">
            <span>Type: {type}</span>
            <span>ShopName: {shopName}</span>
        </div>
    )),
}))

const mockUseAppSelector = useAppSelector as jest.Mock
const mockExtractShopNameFromUrl = extractShopNameFromUrl as jest.Mock
const mockKnowledgeHubHeader = KnowledgeHubHeader as jest.Mock

describe('KnowledgeHubContainer', () => {
    const mockShopifyIntegrations = [
        {
            id: 1,
            name: 'Store Alpha',
            type: 'shopify',
            meta: { shop_name: 'store-alpha' },
        },
        {
            id: 2,
            name: 'Store Beta',
            type: 'shopify',
            meta: { shop_name: 'store-beta' },
        },
    ]

    const originalLocation = window.location

    beforeEach(() => {
        jest.clearAllMocks()
        delete (window as any).location
        window.location = { href: 'http://localhost/app' } as Location
    })

    afterEach(() => {
        window.location = originalLocation
    })

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <KnowledgeHubContainer />
            </MemoryRouter>,
        )
    }

    it('should render the component with KnowledgeHubHeader', () => {
        mockUseAppSelector.mockReturnValue([])
        mockExtractShopNameFromUrl.mockReturnValue(undefined)

        renderComponent()

        expect(screen.getByTestId('knowledge-hub-header')).toBeInTheDocument()
    })

    it('should extract shop name from URL and pass it to KnowledgeHubHeader', () => {
        const routeShopName = 'my-shop-from-url'
        mockExtractShopNameFromUrl.mockReturnValue(routeShopName)
        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)

        renderComponent()

        expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
            window.location.href,
        )
        expect(mockKnowledgeHubHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                shopName: routeShopName,
            }),
            expect.anything(),
        )
    })

    it('should use first Shopify integration shop name when URL extraction returns undefined', () => {
        mockExtractShopNameFromUrl.mockReturnValue(undefined)
        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)

        renderComponent()

        expect(mockKnowledgeHubHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                shopName: 'store-alpha',
            }),
            expect.anything(),
        )
    })

    it('should pass undefined shopName when no URL extraction and no integrations', () => {
        mockExtractShopNameFromUrl.mockReturnValue(undefined)
        mockUseAppSelector.mockReturnValue([])

        renderComponent()

        expect(mockKnowledgeHubHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                data: null,
                shopName: undefined,
            }),
            expect.anything(),
        )
    })

    it('should prefer URL shop name over first integration when both exist', () => {
        const routeShopName = 'url-shop'
        mockExtractShopNameFromUrl.mockReturnValue(routeShopName)
        mockUseAppSelector.mockReturnValue(mockShopifyIntegrations)

        renderComponent()

        expect(mockKnowledgeHubHeader).toHaveBeenCalledWith(
            expect.objectContaining({
                shopName: routeShopName,
            }),
            expect.anything(),
        )
    })

    it('should call getShopifyIntegrationsSortedByName selector', () => {
        mockExtractShopNameFromUrl.mockReturnValue('test-shop')
        mockUseAppSelector.mockReturnValue([])

        renderComponent()

        expect(mockUseAppSelector).toHaveBeenCalled()
    })
})
