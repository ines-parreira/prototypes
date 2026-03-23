import { useState } from 'react'

import { Box, Button, Text } from '@gorgias/axiom'

import { CustomerInfoFieldList } from './CustomerInfoFieldList'
import { EditShopifyFieldsSidePanel } from './editPanels/EditShopifyFieldsSidePanel'
import type {
    FieldConfig,
    FieldRenderContext,
    ShopifyFieldPreferences,
} from './types'

import css from './editPanels/IntermediateEditPanel.less'

type CustomerMetricsSectionProps = {
    fields: FieldConfig[]
    context: FieldRenderContext
    preferences: ShopifyFieldPreferences
    onSavePreferences: (preferences: ShopifyFieldPreferences) => Promise<void>
}

export function CustomerMetricsSection({
    fields,
    context,
    preferences,
    onSavePreferences,
}: CustomerMetricsSectionProps) {
    const [isEditMetricsOpen, setIsEditMetricsOpen] = useState(false)

    return (
        <>
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
