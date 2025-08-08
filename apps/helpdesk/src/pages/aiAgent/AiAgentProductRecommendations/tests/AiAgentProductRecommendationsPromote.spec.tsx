import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { GetProductRecommendationRules } from '@gorgias/knowledge-service-client'

import useAppSelector from 'hooks/useAppSelector'
import { useGetEcommerceLookupValues } from 'models/ecommerce/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentProductRecommendationsPromote } from '../AiAgentProductRecommendationsPromote'
import { allProducts, allTags, allVendors } from './data'

jest.mock('hooks/useAppDispatch', () => jest.fn(() => jest.fn()))

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
const mockUseGetEcommerceLookupValues = useGetEcommerceLookupValues as jest.Mock

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

const defaultProductRules = {
    type: 'product',
    items: [
        { target: '2' },
        { target: '7' },
        { target: '10' },
        { target: '12' },
    ],
}

const defaultTagRules = {
    type: 'tag',
    items: [
        { target: 'Gym Gear' },
        { target: 'Moisture-Wicking' },
        { target: 'Four-Way Stretch' },
        { target: 'Speed Training' },
    ],
}

const defaultVendorRules = {
    type: 'vendor',
    items: [
        { target: 'ASICS' },
        { target: 'New Balance' },
        { target: 'Spalding' },
        { target: 'The North Face' },
        { target: 'Salomon' },
    ],
}

