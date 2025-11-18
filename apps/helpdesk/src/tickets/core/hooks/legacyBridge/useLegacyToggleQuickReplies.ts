import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import { setShouldDisplayAllFollowUps } from 'state/ticket/actions'

/**
 * Mirroring the https://github.com/gorgias/helpdesk-web-app/blob/545de38911732e73ac4c2c4696c8f2ea0b5255a0/apps/helpdesk/src/pages/tickets/detail/components/TicketHeader.tsx#L276
 * functionality to toggle the quick replies visibility.
 * Should be removed once the quick replies data-fetching and display is migrated
 * to use the @gorgias/helpdesk-queries package.
 * Planned for MS3 https://linear.app/gorgias/issue/SUPXP-4718/update-the-ticket-quick-replies-data-fetching-and-display-logic
 */
export function useLegacyToggleQuickReplies() {
    const dispatch = useAppDispatch()

    return useCallback(
        (toggle: boolean) => {
            logEvent(SegmentEvent.SmartFollowUpsVisibilityControlClicked, {
                // Propagating the next visibility state after the toggle.
                visibility: toggle ? 'hidden' : 'visible',
            })
            dispatch(setShouldDisplayAllFollowUps(toggle))
        },
        [dispatch],
    )
}
