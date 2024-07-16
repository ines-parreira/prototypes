import {useListShopifyOrderMetafields} from '@gorgias/api-queries'
import React from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {
    Metafield,
    MetafieldsContainer,
} from 'Widgets/modules/Shopify/modules/Metafields'

import css from './OrderMetafields.less'

type Props = {
    integrationId: number
    orderId: number
}

export default function WrappedOrderMetafields(props: Props) {
    return (
        <MetafieldsContainer>
            <OrderMetafields {...props} />
        </MetafieldsContainer>
    )
}

export function OrderMetafields({integrationId, orderId}: Props) {
    const {data, isLoading, isError} = useListShopifyOrderMetafields(
        integrationId,
        orderId,
        {
            query: {
                refetchInterval: false,
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
            },
        }
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

    if (!data || data.data?.data?.length <= 0) {
        return (
            <span className={css.infoMessage}>
                Order has no metafields populated.
            </span>
        )
    }

    const metafields = data.data.data
    return (
        <>
            {metafields.map((field, index) => (
                <Metafield key={index} metafield={field} />
            ))}
        </>
    )
}
