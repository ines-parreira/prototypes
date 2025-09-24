import React from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'
import { ContentState } from 'draft-js'

import { DomainEvent } from '@gorgias/events'
import { useChannel } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { setTranslationState } from 'state/newMessage/actions'

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

describe('OutboundTranslationProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
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

        const { result } = renderHook(() => useOutboundTranslationContext(), {
            wrapper,
        })

        act(() => {
            result.current.registerTranslationDraft('123', 'draft456')
        })

        const event = {
            dataschema:
                '//helpdesk/draft-ticket-message-translation.completed/1.0.0',
            data: {
                id: 'draft456',
                stripped_html: '<p>Translated content</p>',
                stripped_text: 'Translated content',
            },
        } as DomainEvent

        act(() => {
            onEventListener?.(event)
        })

        expect(mockSetTranslationState).toHaveBeenCalledWith({
            translatedContentState: expect.any(ContentState),
        })
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

        const event: DomainEvent = {
            dataschema:
                '//helpdesk/draft-ticket-message-translation.failed/1.0.0',
            data: {
                id: 'draft456',
            },
        } as any

        act(() => {
            onEventListener?.(event)
        })

        await waitFor(() => {
            expect(result.current.ticketIdToDraftIdMap.has('123')).toBe(false)
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

        const event: DomainEvent = {
            dataschema:
                '//helpdesk/draft-ticket-message-translation.completed/1.0.0',
            data: {
                id: 'draft456',
                stripped_html: '<p>Translated content</p>',
                stripped_text: 'Translated content',
            },
        } as any

        act(() => {
            onEventListener?.(event)
        })
        expect(result.current.isTranslationPending).toBe(false)
    })

    it('throws error when useOutboundTranslationContext is used outside provider', () => {
        expect(() => {
            renderHook(() => useOutboundTranslationContext())
        }).toThrow(
            'useOutboundTranslationContext must be used within OutboundTranslationProvider',
        )
    })
})
