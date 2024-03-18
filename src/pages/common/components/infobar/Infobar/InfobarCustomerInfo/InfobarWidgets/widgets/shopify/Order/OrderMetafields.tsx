import {useListShopifyOrderMetafields} from '@gorgias/api-queries'
import React from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import StaticField from 'Infobar/features/Field/display/StaticField'
import FieldLabel from 'Infobar/features/Field/display/FieldLabel'
import ShopifyMetafields from '../shared/Metafields/ShopifyMetafields'
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
        return <Skeleton className={css.loader} />
    }

    if (isError) {
        return (
            <StaticField>
                <FieldLabel>
                    Temporarily unavailable, try again later
                </FieldLabel>
            </StaticField>
        )
    }

    if (!data || data.data?.data?.length <= 0) {
        return (
            <StaticField>
                <FieldLabel>No metafields setup yet</FieldLabel>
            </StaticField>
        )
    }

    return <ShopifyMetafields metafields={data.data.data} />
}
