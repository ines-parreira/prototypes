import { useCallback } from 'react'

import {
    Box,
    Button,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

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
    onConfirm: (preferences: ShopifyFieldPreferences) => void
    context: FieldRenderContext
}

export function EditShopifyFieldsSidePanel({
    isOpen,
    onOpenChange,
    preferences,
    onConfirm,
    context,
}: Props) {
    const init = useCallback(
        () => initShopifySections(preferences),
        [preferences],
    )

    const { localSections, setLocalSections, hasChanges } =
        useEditablePanelState({
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

    const handleConfirm = useCallback(() => {
        const sections: ShopifyFieldPreferences['sections'] = {}
        for (const config of SECTION_CONFIGS) {
            sections[config.key] = { fields: localSections[config.key] }
        }
        onConfirm({
            fields: localSections.customer,
            sections,
        })
        onOpenChange(false)
    }, [localSections, onConfirm, onOpenChange])

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

            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        isDisabled={!hasChanges}
                    >
                        Confirm
                    </Button>
                </Box>
            </OverlayFooter>
        </SidePanel>
    )
}
