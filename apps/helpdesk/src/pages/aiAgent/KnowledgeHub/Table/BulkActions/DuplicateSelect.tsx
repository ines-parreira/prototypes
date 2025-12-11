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
import { useBulkCopyArticles } from 'models/helpCenter/queries'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../constants'
import { dispatchDocumentEvent } from '../../EmptyState/utils'
import type { GroupedKnowledgeItem } from '../../types'
import { ButtonRenderMode } from './types'
import { buildDuplicateNotificationMessage, cleanStoreName } from './utils'

import './DuplicateSelect.less'

type StoreIntegrationItem = {
    id: string
    name: string
    isAction?: boolean
}

type StoreSection = {
    id: string
    name: string
    items: StoreIntegrationItem[]
}

type DuplicateSelectProps = {
    isDisabled?: boolean
    renderMode?: ButtonRenderMode
    tooltipMessage?: string
    onChange?: (selectedStores: StoreIntegrationItem[]) => void
    shopName?: string
    helpCenterId?: number | null
    selectedItems?: GroupedKnowledgeItem[]
}

export const DuplicateSelect = ({
    isDisabled,
    renderMode = ButtonRenderMode.Visible,
    tooltipMessage,
    onChange,
    shopName,
    helpCenterId,
    selectedItems = [],
}: DuplicateSelectProps) => {
    const id = useId()
    const buttonId = `duplicate-button-${id}`
    const dispatch = useAppDispatch()
    const storeIntegrations = useStoreIntegrations()
    const [selectedStores, setSelectedStores] = useState<
        StoreIntegrationItem[]
    >([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const copyMutation = useBulkCopyArticles({
        onSuccess: () => {
            setIsDropdownOpen(false)
        },
    })

    const articleIds = useMemo(
        () => selectedItems.map((item) => Number(item.id)),
        [selectedItems],
    )

    const items: StoreIntegrationItem[] = useMemo(
        () =>
            storeIntegrations.map((item, idx) => ({
                id: String(idx),
                name: item.name,
            })),
        [storeIntegrations],
    )

    const isApplyDisabled = useMemo(
        () => selectedStores.length === 0 || copyMutation.isLoading,
        [selectedStores.length, copyMutation.isLoading],
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
        if (
            selectedStores.length === 0 ||
            !helpCenterId ||
            articleIds.length === 0
        ) {
            return
        }

        try {
            const cleanedShopNames = selectedStores.map((store) =>
                cleanStoreName(store.name),
            )

            await copyMutation.mutateAsync([
                undefined,
                { help_center_id: helpCenterId },
                {
                    article_ids: articleIds,
                    shop_names: cleanedShopNames,
                },
            ])

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

            // Refetch table data if duplicating to current store
            const isDuplicatingToCurrentStore = cleanedShopNames.some(
                (cleanedName) => cleanedName === shopName,
            )

            if (isDuplicatingToCurrentStore) {
                dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
            }

            setSelectedStores([])
        } catch {
            await dispatch(
                notify({
                    message: 'Failed to duplicate guidance',
                    status: NotificationStatus.Error,
                }),
            )
        }
        // copyMutation is a React Query hook with stable mutation functions
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedStores, helpCenterId, articleIds, shopName, dispatch])

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

    if (renderMode === ButtonRenderMode.Hidden) {
        return null
    }

    const multiSelect = (
        <MultiSelect<StoreSection>
            maxWidth={290}
            trigger={({ ref }) => (
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
            )}
            maxHeight={206}
            isSearchable
            isOpen={isDropdownOpen}
            onOpenChange={handleOpenChange}
            items={sections}
            onSelect={handleChange as (value: StoreSection[]) => void}
            aria-label="Duplicate guidance selection"
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
