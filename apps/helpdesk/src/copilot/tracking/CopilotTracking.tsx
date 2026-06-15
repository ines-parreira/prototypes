import { useEffect, useRef } from 'react'

import {
    useCopilot,
    useCopilotPanel,
    useRunLifecycle,
    useSuggestionLifecycle,
    useThreadLifecycle,
} from '@gorgias/copilot'

import { logEvent, SegmentEvent } from '@repo/logging'

import { useCopilotPageContext } from './getCopilotPageContext'

/**
 * Headless tracker for the global Copilot. Mounted once inside
 * `<CopilotProvider>` (alongside the cache invalidator and conversation
 * starters). Emits app-wide-contextualized Segment events for the Copilot's
 * open/close and conversation lifecycle.
 *
 * Open-trigger (`CopilotOpened`) is host-only knowledge and lives at the
 * button / shortcut call sites via `useTrackCopilotOpen`. This component
 * owns the rest:
 *
 * - `CopilotClosed` on the open → closed transition.
 * - `CopilotConversationStarted` on the first run per thread, attributed to a
 *   conversation starter when a fresh selection preceded the run, else
 *   free-text.
 * - `CopilotConversationStartersShown` when the starter pills are displayed.
 * - `CopilotThreadSwitched` when the active thread is swapped.
 */
export function CopilotTracking() {
    const { threadId } = useCopilot()
    const { isOpen } = useCopilotPanel()
    const getPageContext = useCopilotPageContext()

    const prevIsOpenRef = useRef(isOpen)
    useEffect(() => {
        const wasOpen = prevIsOpenRef.current
        prevIsOpenRef.current = isOpen
        if (wasOpen && !isOpen) {
            logEvent(SegmentEvent.CopilotClosed, { ...getPageContext() })
        }
    }, [isOpen, getPageContext])

    // A starter selection is "pending" until the next run consumes it. It
    // belongs to the empty-state it was made in, so it's invalidated when the
    // thread context changes (created/switched) — that way a click whose run
    // never started can't mislabel a later conversation. No wall-clock window.
    const pendingStarterTitleRef = useRef<string | null>(null)

    const seenThreadIdsRef = useRef<Set<string>>(new Set())
    useRunLifecycle(
        {
            onStart: (info) => {
                if (seenThreadIdsRef.current.has(info.threadId)) return
                seenThreadIdsRef.current.add(info.threadId)

                const starterTitle = pendingStarterTitleRef.current
                pendingStarterTitleRef.current = null

                logEvent(SegmentEvent.CopilotConversationStarted, {
                    ...getPageContext(),
                    threadId: info.threadId,
                    startedFrom: starterTitle
                        ? 'conversation-starter'
                        : 'free-text',
                    ...(starterTitle ? { starterTitle } : {}),
                })
            },
        },
        threadId,
    )

    useSuggestionLifecycle({
        onSuggestionsShown: (info) => {
            logEvent(SegmentEvent.CopilotConversationStartersShown, {
                ...getPageContext(),
                starterTitles: info.titles,
                starterCount: info.count,
            })
        },
        onSuggestionSelected: (info) => {
            pendingStarterTitleRef.current = info.title
        },
    })

    useThreadLifecycle({
        // A new or switched thread ends the empty-state the pending selection
        // belonged to, so drop it.
        onThreadCreated: () => {
            pendingStarterTitleRef.current = null
        },
        onThreadSwitched: (info) => {
            pendingStarterTitleRef.current = null
            logEvent(SegmentEvent.CopilotThreadSwitched, {
                ...getPageContext(),
                fromThreadId: info.fromThreadId,
                toThreadId: info.toThreadId,
            })
        },
    })

    return null
}
