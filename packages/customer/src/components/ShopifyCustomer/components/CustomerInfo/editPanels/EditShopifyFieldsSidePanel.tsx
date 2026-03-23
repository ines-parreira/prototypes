import { useCallback, useContext } from 'react'

import {
    Button,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../../ShopifyCustomerContext'
import { getEnrichedFields } from '../fieldDefinitions/getEnrichedFields'
import { SECTION_CONFIGS } from '../fieldDefinitions/sectionConfig'
import type {
    FieldRenderContext,
    SectionKey,
    ShopifyFieldPreferences,
} from '../types'
import {
    initShopifySections,
    reorderArray,
    shopifySectionsEqual,
} from '../widget/sectionUtils'
import { EditableFieldSection } from './EditableFieldSection'
import { useEditablePanelState } from './useEditablePanelState'

import css from './EditShopifyFieldsSidePanel.less'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    preferences: ShopifyFieldPreferences
    onSave: (preferences: ShopifyFieldPreferences) => Promise<void>
    context: FieldRenderContext
}

export function EditShopifyFieldsSidePanel({
    isOpen,
    onOpenChange,
    preferences,
    onSave,
    context,
}: Props) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)

    const init = useCallback(
        () => initShopifySections(preferences),
        [preferences],
    )

    const {
        localSections,
        setLocalSections,
        isSaving,
        setIsSaving,
        isSavingRef,
        hasChanges,
    } = useEditablePanelState({
        init,
        isEqual: shopifySectionsEqual,
        isOpen,
    })

    const handleToggleVisibility = useCallback(
        (sectionKey: SectionKey, id: string) => {
            setLocalSections((prev) => ({
                ...prev,
                [sectionKey]: prev[sectionKey].map((field) =>
                    field.id === id
                        ? { ...field, visible: !field.visible }
                        : field,
                ),
            }))
        },
        [setLocalSections],
    )

    const handleDrop = useCallback(
        (sectionKey: SectionKey, dragIndex: number, hoverIndex: number) => {
            setLocalSections((prev) => ({
                ...prev,
                [sectionKey]: reorderArray(
                    prev[sectionKey],
                    dragIndex,
                    hoverIndex,
                ),
            }))
        },
        [setLocalSections],
    )

    const handleToggleAll = useCallback(
        (sectionKey: SectionKey) => {
            setLocalSections((prev) => {
                const allVisible = prev[sectionKey].every((f) => f.visible)
                const newVisible = !allVisible
                return {
                    ...prev,
                    [sectionKey]: prev[sectionKey].map((field) => ({
                        ...field,
                        visible: newVisible,
                    })),
                }
            })
        },
        [setLocalSections],
    )

    const handleSave = useCallback(async () => {
        isSavingRef.current = true
        setIsSaving(true)
        try {
            const sections: ShopifyFieldPreferences['sections'] = {}
            for (const config of SECTION_CONFIGS) {
                sections[config.key] = { fields: localSections[config.key] }
            }
            await onSave({
                fields: localSections.customer,
                sections,
            })
            onOpenChange(false)
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to save field preferences',
            })
        } finally {
            isSavingRef.current = false
            setIsSaving(false)
        }
    }, [
        localSections,
        onSave,
        onOpenChange,
        dispatchNotification,
        isSavingRef,
        setIsSaving,
    ])

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={() => onOpenChange(false)}
            size="sm"
        >
            <OverlayHeader
                title="Shopify metrics"
                description="Choose the data to show in the sidepanel and rearrange them as needed."
            />

            <OverlayContent>
                <div className={css.tableContainer}>
                    {SECTION_CONFIGS.map((config) => {
                        const fields = localSections[config.key]
                        const fieldsWithLabels = getEnrichedFields(
                            fields,
                            config.fieldDefinitions,
                            context,
                        )

                        return (
                            <EditableFieldSection
                                key={config.key}
                                label={config.label}
                                fields={fieldsWithLabels}
                                dragType={config.dragType}
                                onToggleAll={() => handleToggleAll(config.key)}
                                onToggleVisibility={(id) =>
                                    handleToggleVisibility(config.key, id)
                                }
                                onDrop={(dragIndex, hoverIndex) =>
                                    handleDrop(
                                        config.key,
                                        dragIndex,
                                        hoverIndex,
                                    )
                                }
                            />
                        )
                    })}
                </div>
            </OverlayContent>

            <OverlayFooter>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    isDisabled={!hasChanges || isSaving}
                    isLoading={isSaving}
                >
                    Save
                </Button>
            </OverlayFooter>
        </SidePanel>
    )
}
