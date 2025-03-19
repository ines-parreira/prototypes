import { Map } from 'immutable'

import { Badge, ColorType } from '@gorgias/merchant-ui-kit'

import { humanizeString } from 'utils'
import { CardCustomization } from 'Widgets/modules/Template/modules/Card'
import { StaticField } from 'Widgets/modules/Template/modules/Field'

type BeforeContentProps = {
    source: Map<any, any>
}

const shipmentStatusColors: Record<string, ColorType> = {
    label_printed: 'classic',
    label_purchased: 'classic',
    attempted_delivery: 'warning',
    ready_for_pickup: 'classic',
    confirmed: 'classic',
    in_transit: 'classic',
    out_for_delivery: 'classic',
    delivered: 'success',
    failure: 'error',
}

const BeforeContent = ({ source }: BeforeContentProps) => {
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

export const fulfillmentCustomization: CardCustomization = {
    BeforeContent,
}
