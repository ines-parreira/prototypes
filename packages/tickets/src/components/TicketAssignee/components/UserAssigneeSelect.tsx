import { useCallback, useState } from 'react'

import { useShortcuts } from '@repo/utils'
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
import type { TicketUser, User } from '@gorgias/helpdesk-queries'

import type { UserOption, UserSection } from '../hooks/useUserOptions'
import { NO_USER_OPTION, useUserOptions } from '../hooks/useUserOptions'
import { SELECT_WIDTH } from './constant'

import css from './SelectStyles.less'

export type UserAssigneeSelectProps = {
    value: TicketUser | null
    onChange: (user: User | null) => void | Promise<void>
    isDisabled?: boolean
}

export function UserAssigneeSelect({
    value,
    onChange,
    isDisabled = false,
}: UserAssigneeSelectProps) {
    const [isUserAssigneeOpen, setIsUserAssigneeOpen] = useState(false)
    const {
        usersMap,
        userSections,
        selectedOption,
        isLoading,
        search,
        setSearch,
        onLoad,
        shouldLoadMore,
    } = useUserOptions({ currentAssignee: value })

    const handleChange = useCallback(
        (option: UserOption) => {
            if (option.id === NO_USER_OPTION.id) {
                onChange(null)
            } else {
                const user = usersMap.get(option.id)
                if (user) {
                    onChange(user)
                }
            }
        },
        [usersMap, onChange],
    )

    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            setIsUserAssigneeOpen(isOpen)
            if (!isOpen) {
                setSearch('')
            }
        },
        [setIsUserAssigneeOpen, setSearch],
    )

    const actions = {
        OPEN_USER_ASSIGNEE: {
            action: (event: Event) => {
                event.preventDefault()
                handleOpenChange(!isUserAssigneeOpen)
            },
        },
    }

    useShortcuts('TicketHeader', actions)

    return (
        <Select
            placeholder="Unassigned"
            items={userSections}
            isSearchable={true}
            searchValue={search}
            onSearchChange={setSearch}
            selectedItem={selectedOption}
            onSelect={handleChange}
            isLoading={isLoading}
            isDisabled={isDisabled || isLoading}
            minWidth={SELECT_WIDTH}
            maxWidth={SELECT_WIDTH}
            maxHeight={306}
            onLoadMore={() => shouldLoadMore && onLoad()}
            isOpen={isUserAssigneeOpen}
            onOpenChange={handleOpenChange}
            aria-label="User selection"
            size="sm"
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
