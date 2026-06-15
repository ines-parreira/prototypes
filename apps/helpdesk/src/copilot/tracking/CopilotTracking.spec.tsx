import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import {
    useCopilot,
    useCopilotPanel,
    useRunLifecycle,
    useSuggestionLifecycle,
    useThreadLifecycle,
} from '@gorgias/copilot'
import type {
    RunInfo,
    RunLifecycleCallbacks,
    SuggestionLifecycleCallbacks,
    ThreadLifecycleCallbacks,
} from '@gorgias/copilot'

import { CopilotTracking } from './CopilotTracking'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

let capturedOnStart: RunLifecycleCallbacks['onStart']
let capturedSuggestion: SuggestionLifecycleCallbacks
let capturedThread: ThreadLifecycleCallbacks

function setPanelOpen(isOpen: boolean) {
    assumeMock(useCopilotPanel).mockReturnValue({
        isOpen,
        setIsOpen: jest.fn(),
        width: 400,
        setWidth: jest.fn(),
    } as unknown as ReturnType<typeof useCopilotPanel>)
}

beforeEach(() => {
    mockLogEvent.mockClear()
    capturedOnStart = undefined
    capturedSuggestion = {}
    capturedThread = {}

    assumeMock(useRunLifecycle).mockImplementation(
        (callbacks: RunLifecycleCallbacks) => {
            capturedOnStart = callbacks.onStart
            return { isRunning: false }
        },
    )
    assumeMock(useSuggestionLifecycle).mockImplementation(
        (callbacks: SuggestionLifecycleCallbacks) => {
            capturedSuggestion = callbacks
        },
    )
    assumeMock(useThreadLifecycle).mockImplementation(
        (callbacks: ThreadLifecycleCallbacks) => {
            capturedThread = callbacks
        },
    )
    assumeMock(useCopilot).mockReturnValue({
        threadId: 't1',
        agent: { messages: [] },
    } as unknown as ReturnType<typeof useCopilot>)
    setPanelOpen(false)
})

function startRun(threadId: string) {
    capturedOnStart?.({ threadId, runId: `run-${threadId}` } as RunInfo)
}

function selectStarter(title: string) {
    capturedSuggestion.onSuggestionSelected?.({
        threadId: 't1',
        title,
        message: title,
    })
}

function showStarters(titles: string[]) {
    capturedSuggestion.onSuggestionsShown?.({
        threadId: 't1',
        titles,
        count: titles.length,
    })
}

function switchThread(fromThreadId: string, toThreadId: string) {
    capturedThread.onThreadSwitched?.({ fromThreadId, toThreadId })
}

function createThread(threadId: string) {
    capturedThread.onThreadCreated?.({ threadId })
}

function conversationStartedCalls() {
    return mockLogEvent.mock.calls.filter(
        ([event]) => event === SegmentEvent.CopilotConversationStarted,
    )
}

describe('<CopilotTracking />', () => {
    it('emits conversation-started (free-text) with app-wide page context on the first run', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        startRun('thread-A')

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotConversationStarted,
            expect.objectContaining({
                threadId: 'thread-A',
                startedFrom: 'free-text',
                product: 'inbox',
                productName: 'Inbox',
                pathname: '/app/',
            }),
        )
        expect(mockLogEvent.mock.calls[0][1]).not.toHaveProperty(
            'aiAgentSection',
        )
    })

    it('does not re-emit conversation-started for the same thread', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        startRun('thread-A')
        startRun('thread-A')

        expect(conversationStartedCalls()).toHaveLength(1)
    })

    it('emits a fresh conversation-started for a different thread', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        startRun('thread-A')
        startRun('thread-B')

        expect(conversationStartedCalls()).toHaveLength(2)
    })

    it('emits closed on the open -> closed transition', () => {
        setPanelOpen(true)
        const { rerender } = render(<CopilotTracking />, {
            initialEntries: ['/app/'],
        })

        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.CopilotClosed,
            expect.anything(),
        )

        setPanelOpen(false)
        rerender(<CopilotTracking />)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotClosed,
            expect.objectContaining({ product: 'inbox', pathname: '/app/' }),
        )
    })

    it('does not emit closed on mount when the panel starts closed', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        expect(mockLogEvent).not.toHaveBeenCalledWith(
            SegmentEvent.CopilotClosed,
            expect.anything(),
        )
    })

    it('attributes the conversation to a starter when a fresh selection preceded the run', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        selectStarter('Audit my skills')
        startRun('thread-A')

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotConversationStarted,
            expect.objectContaining({
                threadId: 'thread-A',
                startedFrom: 'conversation-starter',
                starterTitle: 'Audit my skills',
            }),
        )
    })

    it('does not carry a starter selection over to a later free-text run', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        selectStarter('Audit my skills')
        startRun('thread-A')
        startRun('thread-B')

        const [, secondProps] = conversationStartedCalls()
        expect(secondProps[1]).toEqual(
            expect.objectContaining({ startedFrom: 'free-text' }),
        )
        expect(secondProps[1]).not.toHaveProperty('starterTitle')
    })

    it('emits starters-shown with the displayed titles and count', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        showStarters(['Audit my skills', 'Improve my action setup'])

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotConversationStartersShown,
            expect.objectContaining({
                starterTitles: ['Audit my skills', 'Improve my action setup'],
                starterCount: 2,
                product: 'inbox',
            }),
        )
    })

    it('emits thread-switched with the from/to ids', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        switchThread('thread-A', 'thread-B')

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotThreadSwitched,
            expect.objectContaining({
                fromThreadId: 'thread-A',
                toThreadId: 'thread-B',
            }),
        )
    })

    it('a thread switch does not emit conversation-started and still lets the target thread fire on its first run', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        switchThread('thread-A', 'thread-B')
        expect(conversationStartedCalls()).toHaveLength(0)

        startRun('thread-B')
        expect(conversationStartedCalls()).toHaveLength(1)
    })

    it('clears a pending starter when the thread is switched before the run', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        selectStarter('Audit my skills')
        switchThread('thread-A', 'thread-B')
        startRun('thread-B')

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotConversationStarted,
            expect.objectContaining({ startedFrom: 'free-text' }),
        )
    })

    it('clears a pending starter when a new thread is created before the run', () => {
        render(<CopilotTracking />, { initialEntries: ['/app/'] })

        selectStarter('Audit my skills')
        createThread('thread-B')
        startRun('thread-B')

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotConversationStarted,
            expect.objectContaining({ startedFrom: 'free-text' }),
        )
        expect(mockLogEvent.mock.calls.at(-1)?.[1]).not.toHaveProperty(
            'starterTitle',
        )
    })
})
