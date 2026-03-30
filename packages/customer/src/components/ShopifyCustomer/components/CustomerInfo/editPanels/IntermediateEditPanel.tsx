import { useCallback, useContext, useMemo, useState } from 'react'

import { Box, Button, Separator } from '@gorgias/axiom'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../../ShopifyCustomerContext'
import { CustomActionsSection } from '../CustomActionsSection'
import { CustomerMetricsSection } from '../CustomerMetricsSection'
import { OrdersPreviewSection } from '../orders/OrdersPreviewSection'
import type {
    FieldConfig,
    FieldRenderContext,
    OrderFieldPreferences,
    OrderFieldRenderContext,
    ShopifyFieldPreferences,
} from '../types'
import {
    deriveCustomerFields,
    deriveSections,
} from '../widget/customerFieldPreferences.utils'
import type { SectionFieldData } from '../widget/useCustomerFieldPreferences'
import { EditOrderFieldsSidePanel } from './EditOrderFieldsSidePanel'
import { EditShopifyFieldsSidePanel } from './EditShopifyFieldsSidePanel'

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
    sections: SectionFieldData[]
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
    sections,
}: IntermediateEditPanelProps) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)

    const [isEditMetricsOpen, setIsEditMetricsOpen] = useState(false)
    const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)

    const [pendingShopifyPrefs, setPendingShopifyPrefs] =
        useState<ShopifyFieldPreferences | null>(null)
    const [pendingOrderPrefs, setPendingOrderPrefs] =
        useState<OrderFieldPreferences | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const effectivePrefs = pendingShopifyPrefs ?? preferences

    const effectiveCustomerFields = useMemo(
        () =>
            pendingShopifyPrefs
                ? deriveCustomerFields(effectivePrefs)
                : customerFields,
        [pendingShopifyPrefs, customerFields, effectivePrefs],
    )

    const effectiveSections = useMemo(
        () => (pendingShopifyPrefs ? deriveSections(effectivePrefs) : sections),
        [pendingShopifyPrefs, sections, effectivePrefs],
    )

    const handleShopifyConfirm = useCallback(
        (prefs: ShopifyFieldPreferences) => {
            setPendingShopifyPrefs(prefs)
        },
        [],
    )

    const handleOrderConfirm = useCallback((prefs: OrderFieldPreferences) => {
        setPendingOrderPrefs(prefs)
    }, [])

    const handleSave = useCallback(async () => {
        setIsSaving(true)
        try {
            const promises: Promise<void>[] = []
            if (pendingShopifyPrefs) {
                promises.push(onSavePreferences(pendingShopifyPrefs))
            }
            if (pendingOrderPrefs) {
                promises.push(onSaveOrderPreferences(pendingOrderPrefs))
            }
            await Promise.all(promises)
            onClose()
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to save field preferences',
            })
        } finally {
            setIsSaving(false)
        }
    }, [
        pendingShopifyPrefs,
        pendingOrderPrefs,
        onSavePreferences,
        onSaveOrderPreferences,
        onClose,
        dispatchNotification,
    ])

    const hasPendingChanges = Boolean(pendingShopifyPrefs || pendingOrderPrefs)

    return (
        <>
            <Box flexDirection="column" flex={1} className={css.panel}>
                <div className={css.scrollableContent}>
                    <CustomActionsSection integrationName={integrationName} />
                    <CustomerMetricsSection
                        fields={effectiveCustomerFields}
                        context={context}
                        onEditMetricsClick={() => setIsEditMetricsOpen(true)}
                        sections={effectiveSections}
                    />
                    <Separator />
                    <OrdersPreviewSection
                        onEditOrderClick={() => setIsEditOrderOpen(true)}
                    />
                </div>
                <Box
                    flexDirection="row"
                    justifyContent="flex-end"
                    gap="xs"
                    padding="md"
                >
                    <Button
                        isLoading={isSaving}
                        variant="secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isDisabled={!hasPendingChanges || isSaving}
                        isLoading={isSaving}
                    >
                        Save changes
                    </Button>
                </Box>
            </Box>
            <EditShopifyFieldsSidePanel
                isOpen={isEditMetricsOpen}
                onOpenChange={setIsEditMetricsOpen}
                preferences={pendingShopifyPrefs ?? preferences}
                onConfirm={handleShopifyConfirm}
                context={context}
            />
            <EditOrderFieldsSidePanel
                isOpen={isEditOrderOpen}
                onOpenChange={setIsEditOrderOpen}
                preferences={pendingOrderPrefs ?? orderPreferences}
                onConfirm={handleOrderConfirm}
                context={orderContext}
            />
        </>
    )
}
