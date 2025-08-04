import { fireEvent, render } from '@testing-library/react'

import { GetProductRecommendationRules } from '@gorgias/knowledge-service-client'

import useAppSelector from 'hooks/useAppSelector'
import { useGetEcommerceProductTags } from 'models/ecommerce/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentProductRecommendationsExclude } from '../AiAgentProductRecommendationsExclude'

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

jest.mock('models/integration/queries')
const mockUseGetProductsByIdsFromIntegration =
    useGetProductsByIdsFromIntegration as jest.Mock

jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration',
)
const mockUsePaginatedProductIntegration =
    usePaginatedProductIntegration as jest.Mock

jest.mock('models/ecommerce/queries')
const mockUseGetEcommerceProductTags = useGetEcommerceProductTags as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock

jest.mock('models/knowledgeService/queries')
const mockUseGetRulesProductRecommendation =
    useGetRulesProductRecommendation as jest.Mock

jest.mock('models/knowledgeService/mutations')
const mockUseUpsertRulesProductRecommendation =
    useUpsertRulesProductRecommendation as jest.Mock

const mockUpsertRulesProductRecommendation = jest.fn()

const allProducts = [
    {
        id: 1,
        title: 'Performance Running Shorts',
        image: { src: 'running-shorts.jpg' },
    },
    { id: 2, title: 'Men’s Compression Top' },
    {
        id: 3,
        title: 'Seamless Yoga Leggings',
        image: { src: 'yoga-leggings.jpg' },
    },
    { id: 4, title: 'Lightweight Training Hoodie' },
    { id: 5, title: 'Women’s Sports Bra', image: { src: 'sports-bra.jpg' } },
    { id: 6, title: 'High-Waisted Gym Leggings' },
    {
        id: 7,
        title: 'Moisture-Wicking T-Shirt',
        image: { src: 'moisture-tee.jpg' },
    },
    { id: 8, title: 'Resistance Band Set' },
    {
        id: 9,
        title: 'Breathable Mesh Tank Top',
        image: { src: 'mesh-tank.jpg' },
    },
    { id: 10, title: 'Youth Track Pants' },
    {
        id: 11,
        title: 'Athletic Water Bottle',
        image: { src: 'water-bottle.jpg' },
    },
    { id: 12, title: 'CrossFit Shorts' },
    {
        id: 13,
        title: 'Outdoor Running Jacket',
        image: { src: 'running-jacket.jpg' },
    },
    { id: 14, title: 'Sweat-Wicking Socks' },
    { id: 15, title: 'Unisex Workout Cap', image: { src: 'workout-cap.jpg' } },
    { id: 16, title: 'Kids Active Tee' },
    {
        id: 17,
        title: 'Men’s Training Joggers',
        image: { src: 'training-joggers.jpg' },
    },
    { id: 18, title: '4-Way Stretch Shorts' },
    { id: 19, title: 'Fitness Gloves', image: { src: 'fitness-gloves.jpg' } },
    { id: 20, title: 'Slim Fit Gym Tee' },
]

const allTags = [
    'Running Gear',
    'Training Essentials',
    'CrossFit Apparel',
    'HIIT Wear',
    'Yoga Clothing',
    'Gym Gear',
    'Outdoor Fitness',
    'Track & Field',
    'Endurance Equipment',
    'Speed Training',
    'Compression Wear',
    'Relaxed Fit',
    'Slim Fit',
    'High-Waisted',
    'Moisture-Wicking',
    'Seamless Design',
    'Breathable Fabric',
    'Lightweight Material',
    'Four-Way Stretch',
    'Performance Mesh',
].map((tag) => ({
    id: '019838e2-e878-752a-8202-eb2f0c88c48c',
    account_id: 456,
    integration_id: 123,
    source_type: 'shopify',
    lookup_type: 'product_tag',
    created_datetime: '2025-07-23T20:04:11.512000+00:00',
    value: tag,
}))

