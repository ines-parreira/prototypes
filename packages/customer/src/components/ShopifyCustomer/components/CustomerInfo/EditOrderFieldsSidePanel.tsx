import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

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
} from '../../ShopifyCustomerContext'
import { EditableFieldSection } from './EditableFieldSection'
import { reorderArray } from './editShopifyFields.utils'
import { NonConfigurableSection } from './NonConfigurableSection'
import type { SectionState } from './orderFieldPreferences.utils'
import { initSections, sectionsEqual } from './orderFieldPreferences.utils'
import { ORDER_SECTION_CONFIGS } from './orderSectionConfig'
import type { OrderSectionConfig } from './orderSectionConfig'
import type {
    OrderFieldPreferences,
    OrderFieldRenderContext,
    OrderSectionKey,
} from './types'

import css from './EditShopifyFieldsSidePanel.less'

type EditOrderFieldsSidePanelProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    preferences: OrderFieldPreferences
    onSave: (preferences: OrderFieldPreferences) => Promise<void>
    context: OrderFieldRenderContext
}

function getEnrichedFields(
    sectionState: SectionState,
    config: OrderSectionConfig,
    context: OrderFieldRenderContext,
) {
    return sectionState.fields
        .filter((f) => config.fieldDefinitions[f.id])
        .map((f) => {
            const def = config.fieldDefinitions[f.id]
            const rawValue = def.getValue(context)
            const displayValue = def.formatValue
                ? def.formatValue(rawValue, context)
                : String(rawValue ?? '-')

            return { ...f, label: def.label, displayValue }
        })
}

export function EditOrderFieldsSidePanel({
    isOpen,
    onOpenChange,
    preferences,
    onSave,
    context,
}: EditOrderFieldsSidePanelProps) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)
    const [localSections, setLocalSections] = useState(() =>
        initSections(preferences),
    )
    const initialSectionsRef = useRef(localSections)
    const [isSaving, setIsSaving] = useState(false)
    const isSavingRef = useRef(false)

    useEffect(() => {
        if (isOpen && !isSavingRef.current) {
            const sections = initSections(preferences)
            setLocalSections(sections)
            initialSectionsRef.current = sections
        }
    }, [isOpen, preferences])

    const hasChanges = useMemo(
        () => !sectionsEqual(localSections, initialSectionsRef.current),
        [localSections],
    )

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
        [],
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
        [],
    )

    const handleToggleAll = useCallback((sectionKey: OrderSectionKey) => {
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
    }, [])

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
        [],
    )

    const handleSave = useCallback(async () => {
        isSavingRef.current = true
        setIsSaving(true)
        try {
            const sections: OrderFieldPreferences['sections'] = {}
            for (const config of ORDER_SECTION_CONFIGS) {
                sections[config.key] = {
                    fields: localSections[config.key].fields,
                    sectionVisible: localSections[config.key].sectionVisible,
                }
            }
            await onSave({ sections })
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
    }, [localSections, onSave, onOpenChange, dispatchNotification])

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
                    {ORDER_SECTION_CONFIGS.map((config) => {
                        const sectionState = localSections[config.key]

                        if (config.isNonConfigurable) {
                            return (
                                <NonConfigurableSection
                                    key={config.key}
                                    label={config.label}
                                    sectionVisible={sectionState.sectionVisible}
                                    onToggleSectionVisibility={() =>
                                        handleToggleSectionVisibility(
                                            config.key,
                                        )
                                    }
                                    isToggleDisabled={config.isToggleDisabled}
                                    disclaimer={config.disclaimer}
                                />
                            )
                        }

                        const fields = getEnrichedFields(
                            sectionState,
                            config,
                            context,
                        )

                        return (
                            <EditableFieldSection
                                key={config.key}
                                label={config.label}
                                fields={fields}
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
