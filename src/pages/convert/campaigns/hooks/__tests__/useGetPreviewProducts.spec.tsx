import {fromJS} from 'immutable'
import {renderHook} from '@testing-library/react-hooks'
import {useGetPreviewProducts} from 'pages/convert/campaigns/hooks/useGetPreviewProducts'
import {
    CampaignProductRecommendation,
    ProductRecommendationScenario,
} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import {shopifyIntegration} from 'fixtures/integrations'
import {AttachmentEnum} from 'common/types'
import {useProductsFromShopifyIntegration} from 'models/integration/queries'
import {assumeMock} from 'utils/testing'
import {shopifyProductResult} from 'fixtures/shopify'
import {IntegrationDataItem} from 'models/integration/types'
import {Product} from 'constants/integrations/types/shopify'
import {transformAttachmentToProduct} from 'pages/convert/campaigns/utils/transformAttachmentToProduct'
import {campaignProductAttachment} from 'fixtures/campaign'
import {transformCampaignAttachmentsToDetails} from 'pages/convert/campaigns/utils/transformCampaignAttachmentsToDetails'
import {pickNRandomShopifyProducts} from 'pages/convert/campaigns/utils/pickNRandomShopifyProducts'

jest.mock('models/integration/queries')
const useProductsFromShopifyIntegrationMock = assumeMock(
    useProductsFromShopifyIntegration
)

jest.mock('pages/convert/campaigns/utils/pickNRandomShopifyProducts')
const pickNRandomShopifyProductsMock = assumeMock(pickNRandomShopifyProducts)

describe('useGetPreviewProducts', () => {
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
        useProductsFromShopifyIntegrationMock.mockReturnValue({
            data: [
                shopifyProductResult(),
            ] as unknown as IntegrationDataItem<Product>[],
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
})
