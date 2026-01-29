import { logEvent, SegmentEvent } from '@repo/logging'

import { Skeleton } from '@gorgias/axiom'
import { useListShopifyOrderMetafields } from '@gorgias/helpdesk-queries'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import {
    Metafield,
    MetafieldsContainer,
    useMetafieldsFilter,
} from 'Widgets/modules/Shopify/modules/Metafields'
import { getMetafieldsFromResponse } from 'Widgets/modules/Shopify/modules/Metafields/helpers/getMetafieldsFromResponse'

import css from './OrderMetafields.less'

type Props = {
    integrationId: number
    orderId: number
    metafields?: ShopifyMetafield[]
    useSourceMetafields?: boolean
}

export default function WrappedOrderMetafields({
    integrationId,
    orderId,
    metafields,
    useSourceMetafields,
}: Props) {
    const onOpened = () => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenOrder)
    }

    return (
        <MetafieldsContainer
            onOpened={onOpened}
            title="Metafields"
            defaultOpen={useSourceMetafields}
        >
            <OrderMetafields
                integrationId={integrationId}
                orderId={orderId}
                metafields={metafields}
                useSourceMetafields={useSourceMetafields}
            />
        </MetafieldsContainer>
    )
}

export function OrderMetafields({
    integrationId,
    orderId,
    metafields: sourceMetafields,
    useSourceMetafields,
}: Props) {
    const { filterMetafields } = useMetafieldsFilter()
    const { data, isLoading, isError } = useListShopifyOrderMetafields(
        integrationId,
        orderId,
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
        ? filterMetafields(sourceMetafields ?? [])
        : getMetafieldsFromResponse(data)

    if (!metafields?.length) {
        return (
            <span className={css.infoMessage}>
                Order has no metafields populated.
            </span>
        )
    }

    return (
        <>
            {metafields.map((field, index) => (
                <Metafield key={index} metafield={field} />
            ))}
        </>
    )
}
