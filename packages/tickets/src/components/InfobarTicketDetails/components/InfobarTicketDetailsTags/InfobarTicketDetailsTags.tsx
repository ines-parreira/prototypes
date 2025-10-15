import { useCallback, useMemo } from 'react'

import {
    Button,
    CheckBoxField,
    Dot,
    ListItem,
    MultiSelect,
    NewTag,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'
import { TicketTag } from '@gorgias/helpdesk-queries'

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
            <OverflowList nonExpandedLineCount={2}>
                <OverflowListItem index={0} className={css.listButton}>
                    <MultiSelect
                        trigger={() => (
                            <Button
                                icon="add-plus"
                                intent="secondary"
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
                {ticket?.data.tags.map((tag, index) => (
                    <OverflowListItem
                        key={tag.id}
                        index={index + 1}
                        className={css.listItem}
                    >
                        <NewTag
                            onClose={() => handleCloseTag(tag)}
                            {...(tag.decoration?.color && {
                                leadingSlot: (
                                    <Dot color={tag.decoration?.color} />
                                ),
                            })}
                        >
                            {tag.name}
                        </NewTag>
                    </OverflowListItem>
                ))}
                <OverflowListShowMore>
                    {({ hiddenCount }) => `+ ${hiddenCount}`}
                </OverflowListShowMore>
                <OverflowListShowLess />
            </OverflowList>
        </div>
    )
}
