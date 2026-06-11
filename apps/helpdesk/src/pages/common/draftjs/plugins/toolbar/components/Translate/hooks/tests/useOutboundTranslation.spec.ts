import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'
import { mockTranslateTicketDraftHandler } from '@gorgias/helpdesk-mocks'
import type { Language } from '@gorgias/helpdesk-types'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { useOutboundTranslationContext } from 'providers/OutboundTranslationProvider/OutboundTranslationProvider'
import { clearTranslationState } from 'state/newMessage/actions'
import {
    getOriginalContentState,
    hasTranslation,
} from 'state/newMessage/selectors'

import { useOutboundTranslation } from '../useOutboundTranslation'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))
const mockUseParams = useParams as jest.Mock

const translateTicketDraftHandler = mockTranslateTicketDraftHandler(
    async () => new HttpResponse(null, { status: 200 }),
)
const server = setupServer(translateTicketDraftHandler.handler)

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

describe('useOutboundTranslation', () => {
    const mockGetEditorState = jest.fn()
    const mockSetEditorState = jest.fn()
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
        mockUseOutboundTranslationContext.mockReturnValue(mockContext)
    })

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        toast.dismiss()
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
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
            const waitForTranslateTicketDraftRequest =
                translateTicketDraftHandler.waitForRequest(server)
            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            await act(async () => {
                await result.current.requestTranslation('fr' as Language)
            })

            await waitForTranslateTicketDraftRequest(async (request) => {
                await expect(request.json()).resolves.toEqual({
                    language: 'fr',
                    draft_id: expect.any(String),
                    stripped_html: '<div>Hello world</div>',
                })
            })
            expect(mockRegisterTranslationDraft).toHaveBeenCalledWith(
                '123',
                expect.any(String),
            )
        })

        it('does not request translation when content is empty', async () => {
            let translateRequestCount = 0
            server.use(
                mockTranslateTicketDraftHandler(async () => {
                    translateRequestCount += 1

                    return new HttpResponse(null, { status: 200 })
                }).handler,
            )
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

            expect(translateRequestCount).toBe(0)
            expect(mockRegisterTranslationDraft).not.toHaveBeenCalled()
        })

        it('does not register draft when no ticketId', async () => {
            const waitForTranslateTicketDraftRequest =
                translateTicketDraftHandler.waitForRequest(server)
            mockUseParams.mockReturnValue({ ticketId: undefined })

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            await act(async () => {
                await result.current.requestTranslation('fr' as Language)
            })

            expect(mockRegisterTranslationDraft).not.toHaveBeenCalled()
            await waitForTranslateTicketDraftRequest(async (request) => {
                await expect(request.json()).resolves.toEqual({
                    language: 'fr',
                    draft_id: expect.any(String),
                    stripped_html: '<div>Hello world</div>',
                })
            })
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

        it('shows loading state from API request', async () => {
            server.use(
                mockTranslateTicketDraftHandler(() => new Promise(() => {}))
                    .handler,
            )

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            act(() => {
                void result.current.requestTranslation('fr' as Language)
            })

            await waitFor(() => {
                expect(result.current.isTranslating).toBe(true)
            })
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
        it('unregisters draft and shows error notification on translation error', async () => {
            server.use(
                mockTranslateTicketDraftHandler(
                    async () => new HttpResponse(null, { status: 500 }),
                ).handler,
            )

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            act(() => {
                void result.current.requestTranslation('fr' as Language)
            })

            await waitFor(() => {
                expect(mockUnregisterTranslationDraft).toHaveBeenCalledWith(
                    '123',
                )
                expect(
                    screen.getByRole('status', {
                        name: 'Translation on ticket 123 failed. Please retry.',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })

        it('shows error message for new tickets', async () => {
            mockUseParams.mockReturnValue({ ticketId: 'new' })
            server.use(
                mockTranslateTicketDraftHandler(
                    async () => new HttpResponse(null, { status: 500 }),
                ).handler,
            )

            const { result } = renderHook(() =>
                useOutboundTranslation(mockGetEditorState, mockSetEditorState),
            )

            act(() => {
                void result.current.requestTranslation('fr' as Language)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Translation failed. Please retry.',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
})
