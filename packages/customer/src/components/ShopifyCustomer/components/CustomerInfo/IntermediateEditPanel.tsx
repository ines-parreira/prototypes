import { useState } from 'react'

import { OrderCard } from '@repo/ecommerce/shopify/components'
import type { OrderCardOrder } from '@repo/ecommerce/shopify/types'
import {
    FinancialStatus,
    FulfillmentStatus,
} from '@repo/ecommerce/shopify/types'

import { Box, Button, Separator, Text } from '@gorgias/axiom'

import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { EditShopifyFieldsSidePanel } from './EditShopifyFieldsSidePanel'
import type {
    FieldConfig,
    FieldRenderContext,
    ShopifyFieldPreferences,
} from './types'

import css from './IntermediateEditPanel.less'

type Props = {
    fields: FieldConfig[]
    context: FieldRenderContext
    preferences: ShopifyFieldPreferences
    onSavePreferences: (preferences: ShopifyFieldPreferences) => Promise<void>
    onClose: () => void
}

const placeholderOrder: OrderCardOrder = {
    name: '#XXXXXXX',
    currency: 'USD',
    total_price: 'XX.XX',
    financial_status: FinancialStatus.Paid,
    fulfillment_status: FulfillmentStatus.Fulfilled,
    line_items: [
        { title: 'Placeholder item', product_id: null, variant_id: null },
    ],
}

export function IntermediateEditPanel({
    fields,
    context,
    preferences,
    onSavePreferences,
    onClose,
}: Props) {
    const [isEditMetricsOpen, setIsEditMetricsOpen] = useState(false)

    return (
        <>
            <Box flexDirection="column" flexGrow={1}>
                <div className={css.section}>
                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom="sm"
                    >
                        <Text size="md" variant="bold">
                            Customer metrics
                        </Text>
                        <Button
                            size="sm"
                            variant="secondary"
                            leadingSlot="edit"
                            onClick={() => setIsEditMetricsOpen(true)}
                        >
                            Edit metrics
                        </Button>
                    </Box>
                    <CustomerInfoFieldList fields={fields} context={context} />
                </div>

                <Separator />
                <div className={css.section}>
                    <Box flexDirection="column" gap="xs">
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Text size="md" variant="bold">
                                Orders
                            </Text>
                            <Button
                                size="sm"
                                variant="secondary"
                                leadingSlot="edit"
                                isDisabled
                            >
                                Edit order details
                            </Button>
                        </Box>

                        <OrderCard
                            order={placeholderOrder}
                            displayedDate="Friday"
                        />
                    </Box>
                </div>

                <Box
                    flexDirection="row"
                    justifyContent="flex-end"
                    gap="xs"
                    padding="md"
                    marginTop="auto"
                >
                    <Button variant="primary" onClick={onClose}>
                        Confirm
                    </Button>
                </Box>
            </Box>

            <EditShopifyFieldsSidePanel
                isOpen={isEditMetricsOpen}
                onOpenChange={setIsEditMetricsOpen}
                preferences={preferences}
                onSave={onSavePreferences}
                context={context}
            />
        </>
    )
}
