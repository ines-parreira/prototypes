import { useCallback, useMemo, useState } from 'react'

import { useId } from '@repo/hooks'

import {
    Button,
    Icon,
    ListItem,
    ListSection,
    MultiSelect,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../../../KnowledgeHub/constants'
import { dispatchDocumentEvent } from '../../../../KnowledgeHub/EmptyState/utils'
import { ButtonRenderMode } from './types'
import type {
    DuplicateGuidanceProps,
    StoreIntegrationItem,
    StoreSection,
    TriggerProps,
} from './types'
import { buildDuplicateNotificationMessage, cleanStoreName } from './utils'

import './DuplicateGuidance.less'

export const DuplicateGuidance = ({
    isDisabled,
    renderMode = ButtonRenderMode.Visible,
    tooltipMessage,
    onChange,
    shopName,
    articleIds,
    trigger,
    placement,
    onDuplicate,
}: DuplicateGuidanceProps) => {
    const id = useId()
    const buttonId = `duplicate-button-${id}`
    const dispatch = useAppDispatch()
    const storeIntegrations = useStoreIntegrations()
    const [selectedStores, setSelectedStores] = useState<
        StoreIntegrationItem[]
    >([])
    const [resetKey, setResetKey] = useState(0)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const items: StoreIntegrationItem[] = useMemo(
        () =>
            storeIntegrations.map((item, idx) => ({
                id: String(idx),
                name: item.name,
            })),
        [storeIntegrations],
    )

    const isApplyDisabled = useMemo(
        () => selectedStores.length === 0 || isDisabled,
        [selectedStores.length, isDisabled],
    )

    const sections = useMemo(() => {
        // Sort items so current store appears first - prioritize showing current shop name first
        const sortedItems = [...items].sort((a, b) => {
            const isACurrent = a.name === shopName
            const isBCurrent = b.name === shopName
            if (isACurrent && !isBCurrent) return -1
            if (!isACurrent && isBCurrent) return 1
            return 0
        })

        // Add "(current)" label to the current store
        const storeItems = sortedItems.map((item) =>
            item.name === shopName
                ? { ...item, name: `${item.name} (current)` }
                : item,
        )

        // Add Action button as the last item so that appears at the end of the list
        const allItems = [
            ...storeItems,
            {
                id: 'apply-action',
                name: 'Apply',
                isAction: true,
            },
        ]

        return [
            {
                id: 'stores',
                name: 'Duplicate to',
                items: allItems,
            },
        ]
        // isApplyDisabled is needed to trigger re-render when button state changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, shopName, isApplyDisabled])

    const handleApply = useCallback(async () => {
        if (selectedStores.length === 0 || articleIds.length === 0) {
            return
        }

        const cleanedShopNames = selectedStores.map((store) =>
            cleanStoreName(store.name),
        )

        setIsDropdownOpen(false)

        try {
            const result = await onDuplicate(articleIds, cleanedShopNames)

            if (!result.success) {
                await dispatch(
                    notify({
                        message: 'An error occurred while duplicating guidance',
                        status: NotificationStatus.Error,
                    }),
                )
                return
            }

            const notificationMessage = buildDuplicateNotificationMessage(
                selectedStores,
                shopName,
            )
            await dispatch(
                notify({
                    message: notificationMessage,
                    status: NotificationStatus.Success,
                    allowHTML: true,
                }),
            )

            const isDuplicatingToCurrentStore = cleanedShopNames.some(
                (cleanedName) => cleanedName === shopName,
            )
            if (isDuplicatingToCurrentStore) {
                dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
            }
        } catch {
            await dispatch(
                notify({
                    message: 'Failed to duplicate guidance',
                    status: NotificationStatus.Error,
                }),
            )
        } finally {
            setSelectedStores([])
            setResetKey((prev) => prev + 1)
        }
    }, [selectedStores, articleIds, shopName, dispatch, onDuplicate])

    const handleChange = useCallback(
        (value: StoreIntegrationItem[]) => {
            const storeSelections = value.filter((item) => !item.isAction)

            const applyActionClicked = value.some((item) => item.isAction)

            // This is necessary because ListItem is actually being clicked
            if (applyActionClicked) {
                void handleApply()
                return
            }

            setSelectedStores(storeSelections)
            onChange?.(storeSelections)
        },
        [onChange, handleApply],
    )

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setIsDropdownOpen(isOpen)
    }, [])

    // Default trigger for bulk actions (Button with text "Duplicate")
    const defaultTrigger = ({ ref }: TriggerProps) => (
        <Button
            ref={ref}
            slot="button"
            intent="regular"
            size="sm"
            variant="secondary"
            trailingSlot={<Icon name="arrow-chevron-down" />}
            isDisabled={isDisabled}
        >
            Duplicate
        </Button>
    )

    if (renderMode === ButtonRenderMode.Hidden) {
        return null
    }

    const multiSelect = (
        <MultiSelect<StoreSection>
            key={resetKey}
            maxWidth={290}
            trigger={trigger || defaultTrigger}
            maxHeight={206}
            isSearchable
            isOpen={isDropdownOpen}
            onOpenChange={handleOpenChange}
            items={sections}
            onSelect={handleChange as (value: StoreSection[]) => void}
            aria-label="Duplicate guidance selection"
            placement={placement}
        >
            {(section: StoreSection) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(option: StoreIntegrationItem) => {
                        if (option.isAction) {
                            return (
                                <ListItem
                                    key={option.id}
                                    label=""
                                    textValue="Apply"
                                    trailingSlot={
                                        <Button
                                            intent="regular"
                                            size="sm"
                                            variant="primary"
                                            isDisabled={isApplyDisabled}
                                        >
                                            Apply
                                        </Button>
                                    }
                                />
                            )
                        }

                        return <ListItem key={option.id} label={option.name} />
                    }}
                </ListSection>
            )}
        </MultiSelect>
    )

    if (renderMode === ButtonRenderMode.DisabledWithTooltip && tooltipMessage) {
        return (
            <>
                <span id={buttonId}>{multiSelect}</span>
                <Tooltip target={buttonId} placement="top">
                    {tooltipMessage}
                </Tooltip>
            </>
        )
    }

    return multiSelect
}
