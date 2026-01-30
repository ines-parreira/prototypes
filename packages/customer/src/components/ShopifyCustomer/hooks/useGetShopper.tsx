import {
    ObjectType,
    SourceType,
    useGetEcommerceDataByExternalId,
} from '@gorgias/ecommerce-storage-queries'

import type { ShopperEcommerceData } from '../types'

type Params = {
    integrationId: number | undefined
    externalId: string | undefined
}

export function useGetShopper({ integrationId, externalId }: Params) {
    const isEnabled = !!integrationId && !!externalId

    const { data: shopperResponse, isLoading: isLoadingShopper } =
        useGetEcommerceDataByExternalId(
            ObjectType.Shopper,
            SourceType.Shopify,
            String(integrationId ?? ''),
            externalId ?? '',
            {
                query: {
                    enabled: isEnabled,
                },
            },
        )

    const shopper = shopperResponse?.data as ShopperEcommerceData | undefined

    return {
        shopper,
        isLoadingShopper,
    }
}
