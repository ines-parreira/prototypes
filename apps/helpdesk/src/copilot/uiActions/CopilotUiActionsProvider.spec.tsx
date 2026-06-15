import { logEvent, SegmentEvent } from '@repo/logging'
import { act, render } from '@repo/testing'

import { resolveReferenceRoute } from '../reference/routes'
import { highlightAnchor } from './highlight/highlightAnchor'
import { hasBlockingUnsavedWork } from './unsavedWorkGuard'

import { CopilotUiActionsProvider } from './CopilotUiActionsProvider'

type RunCallbacks = {
    onStart: (info: { runId: string }) => void
    onComplete: (info?: unknown) => void
}

let capturedRunCallbacks: RunCallbacks
let capturedToolResultHandler: (info: ToolResultInfo) => void

let followEnabled = true
let parseResult: unknown = {
    type: 'skill',
    id: 1,
    shopType: 'shopify',
    shopName: 'acme',
}

type ToolResultInfo = {
    toolName: string
    runId: string
    threadId: string
    toolCallId: string
    rawResult: string
    args: Record<string, unknown>
    result: {
        frontendReference: { type: string; id: number; uri: string }
        section?: string
        reason?: string
    } | null
}

jest.mock('@gorgias/copilot', () => ({
    __esModule: true,
    useRunLifecycle: (callbacks: RunCallbacks) => {
        capturedRunCallbacks = callbacks
        return { isRunning: false }
    },
    useCopilotToolCallResult: (cb: (info: ToolResultInfo) => void) => {
        capturedToolResultHandler = cb
    },
    useCopilotFollowMode: () => ({ isEnabled: followEnabled }),
    useCopilot: () => ({ threadId: 'thread-1' }),
    parseGorgiasCopilotUri: () => parseResult,
}))

const mockPush = jest.fn()
let currentPathname = '/app/somewhere-else'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockPush,
        location: { pathname: currentPathname },
    }),
}))

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        CopilotFollowModeToggled: 'copilot-follow-mode-toggled',
        CopilotFollowNavigationPerformed: 'copilot-follow-navigation-performed',
    },
}))

jest.mock('./unsavedWorkGuard', () => ({
    hasBlockingUnsavedWork: jest.fn(() => false),
}))

