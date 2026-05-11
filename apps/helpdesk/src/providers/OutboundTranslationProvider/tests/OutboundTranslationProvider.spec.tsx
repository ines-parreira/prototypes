import type React from 'react'

import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'

import { toast } from '@gorgias/axiom'
import type { DomainEvent } from '@gorgias/events'
import { useChannel } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { setTranslationState } from 'state/newMessage/actions'
import ticketReplyCache from 'state/newMessage/ticketReplyCache'

import {
    OutboundTranslationProvider,
    useOutboundTranslationContext,
} from '../OutboundTranslationProvider'

jest.mock('@gorgias/realtime')
const mockUseChannel = useChannel as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = require('hooks/useAppDispatch').default as jest.Mock

jest.mock('state/newMessage/actions')
const mockSetTranslationState = setTranslationState as unknown as jest.Mock

jest.mock('state/newMessage/ticketReplyCache')
const mockTicketReplyCache = ticketReplyCache

const cloudEventBase = {
    id: 'test-event-id',
    type: 'test',
    source: '//helpdesk',
    subject: 'test',
}

function createTranslationCompletedEvent(data: {
    id: string
    stripped_html: string | null
    stripped_text: string | null
}): DomainEvent {
    return {
        ...cloudEventBase,
        dataschema:
            '//helpdesk/draft-ticket-message-translation.completed/1.0.0',
        data: {
            account_id: 1,
            language: 'en',
            user_id: 1,
            ...data,
        },
    } satisfies DomainEvent
}

function createTranslationFailedEvent(data: { id: string }): DomainEvent {
    return {
        ...cloudEventBase,
        dataschema: '//helpdesk/draft-ticket-message-translation.failed/1.0.0',
        data: {
            account_id: 1,
            failed_reason: 'test failure',
            language: 'en',
            user_id: 1,
            ...data,
        },
    } satisfies DomainEvent
}

