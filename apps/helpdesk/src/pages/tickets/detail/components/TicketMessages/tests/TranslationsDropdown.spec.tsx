import {
    DisplayedContent,
    FetchingState,
    useTicketMessageTranslationDisplay,
} from '@repo/tickets'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { TranslationsDropdown } from '../TranslationsDropdown/TranslationsDropdown'

// Mock the store with Immutable.js structure
const mockStore = {
    getState: () => ({
        ticket: fromJS({
            id: 123,
            language: 'es',
        }),
    }),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
}

// Mock the useRegenerateTicketMessageTranslations hook
const mockRegenerateTicketMessageTranslations = jest.fn()
jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useRegenerateTicketMessageTranslations: () => ({
        regenerateTicketMessageTranslations:
            mockRegenerateTicketMessageTranslations,
    }),
}))

const mockMessageId = 123

const mockDisplayTypeOriginal = {
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Idle,
    hasRegeneratedOnce: false,
}

const mockDisplayTypeTranslated = {
    display: DisplayedContent.Translated,
    fetchingState: FetchingState.Completed,
    hasRegeneratedOnce: false,
}

const renderWithContext = (messageId: number = mockMessageId) => {
    return render(
        <Provider store={mockStore as any}>
            <TranslationsDropdown messageId={messageId} />
        </Provider>,
    )
}

describe('TranslationsDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockRegenerateTicketMessageTranslations.mockClear()
        // Reset the zustand store state
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {
                [mockMessageId]: mockDisplayTypeOriginal,
            },
            allMessageDisplayState: DisplayedContent.Translated,
        })
    })

    describe('Original content display', () => {
        it('should render "See translation" button', () => {
            renderWithContext()

            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(screen.queryByText('Show original')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Re-generate translation'),
            ).not.toBeInTheDocument()
        })

        it('should switch to translated when "See translation" is clicked', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const seeTranslationButton = screen.getByRole('button', {
                name: /see translation/i,
            })
            await act(async () => {
                await user.click(seeTranslationButton)
            })

            const state = useTicketMessageTranslationDisplay.getState()
            expect(
                state.getTicketMessageTranslationDisplay(mockMessageId),
            ).toEqual({
                messageId: mockMessageId,
                display: DisplayedContent.Translated,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            })
        })
    })

    describe('Translated content display', () => {
        beforeEach(() => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: mockDisplayTypeTranslated,
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
        })

        it('should show dropdown with language name', () => {
            renderWithContext()

            expect(screen.getByText(/translated from/i)).toBeInTheDocument()
            expect(screen.getByText(/spanish/i)).toBeInTheDocument()
        })

        it('should show dropdown menu options when opened', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('Show original')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /re-generate translation/i,
                }),
            ).not.toBeDisabled()
        })

        it('should switch to original when "Show original" is clicked', async () => {
            const user = userEvent.setup()
            renderWithContext()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /translate message/i }),
                )
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /show original/i }),
                )
            })

            const state = useTicketMessageTranslationDisplay.getState()
            expect(
                state.getTicketMessageTranslationDisplay(mockMessageId),
            ).toEqual({
                messageId: mockMessageId,
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Completed,
                hasRegeneratedOnce: false,
            })
        })

        it('should toggle dropdown open and closed', async () => {
            const user = userEvent.setup()
            const { container } = renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })

            await act(async () => {
                await user.click(toggleButton)
            })
            expect(container.querySelector('.menuWrapper')).toHaveClass('show')

            await act(async () => {
                await user.click(toggleButton)
            })
            expect(container.querySelector('.menuWrapper')).not.toHaveClass(
                'show',
            )
        })
    })

    describe('Loading and error states', () => {
        it('should show loading state', () => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: {
                        display: DisplayedContent.Original,
                        fetchingState: FetchingState.Loading,
                        hasRegeneratedOnce: false,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
            renderWithContext()

            expect(screen.getByText('Translating...')).toBeInTheDocument()
        })

        it('should show TranslationLimit when failed with hasRegeneratedOnce', () => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: {
                        display: DisplayedContent.Original,
                        fetchingState: FetchingState.Failed,
                        hasRegeneratedOnce: true,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
            renderWithContext()

            expect(
                screen.getByText('Regeneration limit reached'),
            ).toBeInTheDocument()
        })

        it('should not show TranslationLimit when failed without hasRegeneratedOnce', () => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: {
                        display: DisplayedContent.Original,
                        fetchingState: FetchingState.Failed,
                        hasRegeneratedOnce: false,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
            renderWithContext()

            expect(
                screen.queryByText('Regeneration limit reached'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Regeneration', () => {
        beforeEach(() => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: mockDisplayTypeTranslated,
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
        })

        it('should call regenerate with correct messageId and close dropdown', async () => {
            const customMessageId = 456
            const user = userEvent.setup()

            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [customMessageId]: mockDisplayTypeTranslated,
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })

            const { container } = renderWithContext(customMessageId)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /translate message/i }),
                )
            })

            await act(async () => {
                await user.click(
                    screen.getByRole('button', {
                        name: /re-generate translation/i,
                    }),
                )
            })

            expect(
                mockRegenerateTicketMessageTranslations,
            ).toHaveBeenCalledWith(customMessageId)
            expect(container.querySelector('.menuWrapper')).not.toHaveClass(
                'show',
            )
        })

        it('should disable re-generate button when hasRegeneratedOnce is true', async () => {
            const user = userEvent.setup()
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: {
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: true,
                    },
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
            renderWithContext()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /translate message/i }),
                )
            })

            expect(
                screen.getByRole('button', {
                    name: /re-generate translation/i,
                }),
            ).toBeDisabled()
        })
    })

    describe('Ticket language handling', () => {
        beforeEach(() => {
            useTicketMessageTranslationDisplay.setState({
                ticketMessagesTranslationDisplayMap: {
                    [mockMessageId]: mockDisplayTypeTranslated,
                },
                allMessageDisplayState: DisplayedContent.Translated,
            })
        })

        it('should hide language text when ticket has no language', () => {
            const mockStoreNoLanguage = {
                getState: () => ({
                    ticket: fromJS({
                        id: 123,
                        language: undefined,
                    }),
                }),
                subscribe: jest.fn(),
                dispatch: jest.fn(),
            }

            render(
                <Provider store={mockStoreNoLanguage as any}>
                    <TranslationsDropdown messageId={mockMessageId} />
                </Provider>,
            )

            expect(
                screen.queryByText(/translated from/i),
            ).not.toBeInTheDocument()
        })

        it('should still allow dropdown actions when ticket has no language', async () => {
            const user = userEvent.setup()

            const mockStoreNoLanguage = {
                getState: () => ({
                    ticket: fromJS({
                        id: 123,
                    }),
                }),
                subscribe: jest.fn(),
                dispatch: jest.fn(),
            }

            const { container } = render(
                <Provider store={mockStoreNoLanguage as any}>
                    <TranslationsDropdown messageId={mockMessageId} />
                </Provider>,
            )

            const toggleButton = container.querySelector('.dropdownToggle')

            await act(async () => {
                await user.click(toggleButton!)
            })

            expect(screen.getByText('Show original')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
        })
    })
})
