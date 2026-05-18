import { useCallback, useMemo, useState } from 'react'

import { Box, Button, Separator, toast } from '@gorgias/axiom'

import { AddCustomActionMenu } from '../AddCustomActionMenu'
import { useCustomActions, useSaveCustomActions } from '../CustomActions'
import type {
    ButtonConfig,
    CustomActionsBatchUpdate,
    LinkConfig,
} from '../CustomActions'
import { CustomActionsList } from '../CustomActionsList'
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

type PendingCustomActions = {
    links: LinkConfig[]
    buttons: ButtonConfig[]
}

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
    const [isEditMetricsOpen, setIsEditMetricsOpen] = useState(false)
    const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)

    const [pendingShopifyPrefs, setPendingShopifyPrefs] =
        useState<ShopifyFieldPreferences | null>(null)
    const [pendingOrderPrefs, setPendingOrderPrefs] =
        useState<OrderFieldPreferences | null>(null)
    const [pendingCustomerActions, setPendingCustomerActions] =
        useState<PendingCustomActions | null>(null)
    const [pendingOrderActions, setPendingOrderActions] =
        useState<PendingCustomActions | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const {
        links: customerLinks,
        buttons: customerButtons,
        isLoading: isLoadingCustomerActions,
    } = useCustomActions({ widgetPath: 'customer' })
    const {
        links: orderLinks,
        buttons: orderButtons,
        isLoading: isLoadingOrderActions,
    } = useCustomActions({ widgetPath: 'order' })
    const { save: saveCustomActions } = useSaveCustomActions()

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

    const effectiveCustomerActions = pendingCustomerActions ?? {
        links: customerLinks,
        buttons: customerButtons,
    }
    const effectiveOrderActions = pendingOrderActions ?? {
        links: orderLinks,
        buttons: orderButtons,
    }

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
            const customActionsUpdates: CustomActionsBatchUpdate = {}
            if (pendingCustomerActions) {
                customActionsUpdates.customer = pendingCustomerActions
            }
            if (pendingOrderActions) {
                customActionsUpdates.order = pendingOrderActions
            }
            if (Object.keys(customActionsUpdates).length > 0) {
                promises.push(saveCustomActions(customActionsUpdates))
            }
            await Promise.all(promises)
            onClose()
        } catch {
            toast.error('Failed to save changes')
        } finally {
            setIsSaving(false)
        }
    }, [
        pendingShopifyPrefs,
        pendingOrderPrefs,
        pendingCustomerActions,
        pendingOrderActions,
        onSavePreferences,
        onSaveOrderPreferences,
        saveCustomActions,
        onClose,
    ])

    const hasPendingChanges = Boolean(
        pendingShopifyPrefs ||
        pendingOrderPrefs ||
        pendingCustomerActions ||
        pendingOrderActions,
    )

    return (
        <>
            <Box flexDirection="column" flex={1} className={css.panel}>
                <div className={css.scrollableContent}>
                    <CustomActionsSection
                        integrationName={integrationName}
                        links={effectiveCustomerActions.links}
                        buttons={effectiveCustomerActions.buttons}
                        onChange={setPendingCustomerActions}
                        isLoading={isLoadingCustomerActions}
                        isDisabled={isSaving}
                    />
                    <CustomerMetricsSection
                        fields={effectiveCustomerFields}
                        context={context}
                        onEditMetricsClick={() => setIsEditMetricsOpen(true)}
                        sections={effectiveSections}
                    />
                    <Separator />
                    <OrdersPreviewSection
                        onEditOrderClick={() => setIsEditOrderOpen(true)}
                        addMenu={
                            <AddCustomActionMenu
                                links={effectiveOrderActions.links}
                                buttons={effectiveOrderActions.buttons}
                                onChange={setPendingOrderActions}
                                isLoading={isLoadingOrderActions}
                                isDisabled={isSaving}
                            />
                        }
                        actionsList={
                            <CustomActionsList
                                links={effectiveOrderActions.links}
                                buttons={effectiveOrderActions.buttons}
                                onChange={setPendingOrderActions}
                            />
                        }
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
