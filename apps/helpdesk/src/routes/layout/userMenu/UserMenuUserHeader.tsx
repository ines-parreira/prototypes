import {
    useAgentPhoneStatus,
    useCustomAgentUnavailableStatusesFlag,
    UserInfoHeaderContainer,
} from '@repo/agent-status'
import { logEvent, SegmentEvent } from '@repo/logging'
import { Link } from 'react-router-dom'

import { MenuItem, MenuSection } from '@gorgias/axiom'

interface UserMenuUserHeaderProps {
    userId: number
    userEmail?: string
    userRole?: string
}

export function UserMenuUserHeader({
    userId,
    userEmail,
    userRole,
}: UserMenuUserHeaderProps) {
    const isAgentUnavailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    const { agentPhoneUnavailabilityStatus } = useAgentPhoneStatus({ userId })

    if (!isAgentUnavailabilityEnabled) return null

    return (
        <MenuSection id="user-header">
            <MenuItem
                as={Link}
                to="/app/settings/profile"
                onAction={() => {
                    logEvent(SegmentEvent.MenuUserLinkClicked, {
                        link: 'your-profile',
                        user_email: userEmail,
                        user_role: userRole,
                    })
                }}
                label={
                    <UserInfoHeaderContainer
                        agentPhoneUnavailabilityStatus={
                            agentPhoneUnavailabilityStatus
                        }
                    />
                }
            />
        </MenuSection>
    )
}
