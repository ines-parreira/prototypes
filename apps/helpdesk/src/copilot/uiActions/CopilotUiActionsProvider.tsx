import { useCallback, useEffect, useRef } from 'react'

import isEqual from 'lodash/isEqual'
import { useHistory } from 'react-router-dom'
import {
    parseGorgiasCopilotUri,
    useCopilot,
    useCopilotFollowMode,
    useCopilotToolCallResult,
    useRunLifecycle,
} from '@gorgias/copilot'
import type {
    CopilotSectionId,
    CopilotToolCallResultInfo,
    GorgiasCopilotReference,
} from '@gorgias/copilot'

import { logEvent, SegmentEvent } from '@repo/logging'

import { resolveReferenceRoute } from '../reference/routes'
import { anchorCandidates } from './anchors'
import { highlightAnchor } from './highlight/highlightAnchor'
import { hasBlockingUnsavedWork } from './unsavedWorkGuard'

const SHOW_IN_APP_TOOL = 'show_in_app'

/**
 * Trailing debounce window so a multi-edit run that fires several
 * `show_in_app` results in quick succession navigates once, to the final
 * target, instead of stuttering through every intermediate edit.
 */
const NAVIGATE_DEBOUNCE_MS = 800

// Edit tools whose target has a diff view: when the agent changes a
// skill/guidance, a later `show_in_app` of that entity navigates with the diff
// search param so the merchant lands on the change instead of the whole
// document. Create tools are included too — the editor simply ignores diff
// when there is no prior version to compare against.
const DIFF_EDIT_TOOL_NAMES = [
    'create_draft_agent_skill',
    'update_draft_agent_skill',
    'create_draft_guidance',
    'update_draft_guidance',
] as const

// The skill/guidance/article editors restore their diff view from this search
// param (see `useDiffUrlSync` in the KnowledgeEditor).
const DIFF_VIEW_SEARCH = 'diff=true'

type FollowNavigationIntent = {
    target: GorgiasCopilotReference
    section?: CopilotSectionId
    reason?: string
    // The agent edited this target in the run, so open the editor's diff view.
    openDiff?: boolean
}

type DiffEditToolResult = Extract<
    CopilotToolCallResultInfo,
    { toolName: (typeof DIFF_EDIT_TOOL_NAMES)[number] }
>

function isDiffEditTool(
    info: CopilotToolCallResultInfo,
): info is DiffEditToolResult {
    return (DIFF_EDIT_TOOL_NAMES as readonly string[]).includes(info.toolName)
}

function referenceKey(reference: {
    type: string
    id: string | number
}): string {
    return `${reference.type}:${reference.id}`
}

// The SDK marks the panel root with this attribute (CopilotPanel). Focus inside
// the panel is the copilot's own composer, which a route change never disrupts.
const COPILOT_PANEL_SELECTOR = '[data-name="copilot-side-panel"]'

function isTextEntryFocused(): boolean {
    const active = document.activeElement
    if (!active) return false
    // Focus inside the copilot panel (its composer) must not block navigation:
    // follow nav moves the main app content, not the side panel, so the user's
    // place in the composer is never disrupted. Without this, the composer
    // holding focus during a run suppresses every navigation.
    if (active.closest(COPILOT_PANEL_SELECTOR)) return false
    const tag = active.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true
    return (active as HTMLElement).isContentEditable === true
}

function sameTarget(
    a: FollowNavigationIntent,
    b: FollowNavigationIntent,
): boolean {
    return a.section === b.section && isEqual(a.target, b.target)
}

/**
 * Drives the full follow-mode navigation pipeline from the SDK's public read
 * hooks: gate -> parse -> dedupe -> debounce -> navigate + highlight + log,
 * plus toggle analytics. Renders nothing.
 */
