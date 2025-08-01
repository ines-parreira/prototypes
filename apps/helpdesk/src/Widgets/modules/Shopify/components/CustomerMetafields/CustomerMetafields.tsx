import { useListShopifyCustomerMetafields } from '@gorgias/helpdesk-queries'
import { ShopifyMetafield } from '@gorgias/helpdesk-types'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import { Metafield } from 'Widgets/modules/Shopify/modules/Metafields'

import { MetafieldProps } from './types'

import css from './CustomerMetafields.less'

export function CustomerMetafields({
    integrationId,
    customerId,
}: MetafieldProps) {
    const { data, isLoading, isError } = useListShopifyCustomerMetafields(
        integrationId,
        customerId,
        {
            query: {
                refetchInterval: false,
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
            },
        },
    )

    if (isLoading) {
        return (
            <div className={css.loader}>
                <Skeleton />
            </div>
        )
    }
    if (isError) {
        return (
            <span className={css.errorMessage}>
                Temporarily unavailable, try again later.
            </span>
        )
    }

    if (!data?.data?.data?.length) {
        return (
            <div className={css.infoMessage}>
                Customer has no metafields populated.
            </div>
        )
    }

    const metafields = data.data.data as unknown as ShopifyMetafield[]
    return (
        <div className={css.metafields}>
            {metafields.map((field, index) => (
                <Metafield key={index} metafield={field} />
            ))}
        </div>
    )
}
