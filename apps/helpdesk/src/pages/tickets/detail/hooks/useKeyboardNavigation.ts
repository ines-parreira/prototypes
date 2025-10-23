import { useEffect } from 'react'

import { shortcutManager } from '@repo/utils'

interface Options {
    next: () => void
    previous: () => void
}

export default function useKeyboardNavigation({ next, previous }: Options) {
    useEffect(() => {
        shortcutManager.bind('TicketDetailContainer', {
            GO_NEXT_MESSAGE: { action: next },
            GO_PREV_MESSAGE: { action: previous },
        })

        return () => {
            shortcutManager.unbind('TicketDetailContainer')
        }
    }, [next, previous])
}
