import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'

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
jest.mock(
    'tickets/core/hooks/translations/useRegenerateTicketMessageTranslations',
    () => ({
        useRegenerateTicketMessageTranslations: () => ({
            regenerateTicketMessageTranslations:
                mockRegenerateTicketMessageTranslations,
        }),
    }),
)

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

const mockTranslationContext = {
    getTicketMessageTranslationDisplay: jest.fn(),
    setTicketMessageTranslationDisplay: jest.fn(),
    allMessageDisplayState: DisplayedContent.Translated,
    setAllTicketMessagesToOriginal: jest.fn(),
    setAllTicketMessagesToTranslated: jest.fn(),
}

const renderWithContext = (messageId: number = mockMessageId) => {
    return render(
        <Provider store={mockStore as any}>
            <TicketMessagesTranslationDisplayContext.Provider
                value={mockTranslationContext}
            >
                <TranslationsDropdown messageId={messageId} />
            </TicketMessagesTranslationDisplayContext.Provider>
        </Provider>,
    )
}

describe('TranslationsDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockRegenerateTicketMessageTranslations.mockClear()
        mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
            mockDisplayTypeOriginal,
        )
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

            expect(
                mockTranslationContext.setTicketMessageTranslationDisplay,
            ).toHaveBeenCalledWith([
                {
                    messageId: mockMessageId,
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                },
            ])
        })
    })

    describe('Translated content display', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeTranslated,
            )
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

            expect(
                mockTranslationContext.setTicketMessageTranslationDisplay,
            ).toHaveBeenCalledWith([
                {
                    messageId: mockMessageId,
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
            ])
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
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Loading,
                    hasRegeneratedOnce: false,
                },
            )
            renderWithContext()

            expect(screen.getByText('Translating...')).toBeInTheDocument()
        })

        it('should show TranslationLimit when failed with hasRegeneratedOnce', () => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Failed,
                    hasRegeneratedOnce: true,
                },
            )
            renderWithContext()

            expect(
                screen.getByText('Regeneration limit reached'),
            ).toBeInTheDocument()
        })

        it('should not show TranslationLimit when failed without hasRegeneratedOnce', () => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Failed,
                    hasRegeneratedOnce: false,
                },
            )
            renderWithContext()

            expect(
                screen.queryByText('Regeneration limit reached'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Regeneration', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeTranslated,
            )
        })

        it('should call regenerate with correct messageId and close dropdown', async () => {
            const customMessageId = 456
            const user = userEvent.setup()
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
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: true,
                },
            )
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
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeTranslated,
            )
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
                    <TicketMessagesTranslationDisplayContext.Provider
                        value={mockTranslationContext}
                    >
                        <TranslationsDropdown messageId={mockMessageId} />
                    </TicketMessagesTranslationDisplayContext.Provider>
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
                    <TicketMessagesTranslationDisplayContext.Provider
                        value={mockTranslationContext}
                    >
                        <TranslationsDropdown messageId={mockMessageId} />
                    </TicketMessagesTranslationDisplayContext.Provider>
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
