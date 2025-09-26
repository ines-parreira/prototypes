import { act, renderHook } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'
import { useParams } from 'react-router-dom'

import { Language, useTranslateTicketDraft } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider/OutboundTranslationProvider'
import { clearTranslationState } from 'state/newMessage/actions'
import {
    getOriginalContentState,
    hasTranslation,
} from 'state/newMessage/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useOutboundTranslation } from '../useOutboundTranslation'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = useParams as jest.Mock

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useTranslateTicketDraft: jest.fn(),
}))
const mockUseTranslateTicketDraft = useTranslateTicketDraft as jest.Mock

jest.mock('providers/OutboundTranslationProvider/OutboundTranslationProvider')
const mockUseOutboundTranslationContext =
    useOutboundTranslationContext as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = useAppDispatch as jest.Mock

jest.mock('state/newMessage/selectors')

jest.mock('state/newMessage/actions')
const mockClearTranslationState = clearTranslationState as unknown as jest.Mock

jest.mock('state/notifications/actions')
const mockNotify = notify as jest.Mock

describe('useOutboundTranslation', () => {
    const mockGetEditorState = jest.fn()
    const mockSetEditorState = jest.fn()
    const mockTranslateTicketDraft = jest.fn()
    const mockDispatch = jest.fn()
    const mockRegisterTranslationDraft = jest.fn()
    const mockUnregisterTranslationDraft = jest.fn()
    const mockRegisterEditorMethods = jest.fn()

    const mockEditorState = EditorState.createWithContent(
        ContentState.createFromText('Hello world'),
    )
    const mockOriginalContent = ContentState.createFromText('Original text')
    const mockContext = {
        ticketIdToDraftIdMap: new Map([['123', 'draft456']]),
        registerTranslationDraft: mockRegisterTranslationDraft,
        unregisterTranslationDraft: mockUnregisterTranslationDraft,
        isTranslationPending: false,
        registerEditorMethods: mockRegisterEditorMethods,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseParams.mockReturnValue({ ticketId: '123' })
        mockGetEditorState.mockReturnValue(mockEditorState)
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === hasTranslation) return false
            if (selector === getOriginalContentState) return mockOriginalContent
            return null
        })
        mockUseTranslateTicketDraft.mockReturnValue({
            mutate: mockTranslateTicketDraft,
            isLoading: false,
        })
        mockUseOutboundTranslationContext.mockReturnValue(mockContext)
    })

    describe('initialization', () => {
        it('returns initial state correctly', () => {
            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(result.current.hasTranslation).toBe(false)
            expect(result.current.isTranslating).toBe(false)
            expect(result.current.requestTranslation).toBeDefined()
            expect(result.current.toggleOriginal).toBeDefined()
        })

        it('registers editor methods', () => {
            renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(mockRegisterEditorMethods).toHaveBeenCalledWith({
                getEditorState: mockGetEditorState,
                setEditorState: mockSetEditorState,
            })
        })
    })

    describe('requestTranslation', () => {
        it('requests translation with correct parameters', async () => {
            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            await act(async () => {
                await result.current.requestTranslation('fr' as Language)
            })

            expect(mockRegisterTranslationDraft).toHaveBeenCalledWith(
                '123',
                expect.any(String),
            )
            expect(mockTranslateTicketDraft).toHaveBeenCalledWith({
                data: {
                    language: 'fr',
                    draft_id: expect.any(String),
                    stripped_html: '<div>Hello world</div>',
                },
            })
        })

        it('does not request translation when content is empty', async () => {
            const emptyEditorState = EditorState.createWithContent(
                ContentState.createFromText(''),
            )
            mockGetEditorState.mockReturnValue(emptyEditorState)

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            await act(async () => {
                await result.current.requestTranslation('fr' as Language)
            })

            expect(mockTranslateTicketDraft).not.toHaveBeenCalled()
            expect(mockRegisterTranslationDraft).not.toHaveBeenCalled()
        })

        it('does not register draft when no ticketId', async () => {
            mockUseParams.mockReturnValue({ ticketId: undefined })

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            await act(async () => {
                await result.current.requestTranslation('fr' as Language)
            })

            expect(mockRegisterTranslationDraft).not.toHaveBeenCalled()
            expect(mockTranslateTicketDraft).toHaveBeenCalled()
        })
    })

    describe('toggleOriginal', () => {
        it('toggles back to original content when translation exists', () => {
            mockUseAppSelector.mockImplementation((selector) => {
                if (selector === hasTranslation) return true
                if (selector === getOriginalContentState)
                    return mockOriginalContent
                return null
            })
            const currentEditorState = EditorState.createWithContent(
                ContentState.createFromText('Translated text'),
            )
            mockGetEditorState.mockReturnValue(currentEditorState)

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            act(() => {
                result.current.toggleOriginal()
            })

            expect(mockClearTranslationState).toHaveBeenCalled()
            expect(mockSetEditorState).toHaveBeenCalledWith(
                expect.any(EditorState),
            )
        })
    })

    describe('isTranslating state', () => {
        it('show pending state from context', () => {
            mockUseOutboundTranslationContext.mockReturnValue({
                ...mockContext,
                isTranslationPending: true,
            })

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(result.current.isTranslating).toBe(true)
        })

        it('shows loading state from API request', () => {
            mockUseTranslateTicketDraft.mockReturnValue({
                mutate: mockTranslateTicketDraft,
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(result.current.isTranslating).toBe(true)
        })

        it('returns false when no ticketId', () => {
            mockUseParams.mockReturnValue({ ticketId: undefined })
            mockUseOutboundTranslationContext.mockReturnValue({
                ...mockContext,
                isTranslationPending: true,
            })

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(result.current.isTranslating).toBe(false)
        })
    })

    describe('error handling', () => {
        it('unregisters draft and shows error notification on translation error', () => {
            mockUseTranslateTicketDraft.mockReturnValue({
                mutate: mockTranslateTicketDraft,
                isLoading: false,
                isError: true,
            })

            renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(mockUnregisterTranslationDraft).toHaveBeenCalledWith('123')
            expect(mockDispatch).toHaveBeenCalledWith(
                mockNotify({
                    message: 'Translation on ticket 123 failed. Please retry.',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('shows error message for new tickets', () => {
            mockUseParams.mockReturnValue({ ticketId: 'new' })
            mockUseTranslateTicketDraft.mockReturnValue({
                mutate: mockTranslateTicketDraft,
                isLoading: false,
                isError: true,
            })

            renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            expect(mockDispatch).toHaveBeenCalledWith(
                mockNotify({
                    message: 'Translation failed. Please retry.',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })
})
