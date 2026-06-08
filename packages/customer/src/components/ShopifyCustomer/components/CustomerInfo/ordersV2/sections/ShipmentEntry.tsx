import { CopyableField } from '@repo/ecommerce/shopify/components'
import { getShipmentStatusInfo } from '@repo/ecommerce/shopify/utils'

import { Box, Tag, Text } from '@gorgias/axiom'

import type {
    OrderDetailsData,
    OrderFieldConfig,
    OrderFieldRenderContext,
} from '../../types'

import css from '../../orders/sidePanel/OrderSidePanelPreview.less'

type Props = {
    order: OrderDetailsData
    fields: OrderFieldConfig[]
    context: OrderFieldRenderContext
    entryIndex: number
}

export function ShipmentEntry({ order, fields, context, entryIndex }: Props) {
    const shipmentStatusInfo = getShipmentStatusInfo(
        order.fulfillments?.[entryIndex]?.shipment_status,
    )

    return (
        <Box
            flexDirection="column"
            gap="xs"
            className={entryIndex > 0 ? css.groupDivider : undefined}
        >
            {shipmentStatusInfo && (
                <Box
                    display="grid"
                    w="100%"
                    alignItems="flex-start"
                    gap="xs"
                    className={css.row}
                >
                    <Text as="span" size="md" className={css.label}>
                        Shipment status
                    </Text>
                    <Box>
                        <Tag color={shipmentStatusInfo.color}>
                            {shipmentStatusInfo.label}
                        </Tag>
                    </Box>
                </Box>
            )}
            {fields.map((field) => {
                const value = field.getValue(context)
                const displayValue =
                    field.formatValue?.(value, context) ?? String(value ?? '-')

                const rawCopy =
                    value == null
                        ? undefined
                        : (field.copyValue?.(value, context) ?? String(value))
                const canCopy = Boolean(
                    field.copyable && rawCopy && rawCopy.length > 0,
                )

                const valueNode =
                    field.id === 'tracking_url' && value ? (
                        <a
                            href={String(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={css.trackingUrl}
                        >
                            {String(value)}
                        </a>
                    ) : (
                        <Text size="md">{displayValue}</Text>
                    )

                return (
                    <Box
                        key={field.id}
                        display="grid"
                        w="100%"
                        alignItems="flex-start"
                        gap="xs"
                        className={css.row}
                    >
                        <Text as="span" size="md" className={css.label}>
                            {field.label}
                        </Text>
                        {canCopy ? (
                            <CopyableField
                                value={rawCopy!}
                                ariaLabel={`Copy ${field.label}`}
                                inline
                            >
                                {valueNode}
                            </CopyableField>
                        ) : (
                            valueNode
                        )}
                    </Box>
                )
            })}
        </Box>
    )
}
