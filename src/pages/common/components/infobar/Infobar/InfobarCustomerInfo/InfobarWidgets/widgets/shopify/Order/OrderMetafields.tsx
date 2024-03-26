import {useListShopifyOrderMetafields} from '@gorgias/api-queries'
import React from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import Metafield from '../shared/Metafields/Metafield'
import css from './OrderMetafields.less'

type Props = {
    integrationId: number
    orderId: number
}

export default function OrderMetafields({integrationId, orderId}: Props) {
    const {data, isLoading, isError} = useListShopifyOrderMetafields(
        integrationId,
        orderId
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
                Temporarily unavailable, try again later
            </span>
        )
    }

    if (!data || data.data?.data?.length <= 0) {
        return <span className={css.infoMessage}>No metafields setup yet</span>
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
