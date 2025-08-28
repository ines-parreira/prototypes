import { act, renderHook, waitFor } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'

import { DomainEvent } from '@gorgias/events'
import { Language, useTranslateTicketDraft } from '@gorgias/helpdesk-queries'
import { useChannel } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import {
    clearTranslationState,
    setTranslationPending,
    setTranslationState,
} from 'state/newMessage/actions'
import {
    getIsTranslationPending,
    getOriginalContentState,
    hasTranslation,
} from 'state/newMessage/selectors'

import { useTranslation } from '../useTranslation'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useTranslateTicketDraft: jest.fn(),
}))

const mockUseTranslateTicketDraft = useTranslateTicketDraft as jest.Mock

jest.mock('@gorgias/realtime')
const mockUseChannel = useChannel as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock
jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('state/currentAccount/selectors')
const mockGetCurrentAccountId = getCurrentAccountId as unknown as jest.Mock

jest.mock('state/currentUser/selectors')
const mockGetCurrentUserId = getCurrentUserId as unknown as jest.Mock

jest.mock('state/newMessage/selectors')
const mockGetOriginalContentState =
    getOriginalContentState as unknown as jest.Mock
const mockHasTranslation = hasTranslation as unknown as jest.Mock
const mockGetIsTranslationPending =
    getIsTranslationPending as unknown as jest.Mock

jest.mock('state/newMessage/actions')
const mockClearTranslationState = clearTranslationState as unknown as jest.Mock
const mockSetTranslationState = setTranslationState as unknown as jest.Mock
const mockSetTranslationPending = setTranslationPending as unknown as jest.Mock

describe('useTranslation', () => {
    const mockGetEditorState = jest.fn()
    const mockSetEditorState = jest.fn()
    const mockTranslateTicketDraft = jest.fn()
    const mockEditorState = EditorState.createWithContent(
        ContentState.createFromText('Hello world'),
    )

    beforeEach(() => {
        mockUseAppSelector.mockImplementation((fn) => fn())
        mockUseAppDispatch.mockImplementation((fn) =>
            jest.fn().mockReturnValue(fn),
        )

        mockUseTranslateTicketDraft.mockReturnValue({
            mutate: mockTranslateTicketDraft,
            isLoading: false,
            isError: false,
        })
        mockHasTranslation.mockReturnValue(false)
        mockGetIsTranslationPending.mockReturnValue(false)
    })

    it('returns with base state', () => {
        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        expect(result.current.hasTranslation).toBe(false)
        expect(result.current.isTranslating).toBe(false)
        expect(result.current.requestTranslation).toBeDefined()
        expect(result.current.toggleOriginal).toBeDefined()
    })

    it('calls useChannel', () => {
        mockGetCurrentAccountId.mockReturnValue('1')
        mockGetCurrentUserId.mockReturnValue('1')

        renderHook(() => useTranslation(mockGetEditorState, mockSetEditorState))
        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: {
                name: 'user',
                accountId: '1',
                userId: '1',
            },
            onEvent: expect.any(Function),
        })
    })

    it('detects existing translation', () => {
        mockHasTranslation.mockReturnValue(true)

        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        expect(result.current.hasTranslation).toBe(true)
    })

    it('requests translation with language code', async () => {
        mockGetEditorState.mockReturnValue(mockEditorState)

        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        act(() => {
            result.current.requestTranslation('fr' as Language)
        })

        expect(mockTranslateTicketDraft).toHaveBeenCalledWith({
            data: {
                language: 'fr',
                stripped_html: '<div>Hello world</div>',
            },
        })
    })

    it('does not request translation for empty text', async () => {
        mockGetEditorState.mockReturnValue(
            EditorState.createWithContent(ContentState.createFromText('   ')),
        )

        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        act(() => {
            result.current.requestTranslation('fr' as Language)
        })

        expect(mockTranslateTicketDraft).not.toHaveBeenCalled()
    })

    it('shows translating state during request', async () => {
        const { useTranslateTicketDraft } = require('@gorgias/helpdesk-queries')
        useTranslateTicketDraft.mockReturnValue({
            mutate: mockTranslateTicketDraft,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        expect(result.current.isTranslating).toBe(true)
    })

    it('handles translation completed event', async () => {
        mockGetEditorState.mockReturnValue(mockEditorState)
        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        renderHook(() => useTranslation(mockGetEditorState, mockSetEditorState))

        const event: DomainEvent = {
            dataschema:
                '//helpdesk/draft-ticket-message-translation.completed/1.0.0',
            data: {
                stripped_html: '<div>Bonjour le monde</div>',
                stripped_text: 'Bonjour le monde',
            },
        } as any

        act(() => {
            onEventListener?.(event)
        })

        await waitFor(() => {
            expect(mockSetTranslationState).toHaveBeenCalledWith({
                translatedContentState: expect.any(ContentState),
            })
            expect(mockSetEditorState).toHaveBeenCalledWith(
                expect.any(EditorState),
            )
            expect(mockSetTranslationPending).toHaveBeenCalledWith(false)
        })
    })

    it('handles translation failed event', async () => {
        mockGetEditorState.mockReturnValue(mockEditorState)
        let onEventListener: ((event: DomainEvent) => void) | undefined
        mockUseChannel.mockImplementation(({ onEvent }) => {
            onEventListener = onEvent
        })

        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        act(() => {
            result.current.requestTranslation('fr' as Language)
        })

        expect(mockSetTranslationPending).toHaveBeenCalledWith(true)

        const event: DomainEvent = {
            dataschema:
                '//helpdesk/draft-ticket-message-translation.failed/1.0.0',
            data: {},
        } as any

        act(() => {
            onEventListener?.(event)
        })

        expect(mockSetTranslationPending).toHaveBeenCalledWith(false)
    })

    it('toggles back to original content', () => {
        mockHasTranslation.mockReturnValue(true)
        const currentEditorState = EditorState.createWithContent(
            ContentState.createFromText('Translated text'),
        )
        mockGetEditorState.mockReturnValue(currentEditorState)
        const mockOriginalContentState =
            ContentState.createFromText('Original text')
        mockGetOriginalContentState.mockReturnValue(mockOriginalContentState)

        const { result } = renderHook(() =>
            useTranslation(mockGetEditorState, mockSetEditorState),
        )

        act(() => {
            result.current.toggleOriginal()
        })

        expect(mockClearTranslationState).toHaveBeenCalled()
        expect(mockSetEditorState).toHaveBeenCalledWith(expect.any(EditorState))
    })
})
