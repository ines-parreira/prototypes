import { useCallback, useEffect, useRef } from 'react'

import { useCopilot } from '@gorgias/copilot'

import { logEvent, SegmentEvent } from '@repo/logging'

import { useCopilotPageContext } from './getCopilotPageContext'

export type CopilotOpenTrigger = 'icon' | 'shortcut' | 'deep-link'

/**
 * Returns a stable `(trigger, wasOpen) => void` that emits `CopilotOpened`
 * only on the closed → open transition. `trigger` distinguishes the open
 * vector — the icon, the ⌘G shortcut, or a `copilotConversationId` deep link
 * (open-trigger is host-only knowledge). The returned callback is stable so it
 * can be wired into long-lived handlers (the shortcut effect) without
 * re-binding.
 */
export function useTrackCopilotOpen() {
    const getPageContext = useCopilotPageContext()
    const { threadId, agent } = useCopilot()

    const stateRef = useRef({ threadId, agent })
    useEffect(() => {
        stateRef.current = { threadId, agent }
    }, [threadId, agent])

    return useCallback(
        (trigger: CopilotOpenTrigger, wasOpen: boolean) => {
            if (wasOpen) return

            const { threadId, agent } = stateRef.current
            logEvent(SegmentEvent.CopilotOpened, {
                ...getPageContext(),
                trigger,
                threadId,
                hasActiveConversation: Boolean(agent?.messages?.length),
            })
        },
        [getPageContext],
    )
}
