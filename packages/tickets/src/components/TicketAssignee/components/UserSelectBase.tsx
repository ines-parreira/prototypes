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

export type UserSelectTriggerProps = {
    selectedText: string
    isPlaceholder: boolean
    isOpen: boolean
    ref?: React.RefObject<HTMLButtonElement>
    usersMap: ReturnType<typeof useUserOptions>['usersMap']
    selectedOption: ReturnType<typeof useUserOptions>['selectedOption']
}

export type UserSelectBaseProps = {
    value: TicketUser | null
    onChange: (user: User | null) => void | Promise<void>
    isDisabled?: boolean
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    renderTrigger: (props: UserSelectTriggerProps) => ReactNode
    header?: (props: { onClear: () => void; search: string }) => ReactNode
    footer?: (props: { onClear: () => void; search: string }) => ReactNode
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
    footer,
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
        onLoad,
        shouldLoadMore,
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

    const handleOpenChange = useCallback(
        (open: boolean) => {
            onOpenChange(open)
        },
        [onOpenChange],
    )

    const handleClear = useCallback(() => {
        onChange(null)
        handleOpenChange(false)
    }, [onChange, handleOpenChange])

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
            onLoadMore={() => shouldLoadMore && onLoad()}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            aria-label={ariaLabel}
            size="sm"
            header={header?.({ onClear: handleClear, search })}
            footer={footer?.({ onClear: handleClear, search })}
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