const renderComponent = (
    options: {
        selectedProducts?: number[]
        selectedTags?: string[]
        integrationId?: number | null
        isLoadingRules?: boolean
        isFetchingRules?: boolean
        isUpserting?: boolean
    } = {},
) => {
    const {
        selectedProducts = [1, 6, 9, 11, 15],
        selectedTags = ['Yoga Clothing', 'Slim Fit', 'Performance Mesh'],
        integrationId = 123,
        isLoadingRules = false,
        isFetchingRules = false,
        isUpserting = false,
    } = options

    const rules: GetProductRecommendationRules = {
        promoted: [],
        excluded: [
            {
                type: 'product',
                items: allProducts.flatMap((product) =>
                    selectedProducts.includes(product.id)
                        ? [{ target: product.id.toString() }]
                        : [],
                ),
            },
            {
                type: 'tag',
                items: allTags.flatMap((tag) =>
                    selectedTags.includes(tag.value)
                        ? [{ target: tag.value }]
                        : [],
                ),
            },
        ],
    }

    mockUseAppSelector.mockReturnValue(new Map([['domain', 'my-domain']]))

    mockUseShopifyIntegrationAndScope.mockReturnValue({
        integrationId,
    })

    mockUseGetProductsByIdsFromIntegration.mockImplementation(
        (integrationId, productIds, isEnabled) => {
            return {
                data: isEnabled
                    ? allProducts.filter((product) =>
                          productIds.includes(product.id),
                      )
                    : [],
                isLoading: false,
                isFetching: false,
            }
        },
    )

    mockUseGetRulesProductRecommendation.mockReturnValue({
        data: rules,
        isLoading: isLoadingRules,
        isFetching: isFetchingRules,
    })

    mockUseUpsertRulesProductRecommendation.mockReturnValue({
        mutateAsync: mockUpsertRulesProductRecommendation,
        isLoading: isUpserting,
    })

    mockUsePaginatedProductIntegration.mockReturnValue({
        itemsData: allProducts,
        isLoading: false,
        setSearchTerm: jest.fn(),
        fetchNext: jest.fn(),
        fetchPrev: jest.fn(),
        hasNextPage: false,
        hasPrevPage: false,
    })

    mockUseGetEcommerceProductTags.mockReturnValue({
        data: {
            data: allTags,
            metadata: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
        isLoading: false,
    })

    return render(<AiAgentProductRecommendationsExclude />)
}

describe('AiAgentProductRecommendationsExclude', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(screen.queryByText('Exclude products')).toBeInTheDocument()
        expect(screen.queryByText('5 products')).toBeInTheDocument()

        expect(
            screen.queryAllByText('Performance Running Shorts'),
        ).toHaveLength(2)
        expect(screen.queryAllByText('High-Waisted Gym Leggings')).toHaveLength(
            2,
        )
        expect(screen.queryAllByText('Breathable Mesh Tank Top')).toHaveLength(
            2,
        )
        expect(screen.queryAllByText('Athletic Water Bottle')).toHaveLength(2)
        expect(screen.queryAllByText('Unisex Workout Cap')).toHaveLength(2)

        expect(screen.queryByText('Exclude tags')).toBeInTheDocument()
        expect(screen.queryByText('3 tags')).toBeInTheDocument()

        expect(screen.queryAllByText('Yoga Clothing')).toHaveLength(2)
        expect(screen.queryAllByText('Slim Fit')).toHaveLength(2)
        expect(screen.queryAllByText('Performance Mesh')).toHaveLength(2)
    })

    it('should update products correctly', () => {
        const screen = renderComponent()

        const addButton = screen.getAllByText('Add products')[0]
        fireEvent.click(addButton)

        // Remove product
        const product1 = screen.getAllByText('Performance Running Shorts')[1]
        fireEvent.click(product1)

        // Add product
        const product2 = screen.getByText('Youth Track Pants')
        fireEvent.click(product2)

        // Add product
        const product3 = screen.getByText('Slim Fit Gym Tee')
        fireEvent.click(product3)

        const submitButton = screen.getAllByText('Done')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [
                            { target: '6' },
                            { target: '9' },
                            { target: '11' },
                            { target: '15' },
                            { target: '10' },
                            { target: '20' },
                        ],
                    },
                    {
                        type: 'tag',
                        items: [
                            { target: 'Yoga Clothing' },
                            { target: 'Slim Fit' },
                            { target: 'Performance Mesh' },
                        ],
                    },
                ],
            },
        })
    })

    it('should remove products correctly', () => {
        const screen = renderComponent()

        const button = screen.getAllByRole('button', {
            name: 'Remove product',
        })[2]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [
                            { target: '1' },
                            { target: '6' },
                            { target: '11' },
                            { target: '15' },
                        ],
                    },
                    {
                        type: 'tag',
                        items: [
                            { target: 'Yoga Clothing' },
                            { target: 'Slim Fit' },
                            { target: 'Performance Mesh' },
                        ],
                    },
                ],
            },
        })
    })

    it('should update tags correctly', () => {
        const screen = renderComponent()

        const addButton = screen.getAllByText('Add tags')[0]
        fireEvent.click(addButton)

        // Remove tag
        const tag1 = screen.getAllByText('Slim Fit')[1]
        fireEvent.click(tag1)

        // Add tag
        const tag2 = screen.getByText('HIIT Wear')
        fireEvent.click(tag2)

        // Add tag
        const tag3 = screen.getByText('Compression Wear')
        fireEvent.click(tag3)

        // Add tag
        const tag4 = screen.getByText('Four-Way Stretch')
        fireEvent.click(tag4)

        const submitButton = screen.getAllByText('Done')[1]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [
                            { target: '1' },
                            { target: '6' },
                            { target: '9' },
                            { target: '11' },
                            { target: '15' },
                        ],
                    },
                    {
                        type: 'tag',
                        items: [
                            { target: 'Yoga Clothing' },
                            { target: 'Performance Mesh' },
                            { target: 'HIIT Wear' },
                            { target: 'Compression Wear' },
                            { target: 'Four-Way Stretch' },
                        ],
                    },
                ],
            },
        })
    })

    it('should remove tags correctly', () => {
        const screen = renderComponent()

        const button = screen.getAllByRole('button', { name: 'Remove tag' })[0]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [
                            { target: '1' },
                            { target: '6' },
                            { target: '9' },
                            { target: '11' },
                            { target: '15' },
                        ],
                    },
                    {
                        type: 'tag',
                        items: [
                            { target: 'Slim Fit' },
                            { target: 'Performance Mesh' },
                        ],
                    },
                ],
            },
        })
    })
})