export function CopilotUiActionsProvider() {
    const history = useHistory()
    const { threadId } = useCopilot()
    const { isEnabled } = useCopilotFollowMode()

    const isMountedRef = useRef(true)
    // Mirror of `isEnabled` for reads inside captured handler closures.
    const isEnabledRef = useRef(isEnabled)
    // runIds seen starting live (post-mount) on the current thread. Tool
    // results whose runId is absent are replays and are ignored.
    const liveRunIdsRef = useRef<Set<string>>(new Set())
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    // Dedupe baseline: the last intent we acted on, reset per run.
    const lastIntentRef = useRef<FollowNavigationIntent | null>(null)
    // Intent withheld because the user was typing; re-checked at run end.
    const pendingSuppressedRef = useRef<FollowNavigationIntent | null>(null)
    // Entity keys (type:id) the agent edited in the current run; a `show_in_app`
    // of one of them opens the editor's diff view. Reset per run + thread.
    const editedTargetsRef = useRef<Set<string>>(new Set())

    const clearDebounce = useCallback(() => {
        if (debounceTimerRef.current !== null) {
            clearTimeout(debounceTimerRef.current)
            debounceTimerRef.current = null
        }
    }, [])

    const performNavigation = useCallback(
        async (intent: FollowNavigationIntent): Promise<void> => {
            if (
                lastIntentRef.current &&
                sameTarget(lastIntentRef.current, intent)
            ) {
                return
            }
            if (isTextEntryFocused()) {
                pendingSuppressedRef.current = intent
                return
            }
            lastIntentRef.current = intent
            pendingSuppressedRef.current = null

            const targetType = intent.target.type
            const section = intent.section ?? null

            if (hasBlockingUnsavedWork()) {
                logEvent(SegmentEvent.CopilotFollowNavigationPerformed, {
                    targetType,
                    section,
                    outcome: 'suppressed-unsaved-work',
                })
                return
            }

            const route = resolveReferenceRoute(intent.target)
            if (!route) {
                logEvent(SegmentEvent.CopilotFollowNavigationPerformed, {
                    targetType,
                    section,
                    outcome: 'unroutable',
                })
                return
            }

            if (history.location.pathname !== route) {
                history.push(
                    intent.openDiff ? `${route}?${DIFF_VIEW_SEARCH}` : route,
                )
            }

            const announce =
                intent.reason?.trim() || `Showing ${intent.target.type}`

            const { outcome } = highlightAnchor({
                candidates: anchorCandidates(intent.target, intent.section),
                announce,
            })

            const resolvedOutcome = await outcome

            if (!isMountedRef.current) {
                return
            }

            logEvent(SegmentEvent.CopilotFollowNavigationPerformed, {
                targetType,
                section,
                outcome: resolvedOutcome,
            })
        },
        [history],
    )

    useRunLifecycle(
        {
            onStart: ({ runId }) => {
                liveRunIdsRef.current.add(runId)
                lastIntentRef.current = null
                editedTargetsRef.current = new Set()
            },
            onComplete: () => {
                const suppressed = pendingSuppressedRef.current
                pendingSuppressedRef.current = null
                if (
                    suppressed &&
                    isEnabledRef.current &&
                    !isTextEntryFocused()
                ) {
                    void performNavigation(suppressed)
                }
            },
        },
        threadId,
    )

    useCopilotToolCallResult((info: CopilotToolCallResultInfo) => {
        // Replay guard applies to edit-tracking and navigation alike: only act
        // on results from runs that started live on this thread.
        if (!liveRunIdsRef.current.has(info.runId)) {
            return
        }

        // Remember entities the agent edits this run so a later `show_in_app`
        // of one of them opens the diff view.
        if (isDiffEditTool(info)) {
            const reference = info.result?.frontendReference
            if (reference) {
                editedTargetsRef.current.add(referenceKey(reference))
            }
            return
        }

        if (info.toolName !== SHOW_IN_APP_TOOL) return
        if (info.result === null) {
            return
        }
        if (!isEnabledRef.current) {
            return
        }

        const target = parseGorgiasCopilotUri(info.result.frontendReference.uri)
        if (!target) {
            logEvent(SegmentEvent.CopilotFollowNavigationPerformed, {
                targetType: info.result.frontendReference.type,
                section: info.result.section ?? null,
                outcome: 'unroutable',
            })
            return
        }

        const intent: FollowNavigationIntent = {
            target,
            section: info.result.section,
            reason: info.result.reason,
            openDiff: editedTargetsRef.current.has(referenceKey(target)),
        }

        clearDebounce()
        debounceTimerRef.current = setTimeout(() => {
            debounceTimerRef.current = null
            void performNavigation(intent)
        }, NAVIGATE_DEBOUNCE_MS)
    }, threadId)

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    useEffect(() => {
        isEnabledRef.current = isEnabled
    }, [isEnabled])

    // Scope the live-run set (the replay guard) to the current thread: a runId
    // that started live in one thread must not authorize a same-id result
    // replayed in another. Also drops any in-flight nav on thread switch.
    useEffect(() => {
        return () => {
            liveRunIdsRef.current = new Set()
            clearDebounce()
            lastIntentRef.current = null
            pendingSuppressedRef.current = null
            editedTargetsRef.current = new Set()
        }
    }, [threadId, clearDebounce])

    // Highest-regression-risk parity item: turning follow off must cancel a
    // debounced burst still ticking AND drop a typing-suppressed intent so
    // nothing navigates afterwards (replaces the old cross-context
    // `clearPendingNavigation`).
    useEffect(() => {
        if (!isEnabled) {
            clearDebounce()
            pendingSuppressedRef.current = null
        }
    }, [isEnabled, clearDebounce])

    const didMountRef = useRef(false)
    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true
            return
        }
        logEvent(SegmentEvent.CopilotFollowModeToggled, {
            enabled: isEnabled,
            page: history.location.pathname,
        })
        // Keyed on `isEnabled` only: the toggle analytic must fire once per
        // follow-state flip, not when the route changes underneath it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])

    return null
}
