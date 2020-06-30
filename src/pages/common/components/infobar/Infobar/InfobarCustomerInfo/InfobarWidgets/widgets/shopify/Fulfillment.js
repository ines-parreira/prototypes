import React from 'react'
import type {Map} from 'immutable'
import {Badge} from 'reactstrap'
import classnames from 'classnames'

import {humanizeString} from '../../../../../../../../../utils'

export default function Fulfillment() {
    return {
        AfterTitle,
    }
}

type AfterTitleProps = {
    source: Map<string, string | number | boolean>,
}

const shipmentStatusColors = {
    label_printed: 'info',
    label_purchased: 'info',
    attempted_delivery: 'warning',
    ready_for_pickup: 'info',
    confirmed: 'info',
    in_transit: 'info',
    out_for_delivery: 'info',
    delivered: 'success',
    failure: 'danger',
}

function AfterTitle({source}: AfterTitleProps) {
    const shipmentStatus = source.get('shipment_status')
    const color = shipmentStatus ? shipmentStatusColors[shipmentStatus] : null

    return (
        <>
            {shipmentStatus && (
                <Badge className={classnames('ml-1')} color={color} pill>
                    {humanizeString(shipmentStatus).replace(/_/g, ' ')}
                </Badge>
            )}
        </>
    )
}
