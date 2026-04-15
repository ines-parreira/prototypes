import { useUserDateTimePreferences } from '@repo/preferences'

import { Box, Text } from '@gorgias/axiom'

import type { OrderDetailsData, OrderFieldRenderContext } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

import css from '../sidePanel/OrderSidePanelPreview.less'

type OrderShipmentSectionProps = {
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
}: OrderShipmentSectionProps) {
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
        <Box className={css.section} p="sm" display="block" mt="sm">
            <Box mb="xs">
                <Text size="md" variant="bold">
                    Shipping
                </Text>
            </Box>
            <Box flexDirection="column" gap="xs">
                {Array.from({ length: entryCount }, (_, entryIndex) => {
                    const context: OrderFieldRenderContext = {
                        ...baseContext,
                        shippingEntryIndex: entryIndex,
                    }

                    return (
                        <Box
                            key={entryIndex}
                            flexDirection="column"
                            gap="xs"
                            className={
                                entryIndex > 0 ? css.groupDivider : undefined
                            }
                        >
                            {fields.map((field) => {
                                const value = field.getValue(context)
                                const displayValue =
                                    field.formatValue?.(value, context) ??
                                    String(value ?? '-')

                                return (
                                    <Box
                                        key={field.id}
                                        display="grid"
                                        w="100%"
                                        alignItems="flex-start"
                                        gap="xs"
                                        className={css.row}
                                    >
                                        <Text
                                            as="span"
                                            size="md"
                                            className={css.label}
                                        >
                                            {field.label}
                                        </Text>
                                        {field.id === 'tracking_url' &&
                                        value ? (
                                            <a
                                                href={String(value)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={css.trackingUrl}
                                            >
                                                {String(value)}
                                            </a>
                                        ) : (
                                            <Text size="md">
                                                {displayValue}
                                            </Text>
                                        )}
                                    </Box>
                                )
                            })}
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}