jest.mock('./highlight/highlightAnchor', () => ({
    highlightAnchor: jest.fn(() => ({
        outcome: Promise.resolve('section'),
        dismiss: jest.fn(),
    })),
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockHasBlockingUnsavedWork =
    hasBlockingUnsavedWork as jest.MockedFunction<typeof hasBlockingUnsavedWork>
const mockHighlightAnchor = highlightAnchor as jest.MockedFunction<
    typeof highlightAnchor
>

const skillTarget = {
    type: 'skill',
    id: 1,
    shopType: 'shopify',
    shopName: 'acme',
} as const

const skillRoute = resolveReferenceRoute(skillTarget) as string

function showInAppInfo(
    overrides: Partial<ToolResultInfo> = {},
): ToolResultInfo {
    return {
        toolName: 'show_in_app',
        runId: 'run-1',
        threadId: 'thread-1',
        toolCallId: 'tool-1',
        rawResult: '{}',
        args: {},
        result: {
            frontendReference: {
                type: 'skill',
                id: 1,
                uri: 'gorgias://ai-agent/skill/1?shop_type=shopify&shop_name=acme',
            },
            section: 'instructions',
            reason: 'Updated the skill instructions',
        },
        ...overrides,
    }
}

// A skill/guidance edit tool result: records the edited entity so a later
// show_in_app of it opens the diff view.
function editToolInfo(overrides: Partial<ToolResultInfo> = {}): ToolResultInfo {
    return {
        toolName: 'update_draft_agent_skill',
        runId: 'run-1',
        threadId: 'thread-1',
        toolCallId: 'tool-edit',
        rawResult: '{}',
        args: {},
        result: {
            frontendReference: {
                type: 'skill',
                id: 1,
                uri: 'gorgias://ai-agent/skill/1?shop_type=shopify&shop_name=acme',
            },
        },
        ...overrides,
    }
}

// Drives the SDK callbacks end-to-end: seed a live run (so the replay guard
// passes), fire the tool result, fast-forward past the 800ms debounce, then
// flush the microtask awaited on `highlightAnchor().outcome` so the post-await
// performed-log assertion sees the resolved outcome.
async function landNavigation({
    seedRun = true,
    runId = 'run-1',
    info = showInAppInfo(),
}: {
    seedRun?: boolean
    runId?: string
    info?: ToolResultInfo
} = {}) {
    await act(async () => {
        if (seedRun) {
            capturedRunCallbacks.onStart({ runId })
        }
        capturedToolResultHandler(info)
        await jest.advanceTimersByTimeAsync(800)
        await Promise.resolve()
    })
}

beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    followEnabled = true
    currentPathname = '/app/somewhere-else'
    parseResult = {
        type: 'skill',
        id: 1,
        shopType: 'shopify',
        shopName: 'acme',
    }
    mockHasBlockingUnsavedWork.mockReturnValue(false)
    mockHighlightAnchor.mockReturnValue({
        outcome: Promise.resolve('section'),
        dismiss: jest.fn(),
    } as unknown as ReturnType<typeof highlightAnchor>)
})

afterEach(() => {
    jest.useRealTimers()
})

describe('CopilotUiActionsProvider', () => {
    it('renders nothing', () => {
        const { container } = render(<CopilotUiActionsProvider />)
        expect(container).toBeEmptyDOMElement()
    })

    it('ignores tool results whose run was never seeded (replay guard)', async () => {
        render(<CopilotUiActionsProvider />)

        await landNavigation({ seedRun: false })

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).not.toHaveBeenCalled()
        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            expect.anything(),
        )
    })

    it('navigates with diff=true when the target was edited in the run', async () => {
        render(<CopilotUiActionsProvider />)

        await act(async () => {
            capturedRunCallbacks.onStart({ runId: 'run-1' })
            capturedToolResultHandler(editToolInfo())
            capturedToolResultHandler(showInAppInfo())
            await jest.advanceTimersByTimeAsync(800)
            await Promise.resolve()
        })

        expect(mockPush).toHaveBeenCalledWith(`${skillRoute}?diff=true`)
    })

    it('does not open diff when a different entity was edited', async () => {
        render(<CopilotUiActionsProvider />)

        await act(async () => {
            capturedRunCallbacks.onStart({ runId: 'run-1' })
            capturedToolResultHandler(
                editToolInfo({
                    result: {
                        frontendReference: {
                            type: 'skill',
                            id: 2,
                            uri: 'gorgias://ai-agent/skill/2?shop_type=shopify&shop_name=acme',
                        },
                    },
                }),
            )
            capturedToolResultHandler(showInAppInfo())
            await jest.advanceTimersByTimeAsync(800)
            await Promise.resolve()
        })

        expect(mockPush).toHaveBeenCalledWith(skillRoute)
    })

    it('does nothing when follow mode is disabled', async () => {
        followEnabled = false
        render(<CopilotUiActionsProvider />)

        await landNavigation()

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).not.toHaveBeenCalled()
        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            expect.anything(),
        )
    })

    it('navigates, highlights, and logs the resolved outcome when off-route', async () => {
        render(<CopilotUiActionsProvider />)

        await landNavigation()

        expect(mockPush).toHaveBeenCalledWith(skillRoute)
        expect(mockHighlightAnchor).toHaveBeenCalledWith(
            expect.objectContaining({
                candidates: ['skill:1:instructions', 'skill:1'],
            }),
        )
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            {
                targetType: 'skill',
                section: 'instructions',
                outcome: 'section',
            },
        )
    })

    it('skips the push but still highlights when already on the route', async () => {
        currentPathname = skillRoute
        render(<CopilotUiActionsProvider />)

        await landNavigation()

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).toHaveBeenCalledTimes(1)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            {
                targetType: 'skill',
                section: 'instructions',
                outcome: 'section',
            },
        )
    })

    it('suppresses navigation when there is blocking unsaved work', async () => {
        mockHasBlockingUnsavedWork.mockReturnValue(true)
        render(<CopilotUiActionsProvider />)

        await landNavigation()

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).not.toHaveBeenCalled()
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            {
                targetType: 'skill',
                section: 'instructions',
                outcome: 'suppressed-unsaved-work',
            },
        )
    })

    it('logs an unroutable outcome when the uri cannot be parsed', async () => {
        parseResult = null
        render(<CopilotUiActionsProvider />)

        await landNavigation()

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).not.toHaveBeenCalled()
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            {
                targetType: 'skill',
                section: 'instructions',
                outcome: 'unroutable',
            },
        )
    })

    it('withholds navigation while typing, then performs it at run end', async () => {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()

        render(<CopilotUiActionsProvider />)

        await act(async () => {
            capturedRunCallbacks.onStart({ runId: 'run-1' })
            capturedToolResultHandler(showInAppInfo())
            await jest.advanceTimersByTimeAsync(800)
            await Promise.resolve()
        })

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).not.toHaveBeenCalled()

        input.blur()
        input.remove()

        await act(async () => {
            capturedRunCallbacks.onComplete({})
            await Promise.resolve()
        })

        expect(mockPush).toHaveBeenCalledWith(skillRoute)
        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowNavigationPerformed,
            {
                targetType: 'skill',
                section: 'instructions',
                outcome: 'section',
            },
        )
    })

    it('navigates even when the copilot composer (panel) holds focus', async () => {
        // The composer is a textarea inside the panel; its focus must not count
        // as blocking text entry, or follow nav is suppressed during the very
        // interaction that triggers it (a route change never disrupts the panel).
        const panel = document.createElement('div')
        panel.setAttribute('data-name', 'copilot-side-panel')
        const composer = document.createElement('textarea')
        panel.appendChild(composer)
        document.body.appendChild(panel)
        composer.focus()

        render(<CopilotUiActionsProvider />)

        await landNavigation()

        expect(mockPush).toHaveBeenCalledWith(skillRoute)
        expect(mockHighlightAnchor).toHaveBeenCalled()

        composer.blur()
        panel.remove()
    })

    it('debounces a burst and navigates only to the latest target', async () => {
        const guidanceTarget = {
            type: 'guidance',
            id: 7,
            shopType: 'shopify',
            shopName: 'acme',
        } as const
        const guidanceRoute = resolveReferenceRoute(guidanceTarget) as string

        render(<CopilotUiActionsProvider />)

        await act(async () => {
            capturedRunCallbacks.onStart({ runId: 'run-1' })
            capturedToolResultHandler(showInAppInfo())

            parseResult = guidanceTarget
            capturedToolResultHandler(
                showInAppInfo({
                    result: {
                        frontendReference: {
                            type: 'guidance',
                            id: 7,
                            uri: 'gorgias://ai-agent/guidance/7?shop_type=shopify&shop_name=acme',
                        },
                        section: 'instructions',
                        reason: 'Updated the guidance',
                    },
                }),
            )

            await jest.advanceTimersByTimeAsync(800)
            await Promise.resolve()
        })

        expect(mockPush).toHaveBeenCalledTimes(1)
        expect(mockPush).toHaveBeenCalledWith(guidanceRoute)
    })

    it('cancels a pending debounce when follow mode is disabled mid-flight', async () => {
        const { rerender } = render(<CopilotUiActionsProvider />)

        await act(async () => {
            capturedRunCallbacks.onStart({ runId: 'run-1' })
            capturedToolResultHandler(showInAppInfo())
            await jest.advanceTimersByTimeAsync(400)
        })

        followEnabled = false
        rerender(<CopilotUiActionsProvider />)

        await act(async () => {
            await jest.advanceTimersByTimeAsync(800)
            await Promise.resolve()
        })

        expect(mockPush).not.toHaveBeenCalled()
        expect(mockHighlightAnchor).not.toHaveBeenCalled()
    })

    it('logs the toggle analytic only when follow state flips after mount', async () => {
        followEnabled = false
        const { rerender } = render(<CopilotUiActionsProvider />)

        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowModeToggled,
            expect.anything(),
        )

        followEnabled = true
        rerender(<CopilotUiActionsProvider />)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowModeToggled,
            { enabled: true, page: currentPathname },
        )
        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.CopilotFollowModeToggled,
            expect.objectContaining({ trigger: expect.anything() }),
        )
    })
})
