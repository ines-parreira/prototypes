import { useCallback } from 'react'

import {
    Box,
    Button,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
} from '@gorgias/axiom'

import { ORDER_SECTION_CONFIGS } from '../fieldDefinitions/orderSectionConfig'
import { OrderFieldSectionsList } from '../orders/sections/OrderFieldSectionsList'
import type {
    OrderFieldPreferences,
    OrderFieldRenderContext,
    OrderSectionKey,
} from '../types'
import {
    initSections,
    sectionsEqual,
} from '../widget/orderFieldPreferences.utils'
import { reorderArray } from '../widget/sectionUtils'
import { useEditablePanelState } from './useEditablePanelState'

import css from './EditShopifyFieldsSidePanel.less'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    preferences: OrderFieldPreferences
    onConfirm: (preferences: OrderFieldPreferences) => void
    context: OrderFieldRenderContext
}

export function EditOrderFieldsSidePanel({
    isOpen,
    onOpenChange,
    preferences,
    onConfirm,
    context,
}: Props) {
    const init = useCallback(() => initSections(preferences), [preferences])

    const { localSections, setLocalSections, hasChanges } =
        useEditablePanelState({
            init,
            isEqual: sectionsEqual,
            isOpen,
        })

    const handleToggleVisibility = useCallback(
        (sectionKey: OrderSectionKey, id: string) => {
            setLocalSections((prev) => ({
                ...prev,
                [sectionKey]: {
                    ...prev[sectionKey],
                    fields: prev[sectionKey].fields.map((field) =>
                        field.id === id
                            ? { ...field, visible: !field.visible }
                            : field,
                    ),
                },
            }))
        },
        [setLocalSections],
    )

    const handleDrop = useCallback(
        (
            sectionKey: OrderSectionKey,
            dragIndex: number,
            hoverIndex: number,
        ) => {
            setLocalSections((prev) => ({
                ...prev,
                [sectionKey]: {
                    ...prev[sectionKey],
                    fields: reorderArray(
                        prev[sectionKey].fields,
                        dragIndex,
                        hoverIndex,
                    ),
                },
            }))
        },
        [setLocalSections],
    )

    const handleToggleAll = useCallback(
        (sectionKey: OrderSectionKey) => {
            setLocalSections((prev) => {
                const section = prev[sectionKey]
                const allVisible = section.fields.every((f) => f.visible)
                const newVisible = !allVisible
                return {
                    ...prev,
                    [sectionKey]: {
                        ...section,
                        fields: section.fields.map((field) => ({
                            ...field,
                            visible: newVisible,
                        })),
                    },
                }
            })
        },
        [setLocalSections],
    )

    const handleToggleSectionVisibility = useCallback(
        (sectionKey: OrderSectionKey) => {
            setLocalSections((prev) => ({
                ...prev,
                [sectionKey]: {
                    ...prev[sectionKey],
                    sectionVisible: !prev[sectionKey].sectionVisible,
                },
            }))
        },
        [setLocalSections],
    )

    const handleConfirm = useCallback(() => {
        const sections: OrderFieldPreferences['sections'] = {}
        for (const config of ORDER_SECTION_CONFIGS) {
            sections[config.key] = {
                fields: localSections[config.key].fields,
                sectionVisible: localSections[config.key].sectionVisible,
            }
        }
        onConfirm({ sections })
        onOpenChange(false)
    }, [localSections, onConfirm, onOpenChange])

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={() => onOpenChange(false)}
            size="sm"
        >
            <OverlayHeader
                title="Order details"
                description="Choose the data to show in the order side panel and rearrange them as needed."
            />

            <OverlayContent>
                <div className={css.tableContainer}>
                    <OrderFieldSectionsList
                        localSections={localSections}
                        context={context}
                        onToggleVisibility={handleToggleVisibility}
                        onDrop={handleDrop}
                        onToggleAll={handleToggleAll}
                        onToggleSectionVisibility={
                            handleToggleSectionVisibility
                        }
                    />
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
