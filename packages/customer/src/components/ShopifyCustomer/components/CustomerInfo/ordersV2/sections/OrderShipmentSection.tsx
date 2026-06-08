import { useUserDateTimePreferences } from '@repo/preferences'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData, OrderFieldRenderContext } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

import { ShipmentEntry } from './ShipmentEntry'

type Props = {
    order: OrderDetailsData
    storeName?: string
    integrationId?: number
    ticketId?: string
    isDraftOrder?: boolean
}

export function OrderShipmentSection({
    order,
    storeName,
    integrationId,
    ticketId,
    isDraftOrder,
}: Props) {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()
    const { getVisibleFields, preferences } = useOrderFieldPreferences()
    const fields = getVisibleFields('shipping')

    const sectionPrefs = preferences.sections.shipping
    if (sectionPrefs?.sectionVisible === false) return null

    if (fields.length === 0) return null

    const shippingLinesCount = order.shipping_lines?.length ?? 0
    const fulfillmentsCount = order.fulfillments?.length ?? 0
    const entryCount = Math.max(shippingLinesCount, fulfillmentsCount, 1)

    const baseContext: OrderFieldRenderContext = {
        order,
        isDraftOrder,
        integrationId,
        ticketId,
        storeName,
        dateFormat,
        timeFormat,
        timezone,
    }

    return (
        <Box display="block" pt="sm" pb="sm">
            <Box mb="xs">
                <Text size="md" variant="bold">
                    Shipping
                </Text>
            </Box>
            <Box flexDirection="column" gap="xs">
                {Array.from({ length: entryCount }, (_, entryIndex) => (
                    <ShipmentEntry
                        key={entryIndex}
                        order={order}
                        fields={fields}
                        context={{
                            ...baseContext,
                            shippingEntryIndex: entryIndex,
                        }}
                        entryIndex={entryIndex}
                    />
                ))}
            </Box>
        </Box>
    )
}
