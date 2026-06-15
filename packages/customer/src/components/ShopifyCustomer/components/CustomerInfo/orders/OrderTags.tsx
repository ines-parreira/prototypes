import { useCallback, useEffect, useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useDebouncedCallback } from '@gorgias/toolkit-react'

import {
    Button,
    Icon,
    ListFooter,
    MultiSelect,
    MultiSelectItem,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    OverflowTooltip,
    Tag,
    Text,
} from '@gorgias/axiom'

import { useShopifyShopTags } from '../../../hooks/useShopifyShopTags'
import { useUpdateShopifyOrderTags } from '../../../hooks/useUpdateShopifyOrderTags'
import type { TagOption } from '../tags/shopifyTags.utils'
import {
    addTagToList,
    buildShopTagOptions,
    canCreateTag,
    deduplicateTagIds,
    parseTags,
    removeTagFromList,
    tagsToString,
} from '../tags/shopifyTags.utils'

import css from '../tags/ShopifyTags.less'

type OrderTagsProps = {
    tags: string | undefined
    integrationId: number | undefined
    orderId: number | string | undefined
    ticketId?: string
    readOnly?: boolean
}

export function OrderTags({
    tags,
    integrationId,
    orderId,
    ticketId,
    readOnly = false,
}: OrderTagsProps) {
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [localTagsString, setLocalTagsString] = useState<string | undefined>(
        tags,
    )

    useEffect(() => {
        setLocalTagsString(tags)
    }, [tags])

    const parsedTags = useMemo(
        () => parseTags(localTagsString),
        [localTagsString],
    )

    const selectedTags: TagOption[] = useMemo(
        () =>
            parsedTags.map((tag) => ({
                id: tag,
                label: tag,
            })),
        [parsedTags],
    )

    const { data: shopTags, isLoading: isLoadingShopTags } = useShopifyShopTags(
        { integrationId, tagsType: 'orders' },
    )

    const { mutate: updateTags, isLoading } = useUpdateShopifyOrderTags()

    const shopTagOptions = useMemo(
        () => buildShopTagOptions(shopTags, search),
        [shopTags, search],
    )

    const showCreateTag = canCreateTag(search, shopTags, parsedTags)

    const debouncedUpdateTags = useDebouncedCallback(
        updateTags,
        Duration.millis(300),
    )

    const handleSelectChange = useCallback(
        (selectedOptions: { id: string; label: string }[]) => {
            if (!integrationId || orderId === undefined || isLoading) return

            const visibleOptionIds = new Set(
                shopTagOptions.map((opt) => opt.id),
            )
            const hiddenSelected = selectedTags.filter(
                (tag) => !visibleOptionIds.has(tag.id),
            )
            const uniqueTags = deduplicateTagIds([
                ...hiddenSelected,
                ...selectedOptions,
            ])
            const tagsList = tagsToString(uniqueTags)

            setLocalTagsString(tagsList)
            debouncedUpdateTags({
                integrationId,
                orderId,
                tagsList,
                ticketId,
            })
        },
        [
            integrationId,
            orderId,
            isLoading,
            debouncedUpdateTags,
            ticketId,
            selectedTags,
            shopTagOptions,
        ],
    )

    const handleCreateTag = useCallback(() => {
        if (!integrationId || orderId === undefined || isLoading) return

        const newTag = search.trim()
        if (!newTag) return

        const uniqueTags = addTagToList(parsedTags, newTag)
        const tagsList = tagsToString(uniqueTags)

        setLocalTagsString(tagsList)
        debouncedUpdateTags({
            integrationId,
            orderId,
            tagsList,
            ticketId,
        })
        setSearch('')
    }, [
        search,
        parsedTags,
        integrationId,
        orderId,
        isLoading,
        debouncedUpdateTags,
        ticketId,
    ])

    const handleCloseTag = useCallback(
        (tagToRemove: string) => {
            if (!integrationId || orderId === undefined || isLoading) return

            const updatedTags = removeTagFromList(parsedTags, tagToRemove)
            const tagsList = tagsToString(updatedTags)

            setLocalTagsString(tagsList)
            debouncedUpdateTags({
                integrationId,
                orderId,
                tagsList,
                ticketId,
            })
        },
        [
            integrationId,
            orderId,
            isLoading,
            parsedTags,
            debouncedUpdateTags,
            ticketId,
        ],
    )

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSearch('')
        }
    }, [])

    if (!integrationId || orderId === undefined) {
        return null
    }

    if (readOnly && parsedTags.length === 0) {
        return null
    }

    return (
        <div className={css.container}>
            <OverflowList gap="xxxs" nonExpandedLineCount={2}>
                {!readOnly && (
                    <OverflowListItem>
                        <MultiSelect
                            trigger={({ ref }) =>
                                selectedTags.length === 0 ? (
                                    <Button
                                        ref={ref}
                                        leadingSlot={<Icon name="add-plus" />}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            handleOpenChange(!isOpen)
                                        }
                                    >
                                        Add tags
                                    </Button>
                                ) : (
                                    <Button
                                        ref={ref}
                                        icon="add-plus"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            handleOpenChange(!isOpen)
                                        }
                                    />
                                )
                            }
                            isOpen={isOpen}
                            onOpenChange={handleOpenChange}
                            isSearchable
                            searchValue={search}
                            onSearchChange={setSearch}
                            items={shopTagOptions}
                            selectedItems={selectedTags}
                            onSelect={handleSelectChange}
                            minWidth={256}
                            maxWidth={256}
                            maxHeight={256}
                            isLoading={isLoadingShopTags}
                            aria-label="Shopify order tags"
                            footer={
                                showCreateTag ? (
                                    <ListFooter>
                                        <Button
                                            size="sm"
                                            variant="tertiary"
                                            onClick={handleCreateTag}
                                        >
                                            <Text variant="bold" size="sm">
                                                Create tag:
                                            </Text>
                                            {` `}
                                            <Text variant="regular" size="sm">
                                                {search}
                                            </Text>
                                        </Button>
                                    </ListFooter>
                                ) : undefined
                            }
                        >
                            {(option) => (
                                <MultiSelectItem
                                    key={option.id}
                                    textValue={option.label}
                                    label={
                                        <OverflowTooltip placement="right">
                                            <Text overflow="ellipsis">
                                                {option.label}
                                            </Text>
                                        </OverflowTooltip>
                                    }
                                    wrap={false}
                                />
                            )}
                        </MultiSelect>
                    </OverflowListItem>
                )}
                {parsedTags.map((tag) => (
                    <OverflowListItem key={tag}>
                        <Tag
                            color={hasNewOrdersSidebar ? 'grey' : undefined}
                            onClose={
                                readOnly ? undefined : () => handleCloseTag(tag)
                            }
                            aria-label={readOnly ? tag : 'Remove tag'}
                        >
                            {tag}
                        </Tag>
                    </OverflowListItem>
                ))}
                <OverflowListShowMore>
                    {({ hiddenCount }) => (
                        <div className={css.overflowButtonContent}>
                            <span>+{hiddenCount}</span>
                            <Icon name="arrow-chevron-down" />
                        </div>
                    )}
                </OverflowListShowMore>
                <OverflowListShowLess>
                    <div className={css.overflowButtonContent}>
                        <span>Show less</span>
                        <Icon name="arrow-chevron-up" />
                    </div>
                </OverflowListShowLess>
            </OverflowList>
        </div>
    )
}