describe('OutboundTranslationProvider', () => {
    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <OutboundTranslationProvider ticketId="123">
            {children}
        </OutboundTranslationProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return '1'
            if (selector === getCurrentUserId) return '1'
            return null
        })

        mockUseAppDispatch.mockReturnValue(jest.fn())
    })

    afterEach(() => {
        toast.dismiss()
        jest.useRealTimers()
    })

    it('provides initial context values', () => {
        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        expect(result.current.ticketIdToDraftIdMap).toBeInstanceOf(Map)
        expect(result.current.registerTranslationDraft).toBeDefined()
        expect(result.current.unregisterTranslationDraft).toBeDefined()
        expect(result.current.registerEditorMethods).toBeDefined()
        expect(result.current.isTranslationPending).toBe(false)
    })

    it('subscribes to correct channel', () => {
        renderHook(() => useOutboundTranslationContext(), { wrapper })

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: {
                name: 'user',
                accountId: '1',
                userId: '1',
            },
            onEvent: expect.any(Function),
        })
    })

    it('registers translation draft', () => {
        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('ticket123', 'draft456')
        })

        expect(result.current.ticketIdToDraftIdMap.get('ticket123')).toBe(
            'draft456',
        )
    })

    it('unregisters translation draft', () => {
        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('ticket123', 'draft456')
            result.current.registerTranslationDraft('ticket789', 'draft999')
        })

        act(() => {
            result.current.unregisterTranslationDraft('ticket123')
        })

        expect(result.current.ticketIdToDraftIdMap.has('ticket123')).toBe(false)
        expect(result.current.ticketIdToDraftIdMap.get('ticket789')).toBe(
            'draft999',
        )
    })

    it('handles translation completed event', async () => {
        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        const mockGetEditorState = jest
            .fn()
            .mockReturnValue(EditorState.createEmpty())
        const mockSetEditorState = jest.fn()

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        result.current.registerEditorMethods({
            getEditorState: mockGetEditorState,
            setEditorState: mockSetEditorState,
        })

        act(() => {
            result.current.registerTranslationDraft('123', 'draft456')
        })

        const event = createTranslationCompletedEvent({
            id: 'draft456',
            stripped_html: '<p>Translated content</p>',
            stripped_text: 'Translated content',
        })

        act(() => {
            onEventListener?.(event)
        })

        expect(mockSetTranslationState).toHaveBeenCalledWith({
            translatedContentState: expect.any(ContentState),
        })
        expect(mockSetEditorState).toHaveBeenCalledWith(expect.any(EditorState))
    })

    it('handles translation failed event', async () => {
        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('123', 'draft456')
        })

        const event = createTranslationFailedEvent({ id: 'draft456' })

        act(() => {
            onEventListener?.(event)
        })

        await waitFor(() => {
            expect(result.current.ticketIdToDraftIdMap.has('123')).toBe(false)
            expect(
                screen.getByRole('status', {
                    name: 'Translation on ticket 123 failed. Please retry.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('calculates isTranslationPending correctly', () => {
        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        expect(result.current.isTranslationPending).toBe(false)

        act(() => {
            result.current.registerTranslationDraft('123', 'draft456')
        })
        expect(result.current.isTranslationPending).toBe(true)

        const event = createTranslationCompletedEvent({
            id: 'draft456',
            stripped_html: '<p>Translated content</p>',
            stripped_text: 'Translated content',
        })

        act(() => {
            onEventListener?.(event)
        })
        expect(result.current.isTranslationPending).toBe(false)
    })

    it('updates cache when translation completes for a different ticket', () => {
        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        const mockCachedContent = new Map([
            ['contentState', { blocks: [{ text: 'Original text' }] }],
        ])
        mockTicketReplyCache.get = jest.fn().mockReturnValue(mockCachedContent)
        mockTicketReplyCache.set = jest.fn()

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('456', 'draft789')
        })

        const event = createTranslationCompletedEvent({
            id: 'draft789',
            stripped_html: '<p>Translated content</p>',
            stripped_text: 'Translated content',
        })

        act(() => {
            onEventListener?.(event)
        })

        expect(mockTicketReplyCache.get).toHaveBeenCalledWith('456')
        expect(mockTicketReplyCache.set).toHaveBeenCalledWith('456', {
            contentState: expect.objectContaining({
                blocks: expect.arrayContaining([
                    expect.objectContaining({
                        text: 'Translated content',
                    }),
                ]),
            }),
            originalContentState: { blocks: [{ text: 'Original text' }] },
        })
    })

    it('shows timeout notification and clears draft mapping after 60 seconds', () => {
        jest.useFakeTimers()
        const toastInfoSpy = jest.spyOn(toast, 'info')

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('456', 'draft789')
        })

        expect(result.current.ticketIdToDraftIdMap.has('456')).toBe(true)

        act(() => {
            jest.advanceTimersByTime(60_000)
        })

        expect(result.current.ticketIdToDraftIdMap.has('456')).toBe(false)
        expect(toastInfoSpy).toHaveBeenCalledWith(
            'Translation on ticket 456 timed out. Please retry.',
        )

        toastInfoSpy.mockRestore()
    })

    it('uses a generic timeout message when the ticketId is "new"', () => {
        jest.useFakeTimers()
        const toastInfoSpy = jest.spyOn(toast, 'info')

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('new', 'draft-new')
        })

        act(() => {
            jest.advanceTimersByTime(60_000)
        })

        expect(toastInfoSpy).toHaveBeenCalledWith(
            'Translation timed out. Please retry.',
        )

        toastInfoSpy.mockRestore()
    })

    it('clears timeout when translation completes successfully', () => {
        jest.useFakeTimers()

        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('123', 'draft789')
        })

        const event = createTranslationCompletedEvent({
            id: 'draft789',
            stripped_html: '<p>Translated content</p>',
            stripped_text: 'Translated content',
        })

        act(() => {
            onEventListener?.(event)
        })

        act(() => {
            jest.advanceTimersByTime(60_000)
        })

        expect(
            screen.queryByRole('status', {
                name: 'Translation on ticket 123 timed out. Please retry.',
            }),
        ).not.toBeInTheDocument()
    })

    it('useOutboundTranslationContext throws error when useOutboundTranslationContext is used outside provider', () => {
        expect(() => {
            renderHook(() => useOutboundTranslationContext())
        }).toThrow(
            'useOutboundTranslationContext must be used within OutboundTranslationProvider',
        )
    })
})
