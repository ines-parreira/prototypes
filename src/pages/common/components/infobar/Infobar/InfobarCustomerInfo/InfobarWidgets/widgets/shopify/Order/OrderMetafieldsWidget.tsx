import React from 'react'
import MetafieldsContainer from '../shared/Metafields/MetafieldsContainer'
import OrderMetafields from './OrderMetafields'

type Props = {
    integrationId: number
    orderId: number
}

export default function OrderMetafieldsWidget({integrationId, orderId}: Props) {
    return (
        <MetafieldsContainer>
            <OrderMetafields integrationId={integrationId} orderId={orderId} />
        </MetafieldsContainer>
    )
}
