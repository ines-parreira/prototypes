import { useCallback, useMemo, useState } from 'react'

import { shortcutManager, useShortcuts } from '@repo/utils'

import type { ColorValue } from '@gorgias/axiom'
import {
    Button,
    Dot,
    Icon,
    ListFooter,
    MultiSelect,
    MultiSelectItem,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowTooltip,
    Tag,
    Text,
} from '@gorgias/axiom'
import type { TicketTag } from '@gorgias/helpdesk-queries'

import { useTicketsLegacyBridge } from '../../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../../utils/LegacyBridge/context'
import { useCreateTicketTag } from './hooks/useCreateTicketTag'
import { useListTagsSearch } from './hooks/useListTagsSearch'
import { sortByAlphabeticalTagNameOrder } from './hooks/useUpdateTicketTags'
import { TagsMultiSelectShowMore } from './TagsMultiSelectShowMore'

import css from './TagsMultiSelect.less'

export type TagsMultiSelectProps = {
    value: TicketTag[]
    onChange: (tags: TicketTag[]) => void | Promise<void>
    'aria-label'?: string
}

type TicketTagOption = {
    id: number
    label: string
}

export function TagsMultiSelect({
    value,
    onChange,
    'aria-label': ariaLabel = 'Tags selection',
}: TagsMultiSelectProps) {
    const [isTagMenuOpen, setIsTagMenuOpen] = useState(false)
    const { dispatchNotification } = useTicketsLegacyBridge()
    const { createTicketTag, isCreating } = useCreateTicketTag()
    const {
        data: tagList,
        search,
        setSearch,
        isLoading,
        shouldLoadMore,
        onLoad,
    } = useListTagsSearch()

    const selectedTags = useMemo(
        () =>
            value.map((tag) => ({
                id: tag.id,
                label: tag.name,
            })),
        [value],
    )

    const tagsOptions = useMemo(
        () =>
            tagList?.pages
                .flatMap((page) => page.data.data)
                .map((tag) => ({
                    id: tag.id,
                    label: tag.name,
                })) ?? [],
        [tagList],
    )

    const canCreateTag = search.trim() !== ''

    const handleCreateTag = useCallback(async () => {
        try {
            const createdTag = await createTicketTag(search.trim())
            onChange(
                [...value, createdTag].sort(sortByAlphabeticalTagNameOrder),
            )
            setSearch('')
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to create new tag',
            })
        }
    }, [
        createTicketTag,
        search,
        dispatchNotification,
        onChange,
        value,
        setSearch,
    ])

    const handleSelectChange = useCallback(
        (selectedOptions: TicketTagOption[]) => {
            const existingTagsIds = value.map((tag) => tag.id)

            const newTags = selectedOptions
                .filter((option) => !existingTagsIds.includes(option.id))
                .map((option) =>
                    tagList?.pages
                        .flatMap((page) => page.data.data)
                        .find((tag) => tag.id === option.id),
                ) as TicketTag[]

            if (newTags.length > 0) {
                onChange(
                    [...newTags, ...value].sort(sortByAlphabeticalTagNameOrder),
                )
            } else {
                // Non-visible currently saved tags shouldn't be removed
                // since they can't have been selected for deletion
                const nonVisibleSavedTags = value.filter(
                    (tag) =>
                        !tagsOptions.some((option) => option.id === tag.id),
                )
                const visibleSavedTags = value.filter((tag) =>
                    tagsOptions.some((option) => option.id === tag.id),
                )

                const selectedVisibleSavedTags = visibleSavedTags.filter(
                    (tag) =>
                        selectedOptions.some((option) => option.id === tag.id),
                )

                onChange(
                    [...nonVisibleSavedTags, ...selectedVisibleSavedTags].sort(
                        sortByAlphabeticalTagNameOrder,
                    ),
                )
            }
        },
        [tagsOptions, onChange, value, tagList?.pages],
    )

    const handleCloseTag = useCallback(
        (tag: TicketTag) => {
            onChange(value.filter((t) => t.id !== tag.id))
        },
        [onChange, value],
    )

    const handleTagMenuOpenChange = useCallback(
        (open: boolean) => {
            setIsTagMenuOpen(open)
            if (open) {
                shortcutManager.denylist(['TicketHeader'])
            } else {
                shortcutManager.clear(['TicketHeader'])
                setSearch('')
            }
        },
        [setSearch],
    )

    const actions = {
        OPEN_TAGS: {
            action: (e: Event) => {
                e.preventDefault()
                handleTagMenuOpenChange(!isTagMenuOpen)
            },
        },
    }

    useShortcuts('InfobarTicketTags', actions)

    const sortedTags = useMemo(
        () => [...value].sort(sortByAlphabeticalTagNameOrder),
        [value],
    )
    return (
        <div className={css.container}>
            <OverflowList gap="xxxs" nonExpandedLineCount={2}>
                <OverflowListItem>
                    <MultiSelect
                        trigger={({ ref }) => (
                            <>
                                {selectedTags.length === 0 ? (
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
                                )}
                            </>
                        )}
                        isOpen={isTagMenuOpen}
                        onOpenChange={handleTagMenuOpenChange}
                        isSearchable={true}
                        searchValue={search}
                        onSearchChange={setSearch}
                        items={tagsOptions}
                        selectedItems={selectedTags}
                        onSelect={handleSelectChange}
                        minWidth={256}
                        maxWidth={256}
                        maxHeight={256}
                        isLoading={isLoading}
                        onLoadMore={() => shouldLoadMore && onLoad()}
                        aria-label={ariaLabel}
                        footer={
                            canCreateTag ? (
                                <ListFooter>
                                    <Button
                                        size="sm"
                                        variant="tertiary"
                                        onClick={handleCreateTag}
                                        isLoading={isCreating}
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
                {sortedTags.map((tag) => (
                    <OverflowListItem key={tag.id}>
                        <Tag
                            onClose={() => handleCloseTag(tag)}
                            aria-label="Remove tag"
                            {...(tag.decoration?.color && {
                                leadingSlot: (
                                    <Dot
                                        color={
                                            tag.decoration?.color as ColorValue
                                        }
                                    />
                                ),
                            })}
                        >
                            {tag.name}
                        </Tag>
                    </OverflowListItem>
                ))}
                <TagsMultiSelectShowMore value={sortedTags} />
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
