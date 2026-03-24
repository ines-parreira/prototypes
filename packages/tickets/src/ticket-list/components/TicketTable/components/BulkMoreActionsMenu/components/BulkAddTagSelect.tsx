import { useCallback, useMemo, useState } from 'react'

import {
    Button,
    Icon,
    ListFooter,
    ListItem,
    Select,
    StatusButton,
    Text,
} from '@gorgias/axiom'
import type { TicketTag } from '@gorgias/helpdesk-queries'

import { useCreateTicketTag } from '../../../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag'
import { useListTagsSearch } from '../../../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch'
import { useTicketsLegacyBridge } from '../../../../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../../../../utils/LegacyBridge/context'

import css from '../../../../../../components/TicketAssignee/components/SelectStyles.less'

type TagOption = {
    id: number
    label: string
}

type BulkAddTagSelectProps = {
    onChange: (tag: TicketTag) => void | Promise<void>
    isDisabled?: boolean
}

export function BulkAddTagSelect({
    onChange,
    isDisabled = false,
}: BulkAddTagSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { dispatchNotification } = useTicketsLegacyBridge()
    const { createTicketTag, isCreating } = useCreateTicketTag()
    const { tags, search, setSearch, isLoading, shouldLoadMore, onLoad } =
        useListTagsSearch()

    const tagOptions = useMemo(
        () =>
            tags?.map((tag) => ({
                id: tag.id,
                label: tag.name,
            })) ?? [],
        [tags],
    )
    const normalizedSearch = search.trim().toLowerCase()
    const canCreateTag = normalizedSearch !== ''
    const hasExactMatch = useMemo(
        () =>
            tagOptions.some(
                (tag) => tag.label.trim().toLowerCase() === normalizedSearch,
            ),
        [normalizedSearch, tagOptions],
    )

    const handleSelect = useCallback(
        async (option: TagOption) => {
            const tag = tags?.find((item) => item.id === option.id)
            if (!tag) return

            await onChange(tag)
            setSearch('')
        },
        [onChange, setSearch, tags],
    )

    const handleCreateTag = useCallback(async () => {
        if (!canCreateTag || hasExactMatch) return

        try {
            const createdTag = await createTicketTag(search.trim())
            await onChange(createdTag)
            setSearch('')
        } catch {
            dispatchNotification({
                status: NotificationStatus.Error,
                message: 'Failed to create new tag',
            })
        }
    }, [
        canCreateTag,
        createTicketTag,
        dispatchNotification,
        hasExactMatch,
        onChange,
        search,
        setSearch,
    ])

    const handleOpenChange = useCallback(
        (open: boolean) => {
            setIsOpen(open)
            if (!open) {
                setSearch('')
            }
        },
        [setSearch],
    )

    return (
        <Select<TagOption>
            placeholder="Add tag"
            items={tagOptions}
            isSearchable
            searchValue={search}
            onSearchChange={setSearch}
            selectedItem={null}
            onSelect={(option) => void handleSelect(option)}
            isLoading={isLoading || isCreating}
            isDisabled={isDisabled}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            aria-label="Add tag"
            minWidth={256}
            maxWidth={256}
            maxHeight={256}
            onLoadMore={() => shouldLoadMore && onLoad()}
            size="sm"
            footer={
                canCreateTag && !hasExactMatch ? (
                    <ListFooter>
                        <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => void handleCreateTag()}
                            isLoading={isCreating}
                        >
                            <Text variant="bold" size="sm">
                                Create tag:
                            </Text>{' '}
                            <Text variant="regular" size="sm">
                                {search.trim()}
                            </Text>
                        </Button>
                    </ListFooter>
                ) : undefined
            }
            trigger={({ ref, isOpen: open }) => (
                <StatusButton
                    ref={ref}
                    trailingSlot={
                        <Icon
                            name={
                                open ? 'arrow-chevron-up' : 'arrow-chevron-down'
                            }
                            size="xs"
                        />
                    }
                    className={css.trigger}
                >
                    <Text as="span" size="sm" variant="bold">
                        Add tag
                    </Text>
                </StatusButton>
            )}
        >
            {(option) => (
                <ListItem
                    key={option.id}
                    textValue={option.label}
                    label={option.label}
                />
            )}
        </Select>
    )
}
