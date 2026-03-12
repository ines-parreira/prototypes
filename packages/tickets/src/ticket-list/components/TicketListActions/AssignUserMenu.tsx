import { useState } from 'react'

import {
    Button,
    Icon,
    ListHeader,
    ListHeaderItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketUser, User } from '@gorgias/helpdesk-queries'

import { UserSelectBase } from '../../../components/TicketAssignee/components/UserSelectBase'

type AssignableUser = User & {
    id: NonNullable<User['id']>
    name: NonNullable<User['name']>
}

type Props = {
    value: TicketUser | null
    isDisabled: boolean
    onAssignUser: (user: AssignableUser | null) => void
}

export function AssignUserMenu({ value, isDisabled, onAssignUser }: Props) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <UserSelectBase
            value={value}
            onChange={(user) => onAssignUser(user as AssignableUser | null)}
            isDisabled={isDisabled}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            aria-label="Assign agent"
            header={({ onClear, search }) =>
                !search && (
                    <ListHeader>
                        <ListHeaderItem
                            label="Unassigned"
                            leadingSlot={<Icon name="user" size="sm" />}
                            onClick={onClear}
                        />
                    </ListHeader>
                )
            }
            renderTrigger={({ ref }) => (
                <Tooltip
                    trigger={
                        <Button
                            ref={ref}
                            variant="tertiary"
                            size="sm"
                            icon="user"
                            aria-label="Assign agent"
                            isDisabled={isDisabled}
                        />
                    }
                >
                    <TooltipContent
                        title={
                            isDisabled
                                ? 'Select one or more tickets to assign an agent'
                                : 'Assign agent'
                        }
                    />
                </Tooltip>
            )}
        />
    )
}
