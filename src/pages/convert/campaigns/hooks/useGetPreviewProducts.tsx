import {useEffect, useMemo, useState} from 'react'
import {Map, fromJS} from 'immutable'
import {useListProducts} from 'models/integration/queries'
import {CampaignProduct} from 'pages/convert/campaigns/types/CampaignProduct'
import {pickNRandomShopifyProducts} from 'pages/convert/campaigns/utils/pickNRandomShopifyProducts'
import {transformAttachmentToProduct} from 'pages/convert/campaigns/utils/transformAttachmentToProduct'
import {CampaignProductRecommendation} from 'pages/convert/campaigns/types/CampaignAttachment'
import {mapIntegrationToPickedShopifyIntegration} from 'pages/common/draftjs/plugins/toolbar/utils'
import {isProductAvailable} from 'pages/convert/campaigns/utils/checkProductAvailability'
import {IntegrationDataItem} from 'models/integration/types'
import {Product} from 'constants/integrations/types/shopify'

export const useGetPreviewProducts = (
    shopifyIntegration: Map<string, any>,
    productRecommendations: CampaignProductRecommendation[],
    products: CampaignProduct[],
    productCount = 3
): CampaignProduct[] => {
    const [randomProducts, setRandomProducts] = useState<CampaignProduct[]>([])

    const integrationDataItemsResponse = useListProducts(
        shopifyIntegration.get('id'),
        !!productRecommendations.length && !randomProducts.length
    )

    const filteredShopifyProducts = useMemo(() => {
        const data = integrationDataItemsResponse?.data?.pages?.reduce(
            (acc, page) => [...acc, ...page.data.data],
            [] as IntegrationDataItem<Product>[]
        )
        const products = (data || []).filter((item) => {
            return (
                !item.deleted_datetime &&
                !!item.data.image &&
                isProductAvailable(item.data)
            )
        })

        if (
            products.length < productCount &&
            integrationDataItemsResponse.hasNextPage
        ) {
            void integrationDataItemsResponse.fetchNextPage()
            return []
        }

        return products
        // we need to observe pages exactly to trigger fetchNextPage properly
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integrationDataItemsResponse?.data?.pages])

    useEffect(() => {
        if (
            productRecommendations.length &&
            !randomProducts.length &&
            filteredShopifyProducts.length
        ) {
            const integration =
                mapIntegrationToPickedShopifyIntegration(shopifyIntegration)
            const newRandomProducts = pickNRandomShopifyProducts(
                filteredShopifyProducts,
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
        filteredShopifyProducts,
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
