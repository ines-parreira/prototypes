import {
    fireEvent,
    isInaccessible,
    render,
    RenderResult,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { GetProductRecommendationRules } from '@gorgias/knowledge-service-client'

import useAppSelector from 'hooks/useAppSelector'
import {
    useGetEcommerceLookupValues,
    useGetEcommerceProductCollections,
    useGetEcommerceProducts,
} from 'models/ecommerce/queries'
import { useUpsertRulesProductRecommendation } from 'models/knowledgeService/mutations'
import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import usePaginatedProductIntegration from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentProductRecommendationsPromote } from '../AiAgentProductRecommendationsPromote'
import usePaginatedProductCollectionsByIds from '../hooks/usePaginatedProductCollectionsByIds'
import usePaginatedProductsByIds from '../hooks/usePaginatedProductsByIds'
import { allCollections, allProducts, allTags, allVendors } from './data'

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

jest.mock('../hooks/usePaginatedProductsByIds')
const mockUsePaginatedProductsByIds = usePaginatedProductsByIds as jest.Mock

jest.mock('../hooks/usePaginatedProductCollectionsByIds')
const mockUsePaginatedProductCollectionsByIds =
    usePaginatedProductCollectionsByIds as jest.Mock

jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/usePaginatedProductIntegration',
)
const mockUsePaginatedProductIntegration =
    usePaginatedProductIntegration as jest.Mock

jest.mock('models/ecommerce/queries')
const mockUseGetEcommerceLookupValues = useGetEcommerceLookupValues as jest.Mock
const mockUseGetEcommerceProducts = useGetEcommerceProducts as jest.Mock
const mockUseGetEcommerceProductCollections =
    useGetEcommerceProductCollections as jest.Mock

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

const defaultCollectionRules = {
    type: 'collection',
    items: [{ target: '9' }, { target: '16' }, { target: '21' }],
}

