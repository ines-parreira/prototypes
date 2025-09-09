import { useMemo } from 'react'

import { Product } from 'constants/integrations/types/shopify'
import { useListProducts } from 'models/integration/queries'
import { IntegrationDataItem } from 'models/integration/types'

type useAIJourneyProductListParams = {
    integrationId?: number
}

export const useAIJourneyProductList = ({
    integrationId,
}: useAIJourneyProductListParams) => {
    const { data: paginatedProductItems, isLoading } = useListProducts(
        integrationId ?? 0,
        !!integrationId,
        { limit: 50 },
        { refetchOnWindowFocus: false, refetchOnMount: false },
    )

    const productItemsData = paginatedProductItems?.pages?.reduce<
        IntegrationDataItem<Product>[]
    >((acc, page) => [...acc, ...page.data.data], [])

    const productList = useMemo(() => {
        return (productItemsData ?? [])
            .filter((item) => item.data.status === 'active')
            .filter((item) => !!item.data.image && !!item.data.title)
            .map((item) => item.data)
            .splice(0, 5)
    }, [productItemsData])

    return {
        productList,
        isLoading,
    }
}
