import type { ReactNode } from 'react'
import { useCallback, useEffect } from 'react'

import {
    Avatar,
    Icon,
    ListItem,
    ListSection,
    OverflowTooltip,
    Select,
    Text,
} from '@gorgias/axiom'
import type { TicketUser, User } from '@gorgias/helpdesk-queries'

import type { UserOption, UserSection } from '../hooks/useUserOptions'
import { NO_USER_OPTION, useUserOptions } from '../hooks/useUserOptions'
import { getUserProfilePictureURL } from '../utils/getUserProfilePictureURL'

export type UserSelectTriggerProps = {
    selectedText: string
    isPlaceholder: boolean
    isOpen: boolean
    ref?: React.RefObject<HTMLButtonElement>
    usersMap: ReturnType<typeof useUserOptions>['usersMap']
    selectedOption: ReturnType<typeof useUserOptions>['selectedOption']
}

export type UserSelectBaseProps = {
    value?: TicketUser | null
    onChange: (user: User | null) => void | Promise<void>
    isDisabled?: boolean
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    renderTrigger: (props: UserSelectTriggerProps) => ReactNode
    header?: (props: { onClear: () => void; search: string }) => ReactNode
    'aria-label'?: string
    maxHeight?: number
    minWidth?: number
    maxWidth?: number
}

export function UserSelectBase({
    value,
    onChange,
    isDisabled = false,
    isOpen,
    onOpenChange,
    renderTrigger,
    header,
    'aria-label': ariaLabel = 'User selection',
    maxHeight = 306,
    minWidth = 208,
    maxWidth = 256,
}: UserSelectBaseProps) {
    const {
        usersMap,
        userSections,
        selectedOption,
        isLoading,
        search,
        setSearch,
    } = useUserOptions({ currentAssignee: value })

    const handleChange = useCallback(
        (option: UserOption) => {
            if (option.id === NO_USER_OPTION.id) {
                onChange(null)
            } else {
                const user = usersMap.get(option.id)
                if (user) onChange(user)
            }
        },
        [usersMap, onChange],
    )

    useEffect(() => {
        if (!isOpen) setSearch('')
    }, [isOpen, setSearch])

    const handleClear = useCallback(() => {
        onChange(null)
        onOpenChange(false)
    }, [onChange, onOpenChange])

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
            minWidth={minWidth}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            aria-label={ariaLabel}
            size="sm"
            autoFocus={false}
            isVirtualized={true}
            header={header?.({ onClear: handleClear, search })}
            trigger={(args) =>
                renderTrigger({ ...args, usersMap, selectedOption })
            }
        >
            {(section: UserSection) => (
                <ListSection
                    id={section.id}
                    name={section.name}
                    items={section.items}
                >
                    {(option) => (
                        <UserListItem
                            key={option.id}
                            option={option}
                            usersMap={usersMap}
                        />
                    )}
                </ListSection>
            )}
        </Select>
    )
}

type UserListItemProps = {
    option: UserOption
    usersMap: ReturnType<typeof useUserOptions>['usersMap']
}

function UserListItem({ option, usersMap }: UserListItemProps) {
    const user =
        option.id !== NO_USER_OPTION.id ? usersMap.get(option.id) : null
    const profilePictureUrl = getUserProfilePictureURL(user ?? null)

    return (
        <ListItem
            id={option.id}
            textValue={option.label}
            label={
                <OverflowTooltip placement="right">
                    <Text size="sm" overflow="ellipsis">
                        {option.label}
                    </Text>
                </OverflowTooltip>
            }
            wrap={false}
            leadingSlot={
                user ? (
                    <Avatar
                        name={user.name || ''}
                        url={profilePictureUrl}
                        size="sm"
                    />
                ) : (
                    <Icon name="user" size="sm" />
                )
            }
        />
    )
}
