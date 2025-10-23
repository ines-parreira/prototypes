import { useCallback } from 'react'

import { isNumber } from 'lodash'

import {
    Avatar,
    Icon,
    ListItem,
    ListSection,
    LoadingSpinner,
    NewTag,
    Select,
} from '@gorgias/axiom'
import { TicketUser } from '@gorgias/helpdesk-queries'

import { useUpdateTicketUser } from '../hooks/useUpdateTicketUser'
import {
    NO_USER_OPTION,
    UserOption,
    UserSection,
    useUserOptions,
} from '../hooks/useUserOptions'

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
            maxHeight={306}
            onLoadMore={() => shouldLoadMore && onLoad()}
            aria-label="User selection"
            trigger={({ selectedText, isPlaceholder, isOpen }) => {
                const user = isNumber(selectedOption?.id)
                    ? usersMap.get(selectedOption?.id)
                    : null
                const profilePictureUrl =
                    user?.meta && 'profile_picture_url' in user.meta
                        ? user.meta.profile_picture_url
                        : null

                return (
                    <NewTag
                        leadingSlot={
                            isUpdatingUser || isLoading ? (
                                <LoadingSpinner size={16} />
                            ) : user ? (
                                <Avatar
                                    name={user.name || ''}
                                    url={profilePictureUrl ?? undefined}
                                    size={'xs'}
                                    shape="circle"
                                />
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
                    >
                        {isPlaceholder ? 'Unassigned' : selectedText}
                    </NewTag>
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
                                            size={'xs'}
                                            shape="circle"
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
