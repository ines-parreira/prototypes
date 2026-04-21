import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'
import {
    CopyableField,
    normalizeMetafields,
} from '@repo/ecommerce/shopify/components'
import { useUserDateTimePreferences } from '@repo/preferences'

import { Box, Text } from '@gorgias/axiom'

import { MetafieldsSection } from '../../MetafieldsSection'
import type { OrderDetailsData, OrderFieldRenderContext } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

import css from '../sidePanel/OrderSidePanelPreview.less'

type OrderDetailsSectionProps = {
    order: OrderDetailsData & {
        metafields?: FullShopifyMetafield[]
    }
    isDraftOrder?: boolean
    integrationId?: number
    ticketId?: string
    storeName?: string
}

export function OrderDetailsSection({
    order,
    isDraftOrder,
    integrationId,
    ticketId,
    storeName,
}: OrderDetailsSectionProps) {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    const { preferences, getVisibleFields } = useOrderFieldPreferences()
    const fields = getVisibleFields('orderDetails')

    if (
        preferences.sections.orderDetails?.sectionVisible === false ||
        fields.length === 0
    )
        return null

    const context: OrderFieldRenderContext = {
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
        <Box className={css.section} p="sm" display="block">
            <Box mb="xs">
                <Text size="md" variant="bold">
                    Order details
                </Text>
            </Box>
            <Box mb="sm" flexDirection="column" gap="xs">
                {fields.map((field) => {
                    if (field.type === 'component') {
                        const rendered = field.render(context)

                        if (!rendered) return null

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
                                {rendered}
                            </Box>
                        )
                    }

                    const value = field.getValue(context)
                    if (value == null) return null

                    const displayValue =
                        field.formatValue?.(value, context) ?? String(value)

                    const rawCopy =
                        field.copyValue?.(value, context) ?? String(value)
                    const canCopy = Boolean(
                        field.copyable && rawCopy && rawCopy.length > 0,
                    )
                    const valueNode = <Text size="md">{displayValue}</Text>

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
                                    value={rawCopy}
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
                <MetafieldsSection
                    integrationId={integrationId}
                    metafields={normalizeMetafields(order.metafields)}
                    storeName={storeName}
                />
            </Box>
        </Box>
    )
}
