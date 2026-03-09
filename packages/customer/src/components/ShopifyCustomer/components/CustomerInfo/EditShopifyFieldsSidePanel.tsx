import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {
    Box,
    Button,
    HeaderCell,
    Icon,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
    TableBody,
    TableHeader,
    TableRoot,
    TableRow,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../ShopifyCustomerContext'
import { DraggableFieldRow } from './DraggableFieldRow'
import { reorderArray } from './editShopifyFields.utils'
import { FIELD_DEFINITIONS } from './fields'
import type {
    FieldPreference,
    FieldRenderContext,
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

function fieldsEqual(a: FieldPreference[], b: FieldPreference[]): boolean {
    if (a.length !== b.length) return false
    return a.every((f, i) => f.id === b[i].id && f.visible === b[i].visible)
}

export function EditShopifyFieldsSidePanel({
    isOpen,
    onOpenChange,
    preferences,
    onSave,
    context,
}: Props) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)
    const [localFields, setLocalFields] = useState(preferences.fields)
    const initialFieldsRef = useRef(preferences.fields)
    const isSavingRef = useRef(false)
    const [isExpanded, setIsExpanded] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen && !isSavingRef.current) {
            setLocalFields(preferences.fields)
            initialFieldsRef.current = preferences.fields
            setIsExpanded(true)
        }
    }, [isOpen, preferences.fields])

    const hasChanges = useMemo(
        () => !fieldsEqual(localFields, initialFieldsRef.current),
        [localFields],
    )

    const handleToggleVisibility = useCallback((id: string) => {
        setLocalFields((prev) =>
            prev.map((field) =>
                field.id === id ? { ...field, visible: !field.visible } : field,
            ),
        )
    }, [])

    const handleDrop = useCallback((dragIndex: number, hoverIndex: number) => {
        setLocalFields((prev) => reorderArray(prev, dragIndex, hoverIndex))
    }, [])

    const handleSave = useCallback(async () => {
        isSavingRef.current = true
        setIsSaving(true)
        try {
            await onSave({ fields: localFields })
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
    }, [localFields, onSave, onOpenChange, dispatchNotification])

    const allVisible = localFields.every((f) => f.visible)

    const handleToggleAll = useCallback(() => {
        const newVisible = !allVisible
        setLocalFields((prev) =>
            prev.map((field) => ({ ...field, visible: newVisible })),
        )
    }, [allVisible])

    const fieldsWithLabels = useMemo(
        () =>
            localFields
                .filter((f) => FIELD_DEFINITIONS[f.id])
                .map((f) => {
                    const def = FIELD_DEFINITIONS[f.id]
                    const rawValue = def.getValue(context)
                    const displayValue = def.formatValue
                        ? def.formatValue(rawValue, context)
                        : String(rawValue ?? '-')

                    return {
                        ...f,
                        label: def.label,
                        displayValue,
                    }
                }),
        [localFields, context],
    )

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
                    <div className={css.sectionContainer}>
                        <Box
                            pt="sm"
                            pb="sm"
                            pl="md"
                            pr="md"
                            justifyContent="space-between"
                            alignItems="center"
                            className={css.sectionHeader}
                        >
                            <Text variant="bold">Customer</Text>
                            <Box gap="sm" alignItems="center">
                                <ToggleField
                                    value={allVisible}
                                    onChange={handleToggleAll}
                                />
                                <Button
                                    variant="tertiary"
                                    icon={
                                        isExpanded
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    aria-label={
                                        isExpanded
                                            ? 'Collapse fields'
                                            : 'Expand fields'
                                    }
                                    onClick={() => setIsExpanded((v) => !v)}
                                />
                            </Box>
                        </Box>
                        {isExpanded && (
                            <TableRoot>
                                <TableHeader>
                                    <TableRow>
                                        <HeaderCell
                                            className={css.dragHeaderCell}
                                        >
                                            <Icon name="arrow-down-up" />
                                        </HeaderCell>
                                        <HeaderCell
                                            className={css.metricHeaderCell}
                                        >
                                            Metric
                                        </HeaderCell>
                                        <HeaderCell
                                            className={css.valueHeaderCell}
                                        />
                                        <HeaderCell
                                            className={css.toggleHeaderCell}
                                        >
                                            Show
                                        </HeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fieldsWithLabels.map((field, index) => (
                                        <DraggableFieldRow
                                            key={field.id}
                                            field={field}
                                            index={index}
                                            onToggleVisibility={
                                                handleToggleVisibility
                                            }
                                            onDrop={handleDrop}
                                        />
                                    ))}
                                </TableBody>
                            </TableRoot>
                        )}
                    </div>
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
