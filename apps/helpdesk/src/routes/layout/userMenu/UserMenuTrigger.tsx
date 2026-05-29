import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'

import { Avatar, AvatarStatusIndicator, Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { isAvailable as getIsAvailable } from 'state/currentUser/selectors'

import { UserAvatar } from '@repo/users'
import type { User } from '@gorgias/helpdesk-types'

interface UserMenuTriggerProps {
    user: User
}

export function UserMenuTrigger({ user }: UserMenuTriggerProps) {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const isAvailable = useAppSelector(getIsAvailable)

    return (
        <Button
            variant="tertiary"
            data-candu-id="navbar-user-menu"
            icon={
                isAgentUnavailabilityEnabled && user ? (
                    <UserAvatar user={user} />
                ) : (
                    <Avatar
                        name={user.name || user.email || ''}
                        status={
                            <AvatarStatusIndicator
                                color={isAvailable ? 'green' : 'orange'}
                            />
                        }
                        url={user.meta?.profile_picture_url || undefined}
                    />
                )
            }
        />
    )
}
