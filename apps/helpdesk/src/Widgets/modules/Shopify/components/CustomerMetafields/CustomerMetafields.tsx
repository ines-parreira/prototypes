import { Skeleton } from '@gorgias/axiom'
import { useListShopifyCustomerMetafields } from '@gorgias/helpdesk-queries'

import { Metafield } from 'Widgets/modules/Shopify/modules/Metafields'
import { getMetafieldsFromResponse } from 'Widgets/modules/Shopify/modules/Metafields/helpers/getMetafieldsFromResponse'

import type { MetafieldProps } from './types'

import css from './CustomerMetafields.less'

export function CustomerMetafields({
    integrationId,
    customerId,
    metafields: sourceMetafields,
    useSourceMetafields,
}: MetafieldProps) {
    const { data, isLoading, isError } = useListShopifyCustomerMetafields(
        integrationId,
        customerId,
        {
            query: {
                enabled: !useSourceMetafields,
                refetchInterval: false,
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
            },
        },
    )

    if (!useSourceMetafields && isLoading) {
        return (
            <div className={css.loader}>
                <Skeleton />
            </div>
        )
    }
    if (!useSourceMetafields && isError) {
        return (
            <span className={css.errorMessage}>
                Temporarily unavailable, try again later.
            </span>
        )
    }

    const metafields = useSourceMetafields
        ? sourceMetafields
        : getMetafieldsFromResponse(data)

    if (!metafields?.length) {
        return (
            <div className={css.infoMessage}>
                Customer has no metafields populated.
            </div>
        )
    }

    return (
        <div className={css.metafields}>
            {metafields.map((field, index) => (
                <Metafield key={index} metafield={field} />
            ))}
        </div>
    )
}
