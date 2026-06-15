import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { useCopilot } from '@gorgias/copilot'

import { useTrackCopilotOpen } from './useTrackCopilotOpen'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { CopilotOpened: 'copilot-opened' },
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

function mockCopilot(overrides: { threadId?: string; messages?: unknown[] }) {
    assumeMock(useCopilot).mockReturnValue({
        threadId: overrides.threadId ?? 't1',
        agent: { messages: overrides.messages ?? [] },
    } as unknown as ReturnType<typeof useCopilot>)
}

beforeEach(() => {
    mockLogEvent.mockClear()
    mockCopilot({})
})

describe('useTrackCopilotOpen', () => {
    it('emits CopilotOpened with the icon trigger and app-wide page context on a closed -> open transition', () => {
        const { result } = renderHook(() => useTrackCopilotOpen(), {
            initialEntries: ['/app/'],
        })

        result.current('icon', false)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotOpened,
            expect.objectContaining({
                trigger: 'icon',
                threadId: 't1',
                hasActiveConversation: false,
                product: 'inbox',
                productName: 'Inbox',
                pathname: '/app/',
            }),
        )
    })

    it('emits the shortcut trigger when opened via the keyboard shortcut', () => {
        const { result } = renderHook(() => useTrackCopilotOpen(), {
            initialEntries: ['/app/'],
        })

        result.current('shortcut', false)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotOpened,
            expect.objectContaining({ trigger: 'shortcut' }),
        )
    })

    it('does not emit when the panel was already open', () => {
        const { result } = renderHook(() => useTrackCopilotOpen(), {
            initialEntries: ['/app/'],
        })

        result.current('icon', true)

        expect(mockLogEvent).not.toHaveBeenCalled()
    })

    it('reports hasActiveConversation when the thread already has messages', () => {
        mockCopilot({ messages: [{ id: 'm1' }] })
        const { result } = renderHook(() => useTrackCopilotOpen(), {
            initialEntries: ['/app/'],
        })

        result.current('icon', false)

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.CopilotOpened,
            expect.objectContaining({ hasActiveConversation: true }),
        )
    })
})
