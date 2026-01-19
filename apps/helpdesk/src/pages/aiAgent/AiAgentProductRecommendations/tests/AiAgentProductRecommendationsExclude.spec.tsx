import type { RenderResult } from '@testing-library/react'
import { fireEvent, isInaccessible, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import type { GetProductRecommendationRules } from '@gorgias/knowledge-service-client'

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

import { AiAgentProductRecommendationsExclude } from '../AiAgentProductRecommendationsExclude'
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
        { target: '1' },
        { target: '6' },
        { target: '9' },
        { target: '11' },
        { target: '15' },
    ],
}

const defaultTagRules = {
    type: 'tag',
    items: [
        { target: 'Yoga Clothing' },
        { target: 'Slim Fit' },
        { target: 'Performance Mesh' },
    ],
}

const defaultVendorRules = {
    type: 'vendor',
    items: [
        { target: 'Adidas' },
        { target: 'Reebok' },
        { target: 'ProForm' },
        { target: 'The North Face' },
    ],
}

const defaultCollectionRules = {
    type: 'collection',
    items: [{ target: '3' }],
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
        promoted: [
            {
                type: 'product',
                items: [
                    { target: '2' },
                    { target: '5' },
                    { target: '14' },
                    { target: '15' },
                ],
            },
        ],
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
            <AiAgentProductRecommendationsExclude />
        </MemoryRouter>,
    )
}

const queryAllByTextAccessible = (screen: RenderResult, text: string) => {
    return screen.queryAllByText(text).filter((el) => !isInaccessible(el))
}

