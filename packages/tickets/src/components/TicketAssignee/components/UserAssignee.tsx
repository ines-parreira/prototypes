import { useCallback } from 'react'

import { isNumber } from 'lodash'

import {
    Avatar,
    Icon,
    ListItem,
    ListSection,
    Select,
    StatusButton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketUser } from '@gorgias/helpdesk-queries'

import { useUpdateTicketUser } from '../hooks/useUpdateTicketUser'
import type { UserOption, UserSection } from '../hooks/useUserOptions'
import { NO_USER_OPTION, useUserOptions } from '../hooks/useUserOptions'

import css from './SelectStyles.less'

type Props = {
    ticketId: number
    currentAssignee: TicketUser | null
}

export function UserAssignee({ ticketId, currentAssignee }: Props) {
    const { updateTicketUser, isLoading: isUpdatingUser } =
        useUpdateTicketUser(ticketId)

    const {
        usersMap,
        userSections,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    } = useUserOptions({ currentAssignee })

    const handleChange = useCallback(
        async (option: UserOption) => {
            if (option.id === NO_USER_OPTION.id) {
                await updateTicketUser(null)
            } else {
                const user = usersMap.get(option.id)
                if (user) {
                    await updateTicketUser(user)
                }
            }
        },
        [usersMap, updateTicketUser],
    )

    const clearSearch = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                setSearch('')
            }
        },
        [setSearch],
    )

    return (
        <Select
            placeholder="Unassigned"
            items={userSections}
            isSearchable={true}
            searchValue={search}
            onSearchChange={setSearch}
            // @ts-expect-error - the generic expects a UserSection
            selectedItem={selectedOption}
            // @ts-expect-error - the generic expects a UserSection handler
            onSelect={handleChange}
            isLoading={isLoading}
            isDisabled={isUpdatingUser || isLoading}
            minWidth={210}
            maxWidth={210}
            maxHeight={306}
            onLoadMore={() => shouldLoadMore && onLoad()}
            onOpenChange={clearSearch}
            aria-label="User selection"
            size="sm"
            autoFocus={false}
            trigger={({ selectedText, isPlaceholder, isOpen, ref }) => {
                const user = isNumber(selectedOption?.id)
                    ? usersMap.get(selectedOption?.id)
                    : null
                const profilePictureUrl =
                    user?.meta && 'profile_picture_url' in user.meta
                        ? user.meta.profile_picture_url
                        : null

                const label = user ? user.name : selectedText

                return (
                    <Tooltip placement="bottom">
                        <StatusButton
                            ref={ref}
                            leadingSlot={
                                user ? (
                                    <div>
                                        <Avatar
                                            name={user.name || ''}
                                            url={profilePictureUrl ?? undefined}
                                            size="sm"
                                        />
                                    </div>
                                ) : (
                                    <Icon name="user" size="sm" />
                                )
                            }
                            trailingSlot={
                                <Icon
                                    name={
                                        isOpen
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    size="xs"
                                />
                            }
                            className={css.trigger}
                        >
                            {isPlaceholder ? 'Unassigned' : label}
                        </StatusButton>
                        <TooltipContent
                            title={
                                isPlaceholder
                                    ? 'Assign agent'
                                    : 'Assigned agent'
                            }
                        />
                    </Tooltip>
                )
            }}
        >
            {(section: UserSection) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(option) => {
                        const user =
                            option.id !== NO_USER_OPTION.id
                                ? usersMap.get(option.id)
                                : null
                        const profilePictureUrl =
                            user?.meta && 'profile_picture_url' in user.meta
                                ? user.meta.profile_picture_url
                                : undefined

                        return (
                            <ListItem
                                key={option.id}
                                textValue={option.label}
                                label={option.label}
                                leadingSlot={
                                    user ? (
                                        <Avatar
                                            name={user.name || ''}
                                            url={profilePictureUrl ?? undefined}
                                            size="sm"
                                        />
                                    ) : (
                                        <Icon name="user" size="sm" />
                                    )
                                }
                            />
                        )
                    }}
                </ListSection>
            )}
        </Select>
    )
}
