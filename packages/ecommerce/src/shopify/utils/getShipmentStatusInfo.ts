import { Color } from '@gorgias/axiom'
import type { Color as ColorType } from '@gorgias/axiom'

type ShipmentStatusInfo = {
    label: string
    color: Extract<ColorType, 'grey' | 'green' | 'orange' | 'red'>
}

export function getShipmentStatusInfo(
    status: string | null | undefined,
): ShipmentStatusInfo | null {
    if (!status) return null

    switch (status) {
        case 'label_printed':
            return { label: 'Label printed', color: Color.Grey }
        case 'label_purchased':
            return { label: 'Label purchased', color: Color.Grey }
        case 'confirmed':
            return { label: 'Confirmed', color: Color.Grey }
        case 'in_transit':
            return { label: 'In transit', color: Color.Grey }
        case 'out_for_delivery':
            return { label: 'Out for delivery', color: Color.Grey }
        case 'ready_for_pickup':
            return { label: 'Ready for pickup', color: Color.Grey }
        case 'attempted_delivery':
            return { label: 'Attempted delivery', color: Color.Orange }
        case 'delivered':
            return { label: 'Delivered', color: Color.Green }
        case 'failure':
            return { label: 'Failure', color: Color.Red }
        default:
            return {
                label: status
                    .replace(/_/g, ' ')
                    .replace(/^\w/, (c) => c.toUpperCase()),
                color: Color.Grey,
            }
    }
}
