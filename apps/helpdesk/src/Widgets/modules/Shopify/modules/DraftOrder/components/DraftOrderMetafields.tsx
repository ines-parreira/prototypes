import { logEvent, SegmentEvent } from '@repo/logging'

import { Skeleton } from '@gorgias/axiom'
import { useListShopifyOrderMetafields } from '@gorgias/helpdesk-queries'
import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

import {
    Metafield,
    MetafieldsContainer,
} from 'Widgets/modules/Shopify/modules/Metafields'

import css from './DraftOrderMetafields.less'

type Props = {
    integrationId: number
    draftOrderId: number
}

export default function WrappedDraftOrderMetafields(props: Props) {
    const onOpened = () => {
        logEvent(SegmentEvent.ShopifyMetafieldsOpenDraftOrder)
    }

    return (
        <MetafieldsContainer onOpened={onOpened} title="Draft Order Metafields">
            <DraftOrderMetafields {...props} />
        </MetafieldsContainer>
    )
}

export function DraftOrderMetafields({ integrationId, draftOrderId }: Props) {
    const { data, isLoading, isError } = useListShopifyOrderMetafields(
        integrationId,
        draftOrderId,
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

    const metafields = data?.data?.data as unknown as ShopifyMetafield[]

    if (!metafields || metafields.length === 0) {
        return (
            <span className={css.infoMessage}>
                Draft order has no metafields populated.
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
