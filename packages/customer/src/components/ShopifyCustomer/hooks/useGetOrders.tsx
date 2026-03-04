import {
    ObjectType,
    SourceType,
    useListEcommerceData,
} from '@gorgias/ecommerce-storage-queries'

import type { OrderEcommerceData } from '../types'

type Params = {
    integrationId: number | undefined
    shopperIdentityId: string | undefined
}

export function useGetOrders({ integrationId, shopperIdentityId }: Params) {
    const isEnabled = !!integrationId && !!shopperIdentityId

    const {
        data: ordersResponse,
        isLoading: isLoadingOrders,
        refetch: refetchOrders,
    } = useListEcommerceData(
        ObjectType.Order,
        SourceType.Shopify,
        {
            params: {
                integration_id: integrationId,
                limit: 10,
            },
        },
        {
            query: {
                enabled: isEnabled,
            },
            http: {
                params: {
                    shopper_identity_ids: shopperIdentityId,
                },
            },
        },
    )

    const orders = ordersResponse?.data?.data as
        | OrderEcommerceData[]
        | undefined

    return {
        orders,
        isLoadingOrders,
        refetchOrders,
    }
}