const renderComponent = (
    options: {
        selectedProducts?: number[]
        selectedTags?: string[]
        selectedVendors?: string[]
        selectedCollections?: number[]
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
        selectedCollections = defaultCollectionRules.items.map((item) =>
            Number(item.target),
        ),
        integrationId = 123,
        isLoadingRules = false,
        isFetchingRules = false,
        isUpserting = false,
    } = options

    const rules: GetProductRecommendationRules = {
        excluded: [
            {
                type: 'product',
                items: [
                    { target: '8' },
                    { target: '17' },
                    { target: '22' },
                    { target: '23' },
                ],
            },
        ],
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
            {
                type: 'collection',
                items: allCollections.flatMap((collection) =>
                    selectedCollections.includes(collection.id)
                        ? [{ target: collection.id.toString() }]
                        : [],
                ),
            },
        ],
    }

    mockUseAppSelector.mockReturnValue(new Map([['domain', 'my-domain']]))

    mockUseShopifyIntegrationAndScope.mockReturnValue({
        integrationId,
    })

    mockUsePaginatedProductsByIds.mockImplementation(
        ({ productIds, pageSize, enabled, fetchAll }) => {
            const filteredProducts = enabled
                ? allProducts.filter((product) =>
                      productIds.includes(product.id.toString()),
                  )
                : []

            // For initial display (first call), return only first 5 products
            // For "See All" drawer with fetchAll, return paginated products
            const productsToReturn =
                pageSize && filteredProducts.length > pageSize && !fetchAll
                    ? filteredProducts.slice(0, pageSize)
                    : fetchAll
                      ? filteredProducts.slice(0, pageSize || 25)
                      : filteredProducts

            return {
                allProducts: productsToReturn,
                products: productsToReturn,
                isLoading: false,
                isError: false,
                currentPage: 1,
                totalPages: Math.ceil(
                    filteredProducts.length / (pageSize || 25),
                ),
                fetchPage: jest.fn(),
                hasNextPage: filteredProducts.length > (pageSize || 25),
                hasPrevPage: false,
                searchTerm: '',
                setSearchTerm: jest.fn(),
            }
        },
    )

    mockUsePaginatedProductCollectionsByIds.mockImplementation(
        ({ collectionIds, enabled }) => {
            const filteredCollections = enabled
                ? allCollections.flatMap((collection) => {
                      if (!collectionIds.includes(collection.id.toString()))
                          return []
                      return [
                          {
                              id: collection.id.toString(),
                              title: collection.title,
                          },
                      ]
                  })
                : []

            return {
                allCollections: filteredCollections,
                collections: filteredCollections,
                isLoading: false,
                isError: false,
                currentPage: 1,
                totalPages: Math.ceil(filteredCollections.length / 25),
                fetchPage: jest.fn(),
                hasNextPage: filteredCollections.length > 25,
                hasPrevPage: false,
                searchTerm: '',
                setSearchTerm: jest.fn(),
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

    mockUseGetEcommerceProducts.mockReturnValue({
        data: {
            data: [],
            metadata: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
        isLoading: false,
    })

    mockUseGetEcommerceProductCollections.mockReturnValue({
        data: {
            data: allCollections.map((collection) => ({
                external_id: collection.id.toString(),
                data: {
                    title: collection.title,
                },
            })),
            metadata: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
        isLoading: false,
    })

    return render(
        <MemoryRouter>
            <AiAgentProductRecommendationsPromote />
        </MemoryRouter>,
    )
}

const queryAllByTextAccessible = (screen: RenderResult, text: string) => {
    return screen.queryAllByText(text).filter((el) => !isInaccessible(el))
}

describe('AiAgentProductRecommendationsPromote', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(
            queryAllByTextAccessible(screen, 'Promote products'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '4 products')).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'Men’s Compression Top'),
        ).toHaveLength(1)
        expect(
            queryAllByTextAccessible(screen, 'Moisture-Wicking T-Shirt'),
        ).toHaveLength(1)
        expect(
            queryAllByTextAccessible(screen, 'Youth Track Pants'),
        ).toHaveLength(1)
        expect(
            queryAllByTextAccessible(screen, 'CrossFit Shorts'),
        ).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'Promote tags')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '4 tags')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'Gym Gear')).toHaveLength(1)
        expect(
            queryAllByTextAccessible(screen, 'Moisture-Wicking'),
        ).toHaveLength(1)
        expect(
            queryAllByTextAccessible(screen, 'Four-Way Stretch'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, 'Speed Training')).toHaveLength(
            1,
        )

        expect(
            queryAllByTextAccessible(screen, 'Promote vendors'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '5 vendors')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'ASICS')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, 'New Balance')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, 'Spalding')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, 'The North Face')).toHaveLength(
            1,
        )
        expect(queryAllByTextAccessible(screen, 'Salomon')).toHaveLength(0)

        expect(
            queryAllByTextAccessible(screen, 'Promote collections'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '3 collections')).toHaveLength(
            1,
        )

        expect(queryAllByTextAccessible(screen, 'Volleyball')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, 'New arrivals')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, 'New season')).toHaveLength(1)
    })

    it('should update products correctly', () => {
        const screen = renderComponent()

        const addButton = queryAllByTextAccessible(screen, 'Select products')[0]
        fireEvent.click(addButton)

        // Remove product
        const product1 = queryAllByTextAccessible(
            screen,
            'Men’s Compression Top',
        )[1]
        fireEvent.click(product1)

        // Add product
        const product2 = queryAllByTextAccessible(screen, 'Kids Active Tee')[0]
        fireEvent.click(product2)

        // Add product
        const product3 = queryAllByTextAccessible(screen, 'Fitness Gloves')[0]
        fireEvent.click(product3)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    defaultCollectionRules,
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

    it('should update products through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedProducts: [2, 4, 11, 16, 17, 18, 20],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Promoted Products',
        )[0]
        fireEvent.click(seeAllButton)

        const product1 = queryAllByTextAccessible(
            screen,
            'Men’s Compression Top',
        )[1]
        fireEvent.click(product1)

        const product2 = queryAllByTextAccessible(screen, 'Slim Fit Gym Tee')[0]
        fireEvent.click(product2)

        const product3 = queryAllByTextAccessible(
            screen,
            'Men’s Training Joggers',
        )[0]
        fireEvent.click(product3)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    defaultCollectionRules,
                    {
                        type: 'product',
                        items: [
                            { target: '4' },
                            { target: '11' },
                            { target: '16' },
                            { target: '18' },
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
                    defaultCollectionRules,
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

        const addButton = queryAllByTextAccessible(screen, 'Select tags')[0]
        fireEvent.click(addButton)

        // Remove tag
        const tag1 = queryAllByTextAccessible(screen, 'Four-Way Stretch')[1]
        fireEvent.click(tag1)

        // Add tag
        const tag2 = queryAllByTextAccessible(screen, 'Track & Field')[0]
        fireEvent.click(tag2)

        // Add tag
        const tag3 = queryAllByTextAccessible(screen, 'Lightweight Material')[0]
        fireEvent.click(tag3)

        // Add tag
        const tag4 = queryAllByTextAccessible(screen, 'CrossFit Apparel')[0]
        fireEvent.click(tag4)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    defaultCollectionRules,
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

    it('should update tags through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedTags: [
                'Yoga Clothing',
                'Gym Gear',
                'Speed Training',
                'Compression Wear',
                'Relaxed Fit',
                'Slim Fit',
            ],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Promoted Tags',
        )[0]
        fireEvent.click(seeAllButton)

        const product1 = queryAllByTextAccessible(screen, 'Gym Gear')[1]
        fireEvent.click(product1)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    defaultCollectionRules,
                    {
                        type: 'tag',
                        items: [
                            { target: 'Yoga Clothing' },
                            { target: 'Speed Training' },
                            { target: 'Compression Wear' },
                            { target: 'Relaxed Fit' },
                            { target: 'Slim Fit' },
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
                    defaultCollectionRules,
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

        const addButton = queryAllByTextAccessible(screen, 'Select vendors')[0]
        fireEvent.click(addButton)

        // Remove vendor
        const vendor1 = queryAllByTextAccessible(screen, 'Salomon')[0]
        fireEvent.click(vendor1)

        // Remove vendor
        const vendor2 = queryAllByTextAccessible(screen, 'ASICS')[1]
        fireEvent.click(vendor2)

        // Add vendor
        const vendor3 = queryAllByTextAccessible(screen, 'Puma')[0]
        fireEvent.click(vendor3)

        // Add vendor
        const vendor4 = queryAllByTextAccessible(screen, 'Franklin Sports')[0]
        fireEvent.click(vendor4)

        // Add vendor
        const vendor5 = queryAllByTextAccessible(screen, 'ProForm')[0]
        fireEvent.click(vendor5)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultCollectionRules,
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

    it('should update vendors through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedVendors: [
                'Nike',
                'Adidas',
                'Rawlings',
                'Easton',
                'Mizuno',
                'TRX Training',
                'Rogue Fitness',
            ],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Promoted Vendors',
        )[0]
        fireEvent.click(seeAllButton)

        const product1 = queryAllByTextAccessible(screen, 'Nike')[1]
        fireEvent.click(product1)

        const product2 = queryAllByTextAccessible(screen, 'Mizuno')[0]
        fireEvent.click(product2)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultCollectionRules,
                    {
                        type: 'vendor',
                        items: [
                            { target: 'Adidas' },
                            { target: 'Rawlings' },
                            { target: 'Easton' },
                            { target: 'TRX Training' },
                            { target: 'Rogue Fitness' },
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
                    defaultCollectionRules,
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

    it('should update collections correctly', () => {
        const screen = renderComponent()

        const addButton = queryAllByTextAccessible(
            screen,
            'Select collections',
        )[0]
        fireEvent.click(addButton)

        // Remove product
        const collection1 = queryAllByTextAccessible(screen, 'New arrivals')[1]
        fireEvent.click(collection1)

        // Add product
        const collection2 = queryAllByTextAccessible(screen, 'Golf')[0]
        fireEvent.click(collection2)

        // Add product
        const collection3 = queryAllByTextAccessible(screen, 'Clearance')[0]
        fireEvent.click(collection3)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'collection',
                        items: [
                            { target: '9' },
                            { target: '21' },
                            { target: '4' },
                            { target: '19' },
                        ],
                    },
                ],
            },
        })
    })

    it('should update products through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedCollections: [2, 3, 11, 18, 26, 28],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Promoted Collections',
        )[0]
        fireEvent.click(seeAllButton)

        const collection1 = queryAllByTextAccessible(screen, 'Football')[1]
        fireEvent.click(collection1)

        const collection2 = queryAllByTextAccessible(screen, 'Walking shoes')[0]
        fireEvent.click(collection2)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'collection',
                        items: [
                            { target: '2' },
                            { target: '11' },
                            { target: '18' },
                            { target: '26' },
                        ],
                    },
                ],
            },
        })
    })

    it('should remove collections correctly', () => {
        const screen = renderComponent({
            selectedCollections: [5, 9, 13, 21, 22],
        })

        const button = screen.getAllByRole('button', {
            name: 'Remove collection',
        })[2]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                gorgiasDomain: 'my-domain',
                recommendationAction: 'promoted',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'collection',
                        items: [
                            { target: '5' },
                            { target: '9' },
                            { target: '21' },
                            { target: '22' },
                        ],
                    },
                ],
            },
        })
    })
})
