import { Box, Button, Separator } from '@gorgias/axiom'

import { CustomActionsSection } from './CustomActionsSection'
import { CustomerMetricsSection } from './CustomerMetricsSection'
import { OrdersPreviewSection } from './OrdersPreviewSection'
import type {
    FieldConfig,
    FieldRenderContext,
    ShopifyFieldPreferences,
} from './types'

import css from './IntermediateEditPanel.less'

type IntermediateEditPanelProps = {
    customerFields: FieldConfig[]
    context: FieldRenderContext
    preferences: ShopifyFieldPreferences
    onSavePreferences: (preferences: ShopifyFieldPreferences) => Promise<void>
    onClose: () => void
    integrationName?: string
}

export function IntermediateEditPanel({
    customerFields,
    context,
    preferences,
    onSavePreferences,
    onClose,
    integrationName,
}: IntermediateEditPanelProps) {
    return (
        <Box flexDirection="column" flex={1} className={css.panel}>
            <CustomActionsSection integrationName={integrationName} />
            <CustomerMetricsSection
                fields={customerFields}
                context={context}
                preferences={preferences}
                onSavePreferences={onSavePreferences}
            />
            <Separator />
            <OrdersPreviewSection />
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
    )
}
