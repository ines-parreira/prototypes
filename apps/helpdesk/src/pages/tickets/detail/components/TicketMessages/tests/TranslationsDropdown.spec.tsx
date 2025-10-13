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

const mockDisplayTypeFailed = {
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Failed,
    hasRegeneratedOnce: false,
}

const mockDisplayTypeFailedRegeneratedOnce = {
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Failed,
    hasRegeneratedOnce: true,
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

    it('should render the translation toggle button', () => {
        renderWithContext()

        const toggleButton = screen.getByRole('button', {
            name: /translate message/i,
        })
        expect(toggleButton).toBeInTheDocument()

        const translateIcons = screen.getAllByLabelText('Translate message')
        expect(translateIcons.length).toBeGreaterThan(0)
    })

    it('should open the dropdown when toggle button is clicked', async () => {
        const user = userEvent.setup()
        renderWithContext()

        const toggleButton = screen.getByRole('button', {
            name: /translate message/i,
        })
        await act(async () => {
            await user.click(toggleButton)
        })

        expect(screen.getByText('See translation')).toBeInTheDocument()
    })

    describe('when displaying original content', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeOriginal,
            )
        })

        it('should show "See translation" and "Re-generate translation" options when displaying original content', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(screen.queryByText('See original')).not.toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).not.toBeDisabled()
        })

        it('should call setTicketMessageTranslationDisplay with translated when "See translation" is clicked', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

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

    describe('when displaying translated content', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeTranslated,
            )
        })

        it('should show "See original" and "Re-generate translation" options', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See original')).toBeInTheDocument()
            expect(
                screen.queryByText('See translation'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).not.toBeDisabled()
        })

        it('should display undo icon for "See original" option', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const undoIcon = screen.getByText('undo')
            expect(undoIcon).toBeInTheDocument()
        })

        it('should call setTicketMessageTranslationDisplay with original when "See original" is clicked', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const seeOriginalButton = screen.getByRole('button', {
                name: /see original/i,
            })
            await act(async () => {
                await user.click(seeOriginalButton)
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
    })

    describe('when translation has failed', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailed,
            )
        })

        it('should show both "See translation" and enabled "Re-generate translation" options when the translation has failed', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
            expect(screen.queryByText('See original')).not.toBeInTheDocument()

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).not.toBeDisabled()
        })

        it('should display loop icon for "Re-generate translation" option', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const loopIcon = screen.getByText('loop')
            expect(loopIcon).toBeInTheDocument()
        })

        it('should display correct icons for all options in failed state', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const translateIcons = screen.getAllByText('translate')
            expect(translateIcons).toHaveLength(2)

            const loopIcon = screen.getByText('loop')
            expect(loopIcon).toBeInTheDocument()
        })

        it('should render menu items as list items', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const listItems = screen.getAllByRole('listitem')
            expect(listItems).toHaveLength(2)
        })
    })

    describe('when translation is in progress', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Loading,
                    hasRegeneratedOnce: false,
                },
            )
        })

        it('should show loading spinner when translation is in progress', () => {
            renderWithContext()

            expect(screen.getByText('Translating...')).toBeInTheDocument()
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })
    })

    describe('when translated content with failed state', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Failed,
                },
            )
        })

        it('should show both "See original" and "Re-generate translation" options when the translated content has failed', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See original')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('See translation'),
            ).not.toBeInTheDocument()
        })
    })

    describe('dropdown behavior', () => {
        it('should display translated from text with language name', () => {
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            expect(toggleButton).toBeInTheDocument()
            expect(screen.getByText(/translated from/i)).toBeInTheDocument()
            expect(screen.getByText(/spanish/i)).toBeInTheDocument()
        })

        it('should use the provided messageId in context calls', () => {
            const customMessageId = 456
            renderWithContext(customMessageId)

            expect(
                mockTranslationContext.getTicketMessageTranslationDisplay,
            ).toHaveBeenCalledWith(customMessageId)
        })

        it('should render menu items as buttons within the list', async () => {
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailed,
            )
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const buttons = screen.getAllByRole('button')
            expect(buttons).toHaveLength(3)

            expect(
                screen.getByRole('button', { name: /see translation/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /re-generate translation/i,
                }),
            ).toBeInTheDocument()
        })
    })

    describe('hasRegeneratedOnce behavior across states', () => {
        it('should show disabled re-generate button when displaying original with hasRegeneratedOnce true', async () => {
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: true,
                },
            )
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See translation')).toBeInTheDocument()
            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).toBeInTheDocument()
            expect(regenerateButton).toBeDisabled()
        })

        it('should show disabled re-generate button when displaying translated with hasRegeneratedOnce true', async () => {
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: true,
                },
            )
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See original')).toBeInTheDocument()
            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).toBeInTheDocument()
            expect(regenerateButton).toBeDisabled()
        })

        it('should show loading spinner during loading even with hasRegeneratedOnce true', () => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Loading,
                    hasRegeneratedOnce: true,
                },
            )
            renderWithContext()

            expect(screen.getByText('Translating...')).toBeInTheDocument()
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })
    })

    describe('edge cases', () => {
        it('should handle undefined fetchingState gracefully', async () => {
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: undefined,
                    hasRegeneratedOnce: false,
                },
            )
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).not.toBeDisabled()
        })

        it('should close dropdown after clicking re-generate translation button', async () => {
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailed,
            )
            const { container } = renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })

            await act(async () => {
                await user.click(regenerateButton)
            })

            const dropdownMenu = container.querySelector('.menuWrapper')
            expect(dropdownMenu).not.toHaveClass('show')
        })
    })

    describe('when translation has failed and not yet regenerated', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailed,
            )
        })

        it('should call regenerateTicketMessageTranslations when re-generate button is clicked', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            await act(async () => {
                await user.click(regenerateButton)
            })

            expect(
                mockRegenerateTicketMessageTranslations,
            ).toHaveBeenCalledWith(mockMessageId)
        })

        it('should show re-generate translation option with loop icon', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(
                screen.getByRole('button', {
                    name: /re-generate translation/i,
                }),
            ).toBeInTheDocument()
            expect(screen.getByText('loop')).toBeInTheDocument()
        })

        it('should show both see translation and re-generate options when failed', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
        })
    })

    describe('when translation has failed and max regeneration attempts reached', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailedRegeneratedOnce,
            )
        })

        it('should show disabled re-generate button', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).toBeInTheDocument()
            expect(regenerateButton).toBeDisabled()
        })

        it('should display loop icon for disabled re-generate button', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const loopIcon = screen.getByText('loop')
            expect(loopIcon).toBeInTheDocument()
        })

        it('should show see translation option alongside disabled re-generate button', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See translation')).toBeInTheDocument()
            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).toBeInTheDocument()
            expect(regenerateButton).toBeDisabled()
        })

        it('should not call regenerateTicketMessageTranslations when clicking disabled button', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).toBeDisabled()

            await act(async () => {
                await user.click(regenerateButton)
            })

            expect(
                mockRegenerateTicketMessageTranslations,
            ).not.toHaveBeenCalled()
        })
    })

    describe('when translated content has failed and regeneration available', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Failed,
                    hasRegeneratedOnce: false,
                },
            )
        })

        it('should show both see original and re-generate translation options', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See original')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('See translation'),
            ).not.toBeInTheDocument()
        })

        it('should call regenerateTicketMessageTranslations when re-generate clicked from translated view', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            await act(async () => {
                await user.click(regenerateButton)
            })

            expect(
                mockRegenerateTicketMessageTranslations,
            ).toHaveBeenCalledWith(mockMessageId)
        })
    })

    describe('when translated content has failed and max attempts reached', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Failed,
                    hasRegeneratedOnce: true,
                },
            )
        })

        it('should show see original option and disabled re-generate button', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            expect(screen.getByText('See original')).toBeInTheDocument()
            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            expect(regenerateButton).toBeInTheDocument()
            expect(regenerateButton).toBeDisabled()
        })
    })

    describe('regeneration integration', () => {
        it('should call regenerateTicketMessageTranslations with correct messageId', async () => {
            const customMessageId = 456
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailed,
            )
            renderWithContext(customMessageId)

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })
            await act(async () => {
                await user.click(regenerateButton)
            })

            expect(
                mockRegenerateTicketMessageTranslations,
            ).toHaveBeenCalledWith(customMessageId)
        })

        it('should handle async regeneration calls without errors', async () => {
            const user = userEvent.setup()
            mockRegenerateTicketMessageTranslations.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 10)),
            )
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                mockDisplayTypeFailed,
            )
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })

            await act(async () => {
                await user.click(regenerateButton)
            })

            expect(mockRegenerateTicketMessageTranslations).toHaveBeenCalled()
        })
    })
})
