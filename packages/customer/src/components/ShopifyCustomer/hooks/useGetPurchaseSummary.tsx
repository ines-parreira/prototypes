import {
    ObjectType,
    SourceType,
    useGetEcommerceDataByExternalId,
} from '@gorgias/ecommerce-storage-queries'

import type { PurchaseSummaryData } from '../types'

type Params = {
    integrationId: number | undefined
    externalId: string | undefined
}

export function useGetPurchaseSummary({ integrationId, externalId }: Params) {
    const isEnabled = !!integrationId && !!externalId

    const {
        data: purchaseSummaryResponse,
        isLoading: isLoadingPurchaseSummary,
    } = useGetEcommerceDataByExternalId(
        ObjectType.PurchaseSummary,
        SourceType.Shopify,
        String(integrationId ?? ''),
        externalId ?? '',
        {
            query: {
                enabled: isEnabled,
            },
        },
    )

    const purchaseSummary = purchaseSummaryResponse?.data?.data as
        | PurchaseSummaryData
        | undefined

    return {
        purchaseSummary,
        isLoadingPurchaseSummary,
    }
}
