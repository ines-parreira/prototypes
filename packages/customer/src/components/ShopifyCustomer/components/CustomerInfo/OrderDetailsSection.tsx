import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'
import { normalizeMetafields } from '@repo/ecommerce/shopify/components'
import { useUserDateTimePreferences } from '@repo/preferences'

import { Box, Text } from '@gorgias/axiom'

import { MetafieldsSection } from './MetafieldsSection'
import type { OrderFieldRenderContext } from './types'
import { useOrderDetailsFieldPreferences } from './useOrderDetailsFieldPreferences'

import css from './OrderSidePanelPreview.less'

type Props = {
    order: {
        id: number | string
        tags?: string
        note?: string
        created_at?: string
        invoice_url?: string
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
}: Props) {
    const { dateFormat, timeFormat } = useUserDateTimePreferences()

    const { fields } = useOrderDetailsFieldPreferences()

    const context: OrderFieldRenderContext = {
        order,
        isDraftOrder,
        integrationId,
        ticketId,
        storeName,
        dateFormat,
        timeFormat,
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
                            <Text size="md">{displayValue}</Text>
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
