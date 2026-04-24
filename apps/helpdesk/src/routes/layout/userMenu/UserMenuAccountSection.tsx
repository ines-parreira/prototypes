import {
    ActivityEvents,
    clearActivityTrackerSession,
    logActivityEvent,
    unregisterAppActivityTrackerHooks,
} from '@repo/activity-tracker'
import { logEvent, SegmentEvent } from '@repo/logging'

import { MenuItem, MenuSection } from '@gorgias/axiom'

interface UserMenuAccountSectionProps {
    userEmail?: string
    userRole?: string
}

export function UserMenuAccountSection({
    userEmail,
    userRole,
}: UserMenuAccountSectionProps) {
    return (
        <MenuSection id="account">
            <MenuItem
                id="logout"
                intent="destructive"
                leadingSlot="exit"
                label="Sign out"
                onAction={() => {
                    logEvent(SegmentEvent.MenuUserLinkClicked, {
                        link: 'log-out',
                        user_email: userEmail,
                        user_role: userRole,
                    })
                    logActivityEvent(ActivityEvents.UserClosedApp)
                    void unregisterAppActivityTrackerHooks()
                    void clearActivityTrackerSession()
                    window.location.href = `/logout?csrf-token=${window.CSRF_TOKEN}`
                }}
            />
        </MenuSection>
    )
}
