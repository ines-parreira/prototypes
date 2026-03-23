import type { ObjectType } from '@gorgias/ecommerce-storage-queries'
import {
    SourceType,
    useGetEcommerceDataByExternalId,
} from '@gorgias/ecommerce-storage-queries'

type Params = {
    integrationId: number | undefined
    externalId: string | undefined
    objectType: ObjectType
}

export function useGetMarketingConsent({
    integrationId,
    externalId,
    objectType,
}: Params) {
    const isEnabled = !!integrationId && !!externalId

    const { data: response, isLoading } = useGetEcommerceDataByExternalId(
        objectType,
        SourceType.Shopify,
        String(integrationId ?? ''),
        externalId ?? '',
        {
            query: {
                enabled: isEnabled,
            },
        },
    )

    return {
        data: response?.data?.data,
        isLoading,
    }
}
