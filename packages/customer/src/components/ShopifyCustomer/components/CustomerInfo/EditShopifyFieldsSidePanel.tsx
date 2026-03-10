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
import { SECTION_CONFIGS } from './sectionConfig'
import type {
    FieldPreference,
    FieldRenderContext,
    SectionKey,
    ShopifyFieldPreferences,
} from './types'

import css from './EditShopifyFieldsSidePanel.less'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    preferences: ShopifyFieldPreferences
    onSave: (preferences: ShopifyFieldPreferences) => Promise<void>
    context: FieldRenderContext
}

function sectionsEqual(
    a: Record<SectionKey, FieldPreference[]>,
    b: Record<SectionKey, FieldPreference[]>,
): boolean {
    for (const config of SECTION_CONFIGS) {
        const aFields = a[config.key]
        const bFields = b[config.key]
        if (aFields.length !== bFields.length) return false
        if (
            !aFields.every(
                (f, i) =>
                    f.id === bFields[i].id && f.visible === bFields[i].visible,
            )
        )
            return false
    }
    return true
}

function initSections(
    preferences: ShopifyFieldPreferences,
): Record<SectionKey, FieldPreference[]> {
    const sections = {} as Record<SectionKey, FieldPreference[]>
    for (const config of SECTION_CONFIGS) {
        const sectionPref = preferences.sections?.[config.key]
        if (sectionPref) {
            sections[config.key] = sectionPref.fields
        } else if (config.key === 'customer') {
            sections[config.key] = preferences.fields
        } else {
            sections[config.key] = Object.keys(config.fieldDefinitions).map(
                (id) => ({ id, visible: false }),
            )
        }
    }
    return sections
}

export function EditShopifyFieldsSidePanel({
    isOpen,
    onOpenChange,
    preferences,
    onSave,
    context,
}: Props) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)
    const [localSections, setLocalSections] = useState(() =>
        initSections(preferences),
    )
    const initialSectionsRef = useRef(localSections)
    const isSavingRef = useRef(false)
    const [isSaving, setIsSaving] = useState(false)

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
        [],
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
        [],
    )

    const handleToggleAll = useCallback((sectionKey: SectionKey) => {
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
    }, [])

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
    }, [localSections, onSave, onOpenChange, dispatchNotification])

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
                        const fieldsWithLabels = fields
                            .filter((f) => config.fieldDefinitions[f.id])
                            .map((f) => {
                                const def = config.fieldDefinitions[f.id]
                                const rawValue = def.getValue(context)
                                const displayValue = def.formatValue
                                    ? def.formatValue(rawValue, context)
                                    : String(rawValue ?? '-')

                                return {
                                    ...f,
                                    label: def.label,
                                    displayValue,
                                }
                            })

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
