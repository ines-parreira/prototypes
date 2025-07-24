import { fireEvent, render } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentProductRecommendationsExclude } from '../AiAgentProductRecommendationsExclude'
import { ProductSelectionDrawer } from '../components/ProductSelectionDrawer'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'test-shop' }),
}))

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: jest.fn(({ shopName, title, children }) => (
        <div>
            <div>
                Layout Mock - Shop: {shopName}, Title: {title}
            </div>
            {children}
        </div>
    )),
}))

jest.mock('../components/ProductSelectionDrawer', () => ({
    ProductSelectionDrawer: jest.fn(),
}))
const mockProductSelectionDrawer = ProductSelectionDrawer as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock

jest.mock('models/knowledgeService/queries')
const mockUseGetRulesProductRecommendation =
    useGetRulesProductRecommendation as jest.Mock

jest.mock('models/integration/queries')
const mockUseGetProductsByIdsFromIntegration =
    useGetProductsByIdsFromIntegration as jest.Mock

jest.mock('models/knowledgeService/mutations')
const mockUseUpsertRulesProductRecommendation =
    useUpsertRulesProductRecommendation as jest.Mock

const mockUpsertRulesProductRecommendation = jest.fn()

const renderComponent = (
    options: {
        isLoadingProducts?: boolean
        isLoadingRules?: boolean
        isUpserting?: boolean
        rules?: {
            excluded: {
                type: 'product'
                items: {
                    target: string
                }[]
            }[]
        }
        products?: {
            id: number
            title: string
            image?: {
                src: string
            }
        }[]
    } = {},
) => {
    const {
        isLoadingProducts = false,
        isLoadingRules = false,
        isUpserting = false,
        rules = {
            excluded: [
                {
                    type: 'product',
                    items: [
                        { target: '123' },
                        { target: '456' },
                        { target: '789' },
                    ],
                },
            ],
        },
        products = [
            { id: 123, title: 'Product 1', image: { src: 'image-1-url' } },
            { id: 456, title: 'Product 2' },
            { id: 789, title: 'Product 3' },
        ],
    } = options

    mockUseAppSelector.mockReturnValue(new Map([['domain', 'my-domain']]))

    mockUseShopifyIntegrationAndScope.mockReturnValue({
        integrationId: 123,
    })

    mockUseGetRulesProductRecommendation.mockReturnValue({
        data: rules,
        isLoading: isLoadingRules,
        isFetching: false,
    })

    mockUseGetProductsByIdsFromIntegration.mockReturnValue({
        data: products,
        isLoading: isLoadingProducts,
        isFetching: false,
    })

    mockUseUpsertRulesProductRecommendation.mockReturnValue({
        mutateAsync: mockUpsertRulesProductRecommendation,
        isLoading: isUpserting,
    })

    return render(<AiAgentProductRecommendationsExclude />)
}

describe('AiAgentProductRecommendationsExclude', () => {
    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(mockUseShopifyIntegrationAndScope).toHaveBeenCalledWith(
            'test-shop',
        )
        expect(screen.queryByText('3 products')).toBeInTheDocument()
        expect(screen.queryByText('Product 1')).toBeInTheDocument()
        expect(screen.queryByText('Product 2')).toBeInTheDocument()
        expect(screen.queryByText('Product 3')).toBeInTheDocument()
        expect(
            screen.queryByText(
                'Layout Mock - Shop: test-shop, Title: Product Recommendations',
            ),
        ).toBeInTheDocument()

        const skeletons = screen.container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )

        expect(skeletons.length).toBe(0)
    })

    it('should call the product selection drawer', () => {
        const screen = renderComponent()

        expect(mockProductSelectionDrawer).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: false,
                selectedProductIds: [123, 456, 789],
                shopName: 'test-shop',
            }),
            {},
        )

        const button = screen.getByText('Add Products')
        fireEvent.click(button)

        expect(mockProductSelectionDrawer).toHaveBeenCalledTimes(2)

        expect(mockProductSelectionDrawer).toHaveBeenLastCalledWith(
            expect.objectContaining({
                isOpen: true,
                selectedProductIds: [123, 456, 789],
                shopName: 'test-shop',
            }),
            {},
        )
    })

    it('should not call the product selection drawer when upserting', () => {
        const screen = renderComponent({ isUpserting: true })
        const button = screen.getByText('Add Products')
        fireEvent.click(button)

        expect(mockProductSelectionDrawer).toHaveBeenCalledTimes(1)
    })

    it('should render the component correctly when loading 1', () => {
        const screen = renderComponent({
            isLoadingRules: true,
        })

        const skeletons = screen.container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )

        expect(skeletons.length).toBe(2)
    })

    it('should render the component correctly when loading 2', () => {
        const screen = renderComponent({
            isLoadingProducts: true,
        })

        const skeletons = screen.container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )

        expect(skeletons.length).toBe(2)
    })

    it('should handle delete product correctly', () => {
        const screen = renderComponent()
        const button = screen.getAllByLabelText('Delete product recommendation')
        fireEvent.click(button[1])

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [{ target: '123' }, { target: '789' }],
                    },
                ],
            },
        })

        fireEvent.click(button[0])
        fireEvent.click(button[2])
        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledTimes(1)
    })
})
