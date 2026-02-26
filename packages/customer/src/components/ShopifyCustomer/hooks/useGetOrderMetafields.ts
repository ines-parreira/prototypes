import { useListShopifyOrderMetafields } from '@gorgias/helpdesk-queries'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

type Params = {
    integrationId: number | undefined
    orderId: number | string | undefined
}

const EXCLUDED_METAFIELD_TYPES = [
    'customer_reference',
    'company_reference',
    'id',
    'link',
    'list.company_reference',
    'list.customer_reference',
    'list.link',
]

export function useGetOrderMetafields({ integrationId, orderId }: Params) {
    const isEnabled = !!integrationId && !!orderId

    const { data, isLoading, isError } = useListShopifyOrderMetafields(
        integrationId!,
        Number(orderId!),
        {
            query: {
                enabled: isEnabled,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
        },
    )

    const metafields = (
        data?.data?.data as ShopifyMetafield[] | undefined
    )?.filter((field) => !EXCLUDED_METAFIELD_TYPES.includes(field.type))

    return { metafields, isLoading, isError }
}
