import { useCallback, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import { MenuItem, MenuSection, SubMenu, Text } from '@gorgias/axiom'
import type { TicketTag } from '@gorgias/helpdesk-queries'

import { useCreateTicketTag } from '../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag'
import { useListTagsSearch } from '../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch'
import { useTicketsLegacyBridge } from '../../../utils/LegacyBridge'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'

type Props = {
    isEnabled: boolean
    renderOverflowLabel: (label: string) => ReactNode
    onAddTag: (tag: TicketTag) => void | Promise<void>
}

export function AddTagSubMenu({
    isEnabled,
    renderOverflowLabel,
    onAddTag,
}: Props) {
    const { dispatchNotification } = useTicketsLegacyBridge()
    const { createTicketTag, isCreating } = useCreateTicketTag()
    const {
        data: tagList,
        search,
        setSearch,
        isLoading,
        shouldLoadMore,
        onLoad,
    } = useListTagsSearch({ enabled: isEnabled })

    const tags = useMemo(
        () => tagList?.pages.flatMap((page) => page.data.data) ?? [],
        [tagList],
    )

    const normalizedSearch = search.trim().toLowerCase()

    const canCreateTag = normalizedSearch !== ''
    const hasExactMatch = useMemo(
        () =>
            tags.some(
                (tag) => tag.name.trim().toLowerCase() === normalizedSearch,
            ),
        [normalizedSearch, tags],
    )

    useEffect(() => {
        if (!isEnabled) {
            setSearch('')
        }
    }, [isEnabled, setSearch])

    const handleAddExistingTag = useCallback(
        async (tag: TicketTag) => {
            await onAddTag(tag)
            setSearch('')
        },
        [onAddTag, setSearch],
    )

    const handleCreateTag = useCallback(async () => {
        if (!canCreateTag || hasExactMatch) {
            return
        }

        try {
            const createdTag = await createTicketTag(search.trim())
            await onAddTag(createdTag)
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
        onAddTag,
        search,
        setSearch,
    ])

    return (
        <SubMenu
            id="add-tag"
            label="Add tag"
            maxHeight={256}
            maxWidth={256}
            isSearchable
            searchValue={search}
            onSearchChange={setSearch}
            isLoading={isLoading || isCreating}
            onLoadMore={shouldLoadMore ? onLoad : undefined}
        >
            <MenuSection id="existing-tags" aria-label="Existing tags">
                {tags.length === 0 && normalizedSearch !== '' ? (
                    <MenuItem
                        id="no-results"
                        label="No results found"
                        isDisabled
                    />
                ) : (
                    tags.map((tag) => (
                        <MenuItem
                            key={tag.id}
                            id={`add-tag-${tag.id}`}
                            label={renderOverflowLabel(tag.name)}
                            textValue={tag.name}
                            onAction={() => void handleAddExistingTag(tag)}
                        />
                    ))
                )}
            </MenuSection>
            {canCreateTag && !hasExactMatch ? (
                <MenuSection id="create-tag-section" aria-label="Create tag">
                    <MenuItem
                        id="create-tag"
                        isDisabled={isCreating}
                        label={
                            <>
                                <Text as="span" size="sm" variant="bold">
                                    Create tag:
                                </Text>{' '}
                                <Text as="span" size="sm">
                                    {search.trim()}
                                </Text>
                            </>
                        }
                        textValue={`Create tag ${search.trim()}`}
                        onAction={() => void handleCreateTag()}
                    />
                </MenuSection>
            ) : null}
        </SubMenu>
    )
}