const renderComponent = (
    options: {
        selectedProducts?: number[]
        selectedTags?: string[]
        selectedVendors?: string[]
        integrationId?: number | null
        isLoadingRules?: boolean
        isFetchingRules?: boolean
        isUpserting?: boolean
    } = {},
) => {
    const {
        selectedProducts = defaultProductRules.items.map((item) =>
            Number(item.target),
        ),
        selectedTags = defaultTagRules.items.map((item) => item.target),
        selectedVendors = defaultVendorRules.items.map((item) => item.target),
        integrationId = 123,
        isLoadingRules = false,
        isFetchingRules = false,
        isUpserting = false,
    } = options

    const rules: GetProductRecommendationRules = {
        excluded: [],
        promoted: [
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
                items: selectedTags.map((tag) => ({ target: tag })),
            },
            {
                type: 'vendor',
                items: selectedVendors.map((vendor) => ({ target: vendor })),
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

    mockUseGetEcommerceLookupValues.mockImplementation((type: string) => ({
        data: {
            data: type === 'product_tag' ? allTags : allVendors,
            metadata: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
        isLoading: false,
    }))

    return render(
        <MemoryRouter>
            <AiAgentProductRecommendationsPromote />
        </MemoryRouter>,
    )
}

describe('AiAgentProductRecommendationsPromote', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(screen.queryByText('Promote products')).toBeInTheDocument()
        expect(screen.queryByText('4 products')).toBeInTheDocument()

        expect(screen.queryAllByText('Men’s Compression Top')).toHaveLength(2)
        expect(screen.queryAllByText('Moisture-Wicking T-Shirt')).toHaveLength(
            2,
        )
        expect(screen.queryAllByText('Youth Track Pants')).toHaveLength(2)
        expect(screen.queryAllByText('CrossFit Shorts')).toHaveLength(2)

        expect(screen.queryByText('Promote tags')).toBeInTheDocument()
        expect(screen.queryByText('4 tags')).toBeInTheDocument()

        expect(screen.queryAllByText('Gym Gear')).toHaveLength(2)
        expect(screen.queryAllByText('Moisture-Wicking')).toHaveLength(2)
        expect(screen.queryAllByText('Four-Way Stretch')).toHaveLength(2)
        expect(screen.queryAllByText('Speed Training')).toHaveLength(2)

        expect(screen.queryByText('Promote vendors')).toBeInTheDocument()
        expect(screen.queryByText('5 vendors')).toBeInTheDocument()

        expect(screen.queryAllByText('ASICS')).toHaveLength(2)
        expect(screen.queryAllByText('New Balance')).toHaveLength(2)
        expect(screen.queryAllByText('Spalding')).toHaveLength(2)
        expect(screen.queryAllByText('The North Face')).toHaveLength(2)
        expect(screen.queryAllByText('Salomon')).toHaveLength(2)
    })

    it('should update products correctly', () => {
        const screen = renderComponent()

        const addButton = screen.getAllByText('Add products')[0]
        fireEvent.click(addButton)

        // Remove product
        const product1 = screen.getAllByText('Men’s Compression Top')[1]
        fireEvent.click(product1)

        // Add product
        const product2 = screen.getByText('Kids Active Tee')
        fireEvent.click(product2)

        // Add product
        const product3 = screen.getByText('Fitness Gloves')
        fireEvent.click(product3)

        const submitButton = screen.getAllByText('Done')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'product',
                        items: [
                            { target: '7' },
                            { target: '10' },
                            { target: '12' },
                            { target: '16' },
                            { target: '19' },
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
                recommendationAction: 'promoted',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'product',
                        items: [
                            { target: '2' },
                            { target: '7' },
                            { target: '12' },
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
        const tag1 = screen.getAllByText('Four-Way Stretch')[1]
        fireEvent.click(tag1)

        // Add tag
        const tag2 = screen.getByText('Track & Field')
        fireEvent.click(tag2)

        // Add tag
        const tag3 = screen.getByText('Lightweight Material')
        fireEvent.click(tag3)

        // Add tag
        const tag4 = screen.getByText('CrossFit Apparel')
        fireEvent.click(tag4)

        const submitButton = screen.getAllByText('Done')[1]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    {
                        type: 'tag',
                        items: [
                            { target: 'Gym Gear' },
                            { target: 'Moisture-Wicking' },
                            { target: 'Speed Training' },
                            { target: 'Track & Field' },
                            { target: 'Lightweight Material' },
                            { target: 'CrossFit Apparel' },
                        ],
                    },
                ],
            },
        })
    })

    it('should remove tags correctly', () => {
        const screen = renderComponent()

        const button = screen.getAllByRole('button', { name: 'Remove tag' })[2]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    {
                        type: 'tag',
                        items: [
                            { target: 'Gym Gear' },
                            { target: 'Moisture-Wicking' },
                            { target: 'Speed Training' },
                        ],
                    },
                ],
            },
        })
    })

    it('should update vendors correctly', () => {
        const screen = renderComponent()

        const addButton = screen.getAllByText('Add vendors')[0]
        fireEvent.click(addButton)

        // Remove vendor
        const vendor1 = screen.getAllByText('Salomon')[1]
        fireEvent.click(vendor1)

        // Remove vendor
        const vendor2 = screen.getAllByText('ASICS')[1]
        fireEvent.click(vendor2)

        // Add vendor
        const vendor3 = screen.getByText('Puma')
        fireEvent.click(vendor3)

        // Add vendor
        const vendor4 = screen.getByText('Franklin Sports')
        fireEvent.click(vendor4)

        // Add vendor
        const vendor5 = screen.getByText('ProForm')
        fireEvent.click(vendor5)

        const submitButton = screen.getAllByText('Done')[2]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    {
                        type: 'vendor',
                        items: [
                            { target: 'New Balance' },
                            { target: 'Spalding' },
                            { target: 'The North Face' },
                            { target: 'Puma' },
                            { target: 'Franklin Sports' },
                            { target: 'ProForm' },
                        ],
                    },
                ],
            },
        })
    })

    it('should remove vendors correctly', () => {
        const screen = renderComponent()

        const button = screen.getAllByRole('button', {
            name: 'Remove vendor',
        })[3]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    {
                        type: 'vendor',
                        items: [
                            { target: 'ASICS' },
                            { target: 'New Balance' },
                            { target: 'Spalding' },
                            { target: 'Salomon' },
                        ],
                    },
                ],
            },
        })
    })
})
