import { useState } from 'react'

import { Box, Button, Separator } from '@gorgias/axiom'

import { CustomActionsSection } from './CustomActionsSection'
import { CustomerMetricsSection } from './CustomerMetricsSection'
import { EditOrderFieldsSidePanel } from './EditOrderFieldsSidePanel'
import { OrdersPreviewSection } from './OrdersPreviewSection'
import type {
    FieldConfig,
    FieldRenderContext,
    OrderFieldPreferences,
    OrderFieldRenderContext,
    ShopifyFieldPreferences,
} from './types'

import css from './IntermediateEditPanel.less'

type IntermediateEditPanelProps = {
    customerFields: FieldConfig[]
    context: FieldRenderContext
    preferences: ShopifyFieldPreferences
    onSavePreferences: (preferences: ShopifyFieldPreferences) => Promise<void>
    orderPreferences: OrderFieldPreferences
    onSaveOrderPreferences: (
        preferences: OrderFieldPreferences,
    ) => Promise<void>
    orderContext: OrderFieldRenderContext
    onClose: () => void
    integrationName?: string
}

export function IntermediateEditPanel({
    customerFields,
    context,
    preferences,
    onSavePreferences,
    orderPreferences,
    onSaveOrderPreferences,
    orderContext,
    onClose,
    integrationName,
}: IntermediateEditPanelProps) {
    const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)

    return (
        <>
            <Box flexDirection="column" flex={1} className={css.panel}>
                <CustomActionsSection integrationName={integrationName} />
                <CustomerMetricsSection
                    fields={customerFields}
                    context={context}
                    preferences={preferences}
                    onSavePreferences={onSavePreferences}
                />
                <Separator />
                <OrdersPreviewSection
                    onEditOrderClick={() => setIsEditOrderOpen(true)}
                />
                <Box
                    flexDirection="row"
                    justifyContent="flex-end"
                    gap="xs"
                    padding="md"
                >
                    <Button variant="primary" onClick={onClose}>
                        Confirm
                    </Button>
                </Box>
            </Box>
            <EditOrderFieldsSidePanel
                isOpen={isEditOrderOpen}
                onOpenChange={setIsEditOrderOpen}
                preferences={orderPreferences}
                onSave={onSaveOrderPreferences}
                context={orderContext}
            />
        </>
    )
}
