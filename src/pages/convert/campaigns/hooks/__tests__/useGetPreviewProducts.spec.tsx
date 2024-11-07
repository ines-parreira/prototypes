import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import {AttachmentEnum} from 'common/types'
import {
    InventoryManagement as ShipifyInventoryManagement,
    InventoryPolicy as ShipifyInventoryPolicy,
    ProductStatus,
} from 'constants/integrations/types/shopify'
import {campaignProductAttachment} from 'fixtures/campaign'
import {shopifyIntegration} from 'fixtures/integrations'
import {
    shopifyProductFixture,
    shopifyProductResult,
    shopifyVariantFixture,
} from 'fixtures/shopify'
import {useListProducts} from 'models/integration/queries'
import {useGetPreviewProducts} from 'pages/convert/campaigns/hooks/useGetPreviewProducts'
import {
    CampaignProductRecommendation,
    ProductRecommendationScenario,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import {pickNRandomShopifyProducts} from 'pages/convert/campaigns/utils/pickNRandomShopifyProducts'
import {transformAttachmentToProduct} from 'pages/convert/campaigns/utils/transformAttachmentToProduct'
import {transformCampaignAttachmentsToDetails} from 'pages/convert/campaigns/utils/transformCampaignAttachmentsToDetails'
import {assumeMock} from 'utils/testing'

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

jest.mock('pages/convert/campaigns/utils/pickNRandomShopifyProducts')
const pickNRandomShopifyProductsMock = assumeMock(pickNRandomShopifyProducts)

describe('useGetPreviewProducts', () => {
    const mockFetchNextPage = jest.fn()
    const storeIntegration = fromJS(shopifyIntegration)
    const productCount = 1
    const product = transformAttachmentToProduct(
        fromJS(
            transformCampaignAttachmentsToDetails([campaignProductAttachment])
        ),
        {
            currency: 'USD',
        }
    ) as unknown as CampaignProduct

    beforeEach(() => {
        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: shopifyProductResult(),
                        },
                    },
                ],
            },
            hasNextPage: true,
            fetchNextPage: mockFetchNextPage,
        } as any)

        pickNRandomShopifyProductsMock.mockReturnValue([
            {
                content_type: AttachmentEnum.Product,
                name: 'Swimming trunks',
                size: 0,
                url: 'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/trunks.jpg?v=1626170834',
                extra: {
                    product_id: 2,
                    variant_id: 39923189874899,
                    price: '25.00',
                    variant_name: 'Swimming trunks',
                    product_link: 'https://shopify.myshopify.com/products/',
                    currency: 'EUR',
                    featured_image:
                        'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/trunks.jpg?v=1626170834',
                },
            },
        ])
    })

    it('should return an empty array if no product recommendations and products are provided', () => {
        const productRecommendations: CampaignProductRecommendation[] = []
        const products: CampaignProduct[] = []

        const {result} = renderHook(() =>
            useGetPreviewProducts(
                storeIntegration,
                productRecommendations,
                products,
                productCount
            )
        )

        expect(result.current).toEqual([])
    })

    it('should return product attachments if there is no product recommendation', () => {
        const productRecommendations: CampaignProductRecommendation[] = []
        const products: CampaignProduct[] = [product]

        const {result} = renderHook(() =>
            useGetPreviewProducts(
                storeIntegration,
                productRecommendations,
                products,
                productCount
            )
        )

        expect(result.current).toEqual([product])
    })

    it('should prioritize product recommendations over products', () => {
        const productRecommendations: CampaignProductRecommendation[] = [
            {
                contentType: AttachmentEnum.ProductRecommendation,
                name: 'Yellow shirt',
                extra: {
                    id: '01J55AAS89MXWKTTDWK16J3MBA',
                    scenario: ProductRecommendationScenario.SimilarSeen,
                },
            },
        ]
        const products: CampaignProduct[] = [product]

        const {result} = renderHook(() =>
            useGetPreviewProducts(
                storeIntegration,
                productRecommendations,
                products,
                productCount
            )
        )

        expect(result.current).toEqual([
            {
                title: 'Swimming trunks',
                id: 2,
                price: 25,
                variant_name: 'Swimming trunks',
                url: 'https://shopify.myshopify.com/products/',
                currency: 'EUR',
                position: undefined,
                featured_image:
                    'https://cdn.shopify.com/s/files/1/0586/5295/0737/products/trunks.jpg?v=1626170834',
            },
        ])
    })

    it('should not return out of stock products or products without images', () => {
        const productNotAvailable = shopifyProductFixture({
            variants: [
                shopifyVariantFixture({
                    inventoryQuantity: -1,
                    inventoryManagement: ShipifyInventoryManagement.Shopify,
                    inventoryPolicy: ShipifyInventoryPolicy.Deny,
                }),
            ],
        })
        const [product_1, product_2] = shopifyProductResult()
        const shopifyProducts = [
            {
                ...product_1,
                data: productNotAvailable,
            },
            {
                ...product_2,
                data: {
                    ...product_2.data,
                    image: null,
                },
            },
        ]
        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: shopifyProducts,
                        },
                    },
                ],
            },
            hasNextPage: false,
            fetchNextPage: mockFetchNextPage,
        } as any)
        const productRecommendations: CampaignProductRecommendation[] = [
            {
                contentType: AttachmentEnum.ProductRecommendation,
                name: 'Yellow shirt',
                extra: {
                    id: '01J55AAS89MXWKTTDWK16J3MBA',
                    scenario: ProductRecommendationScenario.SimilarSeen,
                },
            },
        ]

        const {result} = renderHook(() =>
            useGetPreviewProducts(
                storeIntegration,
                productRecommendations,
                [],
                productCount
            )
        )

        expect(result.current).toEqual([])
        expect(pickNRandomShopifyProductsMock).not.toHaveBeenCalled()
    })

    it('should not return draft and not published products', () => {
        const [product_1, product_2] = shopifyProductResult()
        const shopifyProducts = [
            {
                ...product_1,
                data: {
                    ...product_1.data,
                    published_at: null,
                },
            },
            {
                ...product_2,
                data: {
                    ...product_2.data,
                    status: ProductStatus.Draft,
                },
            },
        ]
        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: shopifyProducts,
                        },
                    },
                ],
            },
            hasNextPage: false,
            fetchNextPage: mockFetchNextPage,
        } as any)
        const productRecommendations: CampaignProductRecommendation[] = [
            {
                contentType: AttachmentEnum.ProductRecommendation,
                name: 'Yellow shirt',
                extra: {
                    id: '01J55AAS89MXWKTTDWK16J3MBA',
                    scenario: ProductRecommendationScenario.SimilarSeen,
                },
            },
        ]

        const {result} = renderHook(() =>
            useGetPreviewProducts(
                storeIntegration,
                productRecommendations,
                [],
                productCount
            )
        )

        expect(result.current).toEqual([])
        expect(pickNRandomShopifyProductsMock).not.toHaveBeenCalled()
    })
})
