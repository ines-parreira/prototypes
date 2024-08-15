import {useEffect, useMemo, useState} from 'react'
import {Map, fromJS} from 'immutable'
import {useProductsFromShopifyIntegration} from 'models/integration/queries'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import {pickNRandomShopifyProducts} from 'pages/convert/campaigns/utils/pickNRandomShopifyProducts'
import {transformAttachmentToProduct} from 'pages/convert/campaigns/utils/transformAttachmentToProduct'
import {CampaignProductRecommendation} from 'pages/convert/campaigns/types/CampaignAttachment'
import {mapIntegrationToPickedShopifyIntegration} from 'pages/common/draftjs/plugins/toolbar/utils'

export const useGetPreviewProducts = (
    shopifyIntegration: Map<string, any>,
    productRecommendations: CampaignProductRecommendation[],
    products: CampaignProduct[],
    productCount = 3
): CampaignProduct[] => {
    const [randomProducts, setRandomProducts] = useState<CampaignProduct[]>([])

    const shopifyProducts = useProductsFromShopifyIntegration(
        shopifyIntegration.get('id'),
        '',
        !!productRecommendations.length && !randomProducts.length
    )

    useEffect(() => {
        if (productRecommendations.length && !randomProducts.length) {
            const integration =
                mapIntegrationToPickedShopifyIntegration(shopifyIntegration)
            const newRandomProducts = pickNRandomShopifyProducts(
                shopifyProducts.data || [],
                integration,
                productCount
            )
            const transformedProducts = transformAttachmentToProduct(
                fromJS(newRandomProducts),
                {
                    currency: integration.get(['currency']),
                }
            )
            setRandomProducts(transformedProducts)
        }
    }, [
        productRecommendations.length,
        shopifyProducts.data,
        shopifyIntegration,
        productCount,
        randomProducts.length,
    ])

    return useMemo(() => {
        if (productRecommendations.length) {
            return randomProducts
        }
        return products
    }, [productRecommendations.length, products, randomProducts])
}
