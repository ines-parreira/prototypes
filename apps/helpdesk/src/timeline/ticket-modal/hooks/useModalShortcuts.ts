import { useEffect } from 'react'

import { shortcutManager } from '@repo/utils'

import type { useTicketModal } from './useTicketModal'

export function useModalShortcuts({
    ticketId,
    onNext,
    onPrevious,
}: ReturnType<typeof useTicketModal>) {
    useEffect(() => {
        if (!ticketId) return

        shortcutManager.unbind('TicketDetailContainer')
        shortcutManager.bind('TimelineModal', {
            GO_NEXT: {
                action: onNext,
            },
            GO_PREVIOUS: {
                action: onPrevious,
            },
        })

        return () => {
            shortcutManager.unbind('TimelineModal')
            shortcutManager.bind('TicketDetailContainer')
        }
    }, [onNext, onPrevious, ticketId])
}
