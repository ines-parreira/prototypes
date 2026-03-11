import { useState } from 'react'

import { useShortcuts } from '@repo/utils'
import { isNumber } from 'lodash'

import {
    Avatar,
    Icon,
    StatusButton,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketUser, User } from '@gorgias/helpdesk-queries'

import { SELECT_WIDTH } from './constant'
import { UserSelectBase } from './UserSelectBase'

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
    const [isOpen, setIsOpen] = useState(false)

    const actions = {
        OPEN_USER_ASSIGNEE: {
            action: (event: Event) => {
                event.preventDefault()
                setIsOpen((prev) => !prev)
            },
        },
    }

    useShortcuts('TicketHeader', actions)

    return (
        <UserSelectBase
            value={value}
            onChange={onChange}
            isDisabled={isDisabled}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            aria-label="User selection"
            minWidth={SELECT_WIDTH}
            renderTrigger={({
                selectedText,
                isPlaceholder,
                isOpen: open,
                ref,
                usersMap,
                selectedOption,
            }) => {
                const user = isNumber(selectedOption?.id)
                    ? usersMap.get(selectedOption?.id)
                    : null
                const profilePictureUrl =
                    user?.meta && 'profile_picture_url' in user.meta
                        ? user.meta.profile_picture_url
                        : null

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
                                        open
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    size="xs"
                                />
                            }
                            className={css.trigger}
                        >
                            {isPlaceholder
                                ? 'Unassigned'
                                : (user?.name ?? selectedText)}
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
        />
    )
}