describe('AiAgentProductRecommendationsExclude', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(
            queryAllByTextAccessible(screen, 'Exclude products'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '5 products')).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'Performance Running Shorts'),
        ).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'High-Waisted Gym Leggings'),
        ).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'Breathable Mesh Tank Top'),
        ).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'Athletic Water Bottle'),
        ).toHaveLength(1)

        // Should be hidden because only the first 4 are
        expect(
            queryAllByTextAccessible(screen, 'Unisex Workout Cap'),
        ).toHaveLength(0)

        expect(queryAllByTextAccessible(screen, 'Exclude tags')).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '3 tags')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'Yoga Clothing')).toHaveLength(
            1,
        )

        expect(queryAllByTextAccessible(screen, 'Slim Fit')).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'Performance Mesh'),
        ).toHaveLength(1)

        expect(
            queryAllByTextAccessible(screen, 'Exclude vendors'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '4 vendors')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'Adidas')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'Reebok')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'ProForm')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'The North Face')).toHaveLength(
            1,
        )

        expect(
            queryAllByTextAccessible(screen, 'Exclude collections'),
        ).toHaveLength(1)
        expect(queryAllByTextAccessible(screen, '1 collection')).toHaveLength(1)

        expect(queryAllByTextAccessible(screen, 'Football')).toHaveLength(1)
    })

    it('should update products correctly', () => {
        const screen = renderComponent()

        const addButton = queryAllByTextAccessible(screen, 'Select products')[0]
        fireEvent.click(addButton)

        // Remove product
        const product1 = queryAllByTextAccessible(
            screen,
            'Performance Running Shorts',
        )[1]
        fireEvent.click(product1)

        // Add product
        const product2 = queryAllByTextAccessible(
            screen,
            'Youth Track Pants',
        )[0]
        fireEvent.click(product2)

        // Add product
        const product3 = queryAllByTextAccessible(screen, 'Slim Fit Gym Tee')[0]
        fireEvent.click(product3)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    defaultCollectionRules,
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
                ],
            },
        })
    })

    it('should update products through see all drawer correctly', () => {
        const screen = renderComponent()

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Excluded Products',
        )[0]
        fireEvent.click(seeAllButton)

        const product1 = queryAllByTextAccessible(
            screen,
            'Performance Running Shorts',
        )[1]
        fireEvent.click(product1)

        const product2 = queryAllByTextAccessible(
            screen,
            'High-Waisted Gym Leggings',
        )[1]
        fireEvent.click(product2)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    defaultCollectionRules,
                    {
                        type: 'product',
                        items: [
                            { target: '9' },
                            { target: '11' },
                            { target: '15' },
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
                recommendationAction: 'excluded',
                rules: [
                    defaultTagRules,
                    defaultVendorRules,
                    defaultCollectionRules,
                    {
                        type: 'product',
                        items: [
                            { target: '1' },
                            { target: '6' },
                            { target: '11' },
                            { target: '15' },
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
        const tag1 = queryAllByTextAccessible(screen, 'Slim Fit')[1]
        fireEvent.click(tag1)

        // Add tag
        const tag2 = queryAllByTextAccessible(screen, 'HIIT Wear')[0]
        fireEvent.click(tag2)

        // Add tag
        const tag3 = queryAllByTextAccessible(screen, 'Compression Wear')[0]
        fireEvent.click(tag3)

        // Add tag
        const tag4 = queryAllByTextAccessible(screen, 'Four-Way Stretch')[0]
        fireEvent.click(tag4)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    defaultCollectionRules,
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

    it('should update tags through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedTags: [
                'CrossFit Apparel',
                'HIIT Wear',
                'Yoga Clothing',
                'Breathable Fabric',
                'Lightweight Material',
                'Four-Way Stretch',
                'Performance Mesh',
            ],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Excluded Tags',
        )[0]
        fireEvent.click(seeAllButton)

        const product1 = queryAllByTextAccessible(screen, 'CrossFit Apparel')[1]
        fireEvent.click(product1)

        const product2 = queryAllByTextAccessible(screen, 'Performance Mesh')[0]
        fireEvent.click(product2)

        const product3 = queryAllByTextAccessible(
            screen,
            'Breathable Fabric',
        )[1]
        fireEvent.click(product3)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    defaultCollectionRules,
                    {
                        type: 'tag',
                        items: [
                            { target: 'HIIT Wear' },
                            { target: 'Yoga Clothing' },
                            { target: 'Lightweight Material' },
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
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultVendorRules,
                    defaultCollectionRules,
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

    it('should update vendors correctly', () => {
        const screen = renderComponent()

        const addButton = queryAllByTextAccessible(screen, 'Select vendors')[0]
        fireEvent.click(addButton)

        // Remove vendor
        const vendor1 = queryAllByTextAccessible(screen, 'The North Face')[1]
        fireEvent.click(vendor1)

        // Remove vendor
        const vendor2 = queryAllByTextAccessible(screen, 'Adidas')[1]
        fireEvent.click(vendor2)

        // Add vendor
        const vendor3 = queryAllByTextAccessible(screen, 'Nike')[0]
        fireEvent.click(vendor3)

        // Add vendor
        const vendor4 = queryAllByTextAccessible(screen, 'Mizuno')[0]
        fireEvent.click(vendor4)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultCollectionRules,
                    {
                        type: 'vendor',
                        items: [
                            { target: 'Reebok' },
                            { target: 'ProForm' },
                            { target: 'Nike' },
                            { target: 'Mizuno' },
                        ],
                    },
                ],
            },
        })
    })

    it('should update vendors through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedVendors: [
                'Puma',
                'New Balance',
                'ASICS',
                'Mizuno',
                'Bowflex (Nautilus Inc.)',
                'The North Face',
                'Salomon',
            ],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Excluded Vendors',
        )[0]
        fireEvent.click(seeAllButton)

        const product1 = queryAllByTextAccessible(screen, 'Salomon')[0]
        fireEvent.click(product1)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultCollectionRules,
                    {
                        type: 'vendor',
                        items: [
                            { target: 'Puma' },
                            { target: 'New Balance' },
                            { target: 'ASICS' },
                            { target: 'Mizuno' },
                            { target: 'Bowflex (Nautilus Inc.)' },
                            { target: 'The North Face' },
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
        })[2]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultCollectionRules,
                    {
                        type: 'vendor',
                        items: [
                            { target: 'Adidas' },
                            { target: 'Reebok' },
                            { target: 'The North Face' },
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
        const collection1 = queryAllByTextAccessible(screen, 'Football')[1]
        fireEvent.click(collection1)

        // Add product
        const collection2 = queryAllByTextAccessible(screen, 'CrossFit')[0]
        fireEvent.click(collection2)

        // Add product
        const collection3 = queryAllByTextAccessible(screen, 'New season')[0]
        fireEvent.click(collection3)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'collection',
                        items: [{ target: '12' }, { target: '21' }],
                    },
                ],
            },
        })
    })

    it('should update products through see all drawer correctly', () => {
        const screen = renderComponent({
            selectedCollections: [1, 5, 6, 15, 22, 29],
        })

        const seeAllButton = queryAllByTextAccessible(
            screen,
            'See All Excluded Collections',
        )[0]
        fireEvent.click(seeAllButton)

        const collection1 = queryAllByTextAccessible(screen, 'Basketball')[1]
        fireEvent.click(collection1)

        const collection2 = queryAllByTextAccessible(screen, 'Sandals')[0]
        fireEvent.click(collection2)

        const submitButton = queryAllByTextAccessible(screen, 'Save Changes')[0]
        fireEvent.click(submitButton)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'collection',
                        items: [
                            { target: '1' },
                            { target: '6' },
                            { target: '15' },
                            { target: '22' },
                        ],
                    },
                ],
            },
        })
    })

    it('should remove collections correctly', () => {
        const screen = renderComponent({
            selectedCollections: [1, 5, 6, 15, 22, 29],
        })

        const button = screen.getAllByRole('button', {
            name: 'Remove collection',
        })[2]
        fireEvent.click(button)

        expect(mockUpsertRulesProductRecommendation).toHaveBeenCalledWith({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    defaultProductRules,
                    defaultTagRules,
                    defaultVendorRules,
                    {
                        type: 'collection',
                        items: [
                            { target: '1' },
                            { target: '5' },
                            { target: '15' },
                            { target: '22' },
                            { target: '29' },
                        ],
                    },
                ],
            },
        })
    })
})
