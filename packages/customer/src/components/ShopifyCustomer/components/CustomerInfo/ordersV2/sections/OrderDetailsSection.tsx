import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'
import { normalizeMetafields } from '@repo/ecommerce/shopify/components'
import { useUserDateTimePreferences } from '@repo/preferences'

import { Box } from '@gorgias/axiom'

import { MetafieldsSection } from '../../MetafieldsSection'
import type { OrderDetailsData, OrderFieldRenderContext } from '../../types'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

import { OrderDetailFieldRow } from './OrderDetailFieldRow'

const URL_FIELD_IDS = new Set(['invoice_url', 'order_status_url'])

type Props = {
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
}: Props) {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    const { preferences, getVisibleFields } = useOrderFieldPreferences()
    const fields = getVisibleFields('orderDetails').filter(
        (f) => f.id !== 'tags',
    )

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
        <Box display="block" pt="sm" pb="sm">
            <Box mb="sm" flexDirection="column" gap="xxxs">
                {fields.map((field) => (
                    <OrderDetailFieldRow
                        key={field.id}
                        field={field}
                        context={context}
                        isUrlField={URL_FIELD_IDS.has(field.id)}
                    />
                ))}
                <MetafieldsSection
                    integrationId={integrationId}
                    metafields={normalizeMetafields(order.metafields)}
                    storeName={storeName}
                />
            </Box>
        </Box>
    )
}
