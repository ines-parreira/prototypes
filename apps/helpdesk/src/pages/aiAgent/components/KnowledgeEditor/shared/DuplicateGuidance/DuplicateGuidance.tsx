import { useCallback, useMemo, useState } from 'react'

import { useId } from '@repo/hooks'

import {
    Button,
    Icon,
    ListFooter,
    ListItem,
    ListSection,
    MultiSelect,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../../../KnowledgeHub/constants'
import { dispatchDocumentEvent } from '../../../../KnowledgeHub/EmptyState/utils'
import { ButtonRenderMode } from './types'
import type {
    DuplicateGuidanceProps,
    StoreIntegrationItem,
    StoreSection,
} from './types'
import { useStoresWithCompletedSetup } from './useStoresWithCompletedSetup'
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
    const storeIntegrations = useStoresWithCompletedSetup()
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

        return [
            {
                id: 'stores',
                name: 'Duplicate to',
                items: storeItems,
            },
        ]
    }, [items, shopName])

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
                        showDismissButton: true,
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
                    showDismissButton: true,
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
                    showDismissButton: true,
                }),
            )
        } finally {
            setSelectedStores([])
            setResetKey((prev) => prev + 1)
        }
    }, [selectedStores, articleIds, shopName, dispatch, onDuplicate])

    const handleChange = useCallback(
        (value: StoreIntegrationItem[]) => {
            setSelectedStores(value)
            onChange?.(value)
        },
        [onChange],
    )

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setIsDropdownOpen(isOpen)
    }, [])

    // Default trigger for bulk actions (Button with text "Duplicate")
    const defaultTrigger = () => (
        <Button
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
            // fixing minWidth to same as maxWidth (100%) to prevent container from jumping and allowing enough space
            // to render search input and not to cut off text while typing
            minWidth={290}
            trigger={trigger || defaultTrigger}
            maxHeight={206}
            isSearchable
            isOpen={isDropdownOpen}
            onOpenChange={handleOpenChange}
            items={sections}
            onSelect={handleChange as (value: StoreSection[]) => void}
            aria-label="Duplicate guidance selection"
            placement={placement}
            footer={
                <ListFooter>
                    <Button
                        intent="regular"
                        size="sm"
                        variant="primary"
                        isDisabled={isApplyDisabled}
                        onClick={handleApply}
                    >
                        Apply
                    </Button>
                </ListFooter>
            }
        >
            {(section: StoreSection) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(option: StoreIntegrationItem) => (
                        <ListItem key={option.id} label={option.name} />
                    )}
                </ListSection>
            )}
        </MultiSelect>
    )

    if (renderMode === ButtonRenderMode.DisabledWithTooltip && tooltipMessage) {
        return (
            <>
                <Tooltip
                    placement="top"
                    delay={0}
                    trigger={<span id={buttonId}>{multiSelect}</span>}
                >
                    <TooltipContent caption={tooltipMessage} />
                </Tooltip>
            </>
        )
    }

    return multiSelect
}
