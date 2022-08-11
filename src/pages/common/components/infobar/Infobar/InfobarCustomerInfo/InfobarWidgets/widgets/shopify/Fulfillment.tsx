import React from 'react'
import {Map} from 'immutable'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {humanizeString} from 'utils'
import {StaticField} from '../StaticField'

export default function Fulfillment() {
    return {
        BeforeContent,
    }
}

type BeforeContentProps = {
    source: Map<any, any>
}

const shipmentStatusColors: Record<string, ColorType> = {
    label_printed: ColorType.Classic,
    label_purchased: ColorType.Classic,
    attempted_delivery: ColorType.Warning,
    ready_for_pickup: ColorType.Classic,
    confirmed: ColorType.Classic,
    in_transit: ColorType.Classic,
    out_for_delivery: ColorType.Classic,
    delivered: ColorType.Success,
    failure: ColorType.Error,
}

function BeforeContent({source}: BeforeContentProps) {
    const shipmentStatus = source.get('shipment_status') as
        | undefined
        | keyof typeof shipmentStatusColors
    const color = shipmentStatus
        ? shipmentStatusColors[shipmentStatus]
        : undefined

    return (
        <>
            {shipmentStatus && (
                <StaticField>
                    <Badge type={color}>
                        {humanizeString(shipmentStatus).replace(/_/g, ' ')}
                    </Badge>
                </StaticField>
            )}
        </>
    )
}
