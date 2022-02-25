import React from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {humanizeString} from 'utils'

export default function Fulfillment() {
    return {
        AfterTitle,
    }
}

type AfterTitleProps = {
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

function AfterTitle({source}: AfterTitleProps) {
    const shipmentStatus = source.get('shipment_status') as
        | undefined
        | keyof typeof shipmentStatusColors
    const color = shipmentStatus
        ? shipmentStatusColors[shipmentStatus]
        : undefined

    return (
        <>
            {shipmentStatus && (
                <Badge className={classnames('ml-1')} type={color}>
                    {humanizeString(shipmentStatus).replace(/_/g, ' ')}
                </Badge>
            )}
        </>
    )
}
