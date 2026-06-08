import { useCallback, useEffect, useMemo, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    Box,
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
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useShopifyShopTags } from '../../../hooks/useShopifyShopTags'
import { useUpdateShopifyCustomerTags } from '../../../hooks/useUpdateShopifyCustomerTags'
import type { TagOption } from './shopifyTags.utils'
import {
    addTagToList,
    buildShopTagOptions,
    canCreateTag,
    deduplicateTagIds,
    parseTags,
    removeTagFromList,
    tagsToString,
} from './shopifyTags.utils'

import css from './ShopifyTags.less'

type ShopifyTagsProps = {
    tags: string | undefined
    integrationId: number | undefined
    externalId: string | undefined
    customerId: number | undefined
    ticketId?: string
}

// The Shopify GET endpoint can return the pre-mutation `tags` for up to a
// minute after our action queues. After a user edit we refuse the values
// they just changed *from* (and show what they submitted) for ~90s. Rapid
// edits accumulate into the refused set so a slow server returning any
// intermediate value still gets refused. Anything else — server catching
// up to the latest value, or a third-party Shopify edit — passes through.
type StaleRefusal = {
    refused: Set<string>
    show: string
}

function normalizeTagString(tags: string | undefined): string {
    return (tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .sort()
        .join(',')
}

export function ShopifyTags({
    tags,
    integrationId,
    externalId,
    customerId,
    ticketId,
}: ShopifyTagsProps) {
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [refusal, setRefusal] = useState<StaleRefusal | null>(null)

    const displayedTagsString = useMemo(() => {
        if (refusal && refusal.refused.has(normalizeTagString(tags))) {
            return refusal.show
        }
        return tags
    }, [tags, refusal])

    useEffect(() => {
        if (!refusal) return
        const normalized = normalizeTagString(tags)
        if (refusal.refused.has(normalized)) return
        if (normalized === normalizeTagString(refusal.show)) return
        setRefusal(null)
    }, [tags, refusal])

    useEffect(() => {
        if (!refusal) return
        const timer = setTimeout(() => setRefusal(null), Duration.seconds(90))
        return () => clearTimeout(timer)
    }, [refusal])

    const parsedTags = useMemo(
        () => parseTags(displayedTagsString),
        [displayedTagsString],
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
        {
            integrationId,
        },
    )

    const { mutate: updateTags } = useUpdateShopifyCustomerTags()

    const shopTagOptions = useMemo(
        () => buildShopTagOptions(shopTags, search),
        [shopTags, search],
    )

    const showCreateTag = canCreateTag(search, shopTags, parsedTags)

    const submit = useCallback(
        (newTagsString: string) => {
            setRefusal((prev) => ({
                refused: new Set([
                    ...(prev?.refused ?? []),
                    normalizeTagString(displayedTagsString),
                ]),
                show: newTagsString,
            }))
            updateTags({
                integrationId: integrationId!,
                userId: String(customerId!),
                externalId: externalId!,
                tagsList: newTagsString,
                ticketId,
            })
        },
        [
            displayedTagsString,
            integrationId,
            externalId,
            customerId,
            updateTags,
            ticketId,
        ],
    )

    const handleSelectChange = useCallback(
        (selectedOptions: { id: string; label: string }[]) => {
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
            submit(tagsToString(uniqueTags))
        },
        [submit, selectedTags, shopTagOptions],
    )

    const handleCreateTag = useCallback(() => {
        const newTag = search.trim()
        if (!newTag) return

        const uniqueTags = addTagToList(parsedTags, newTag)
        submit(tagsToString(uniqueTags))
        setSearch('')
    }, [search, parsedTags, submit])

    const handleCloseTag = useCallback(
        (tagToRemove: string) => {
            const updatedTags = removeTagFromList(parsedTags, tagToRemove)
            submit(tagsToString(updatedTags))
        },
        [parsedTags, submit],
    )

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSearch('')
        }
    }, [])

    if (!integrationId || !externalId || !customerId) {
        return null
    }

    return (
        <div className={css.container}>
            <OverflowList gap="xxxs" nonExpandedLineCount={2}>
                <OverflowListItem>
                    <MultiSelect
                        trigger={({ ref }) =>
                            selectedTags.length === 0 ? (
                                <Button
                                    ref={ref}
                                    leadingSlot={<Icon name="add-plus" />}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Add tags
                                </Button>
                            ) : (
                                <Button
                                    ref={ref}
                                    icon="add-plus"
                                    variant="secondary"
                                    size="sm"
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
                        aria-label="Shopify customer tags"
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
                {parsedTags.map((tag) => (
                    <OverflowListItem key={tag}>
                        <Tag
                            onClose={() => handleCloseTag(tag)}
                            aria-label="Remove tag"
                        >
                            {tag}
                        </Tag>
                    </OverflowListItem>
                ))}
                <OverflowListShowMore>
                    {({ hiddenCount }) => {
                        const safeCount = Math.min(
                            hiddenCount,
                            parsedTags.length,
                        )
                        const hiddenTags =
                            safeCount > 0
                                ? parsedTags.slice(
                                      parsedTags.length - safeCount,
                                  )
                                : []

                        return (
                            <Tooltip
                                placement="bottom"
                                trigger={
                                    <div
                                        className={css.overflowButtonContent}
                                        tabIndex={0}
                                    >
                                        <span>+{hiddenCount}</span>
                                        <Icon name="arrow-chevron-down" />
                                    </div>
                                }
                            >
                                <TooltipContent>
                                    <Box
                                        flexDirection="column"
                                        alignItems="flex-start"
                                        gap="xxxxs"
                                    >
                                        {hiddenTags.map((tag) => (
                                            <Text
                                                key={tag}
                                                size="sm"
                                                variant="bold"
                                            >
                                                {tag}
                                            </Text>
                                        ))}
                                    </Box>
                                </TooltipContent>
                            </Tooltip>
                        )
                    }}
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
