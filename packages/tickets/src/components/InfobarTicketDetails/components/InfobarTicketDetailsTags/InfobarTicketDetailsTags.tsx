import { useCallback, useMemo } from 'react'

import type { ColorValue } from '@gorgias/axiom'
import {
    Button,
    CheckBoxField,
    Dot,
    Icon,
    ListItem,
    MultiSelect,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Tag,
} from '@gorgias/axiom'
import type { TicketTag } from '@gorgias/helpdesk-queries'

import { useGetTicketData } from './hooks/useGetTicketData'
import { useListTagsSearch } from './hooks/useListTagsSearch'
import {
    sortByAscendingIdOrder,
    useUpdateTicketTags,
} from './hooks/useUpdateTicketTags'

import css from './InfobarTicketDetailsTags.less'

type InfobarTicketDetailsTagsProps = {
    ticketId: string
}

type TicketTagOption = {
    id: number
    label: string
}

export function InfobarTicketDetailsTags({
    ticketId,
}: InfobarTicketDetailsTagsProps) {
    const { updateTicketTags } = useUpdateTicketTags(ticketId)
    const { data: ticket } = useGetTicketData(ticketId)
    const {
        data: tagList,
        search,
        setSearch,
        isLoading,
        shouldLoadMore,
        onLoad,
    } = useListTagsSearch()

    const ticketTags = useMemo(
        () =>
            ticket?.data.tags.map((tag) => ({
                id: tag.id,
                label: tag.name,
            })) ?? [],
        [ticket],
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

    const handleSelectChange = useCallback(
        async (selectedOptions: TicketTagOption[]) => {
            const existingTagsIds =
                ticket?.data.tags.map((option) => option.id) ?? []

            const newTags = selectedOptions
                .filter((option) => !existingTagsIds.includes(option.id))
                .map((option) =>
                    tagList?.pages
                        .flatMap((page) => page.data.data)
                        .find((tag) => tag.id === option.id),
                ) as TicketTag[]

            if (newTags.length > 0) {
                await updateTicketTags(Number(ticketId), {
                    tags: [...newTags, ...(ticket?.data.tags ?? [])].sort(
                        sortByAscendingIdOrder,
                    ),
                })
            } else {
                // Non-visible currently saved tags shouldn't be removed from the ticket
                // since they can't have been selected for deletion
                const nonVisibleSavedTags =
                    ticket?.data.tags.filter(
                        (tag) =>
                            !tagsOptions.some((option) => option.id === tag.id),
                    ) ?? []
                const visibleSavedTags =
                    ticket?.data.tags.filter((tag) =>
                        tagsOptions.some((option) => option.id === tag.id),
                    ) ?? []

                const selectedVisibleSavedTags = visibleSavedTags.filter(
                    (tag) =>
                        selectedOptions.some((option) => option.id === tag.id),
                )

                await updateTicketTags(Number(ticketId), {
                    tags: [
                        ...nonVisibleSavedTags,
                        ...selectedVisibleSavedTags,
                    ].sort(sortByAscendingIdOrder),
                })
            }
        },
        [
            tagsOptions,
            updateTicketTags,
            ticketId,
            ticket?.data.tags,
            tagList?.pages,
        ],
    )

    const handleCloseTag = useCallback(
        (tag: TicketTag) => {
            updateTicketTags(Number(ticketId), {
                tags: ticket?.data.tags.filter((t) => t.id !== tag.id) ?? [],
            })
        },
        [updateTicketTags, ticketId, ticket?.data.tags],
    )

    return (
        <div className={css.container}>
            <OverflowList gap="xxxs" nonExpandedLineCount={2}>
                <OverflowListItem>
                    <MultiSelect
                        trigger={({ ref }) => (
                            <Button
                                ref={ref}
                                slot="button"
                                icon="add-plus"
                                variant="secondary"
                                size="sm"
                            />
                        )}
                        isSearchable={true}
                        searchValue={search}
                        onSearchChange={setSearch}
                        items={tagsOptions}
                        selectedItems={ticketTags}
                        onSelect={handleSelectChange}
                        maxHeight={256}
                        isLoading={isLoading}
                        onLoadMore={() => shouldLoadMore && onLoad()}
                        aria-label="Ticket tags selection"
                    >
                        {(option) => (
                            <ListItem
                                key={option.id}
                                label={option.label}
                                leadingSlot={({ isSelected }) => (
                                    <CheckBoxField value={isSelected} />
                                )}
                            />
                        )}
                    </MultiSelect>
                </OverflowListItem>
                {ticket?.data.tags.map((tag) => (
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
