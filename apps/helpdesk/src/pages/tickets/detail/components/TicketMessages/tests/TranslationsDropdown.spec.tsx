import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'

import { TranslationsDropdown } from '../TranslationsDropdown/TranslationsDropdown'

const mockMessageId = 123

const mockDisplayTypeOriginal = {
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Idle,
}

const mockDisplayTypeTranslated = {
    display: DisplayedContent.Translated,
    fetchingState: FetchingState.Completed,
}

const mockDisplayTypeFailed = {
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Failed,
}

const mockTranslationContext = {
    getTicketMessageTranslationDisplay: jest.fn(),
    setTicketMessageTranslationDisplay: jest.fn(),
}

const renderWithContext = (messageId: number = mockMessageId) => {
    return render(
        <TicketMessagesTranslationDisplayContext.Provider
            value={mockTranslationContext}
        >
            <TranslationsDropdown messageId={messageId} />
        </TicketMessagesTranslationDisplayContext.Provider>,
    )
}

describe('TranslationsDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

        const translateIcon = screen.getByLabelText('Translate message')
        expect(translateIcon).toBeInTheDocument()
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

        it('should show "See translation" option only', async () => {
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
                screen.queryByText('Re-generate translation'),
            ).not.toBeInTheDocument()
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

        it('should show "See original" option only', async () => {
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
                screen.queryByText('Re-generate translation'),
            ).not.toBeInTheDocument()
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

        it('should show both "See translation" and "Re-generate translation" options', async () => {
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

            // Two translate icons (one in toggle, one in "See translation")
            const translateIcons = screen.getAllByText('translate')
            expect(translateIcons).toHaveLength(2)

            // One loop icon for "Re-generate translation"
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
            expect(listItems).toHaveLength(2) // "See translation" and "Re-generate translation"
        })
    })

    describe('when translation is in progress', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Loading,
                },
            )
        })

        it('should only show "See translation" option', async () => {
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
                screen.queryByText('Re-generate translation'),
            ).not.toBeInTheDocument()
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

        it('should show both "See original" and "Re-generate translation" options', async () => {
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
        it('should display tooltip with correct content', async () => {
            const user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.hover(toggleButton)
            })

            const tooltip = screen.getByText('Translations menu')
            expect(tooltip).toBeInTheDocument()
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

    describe('edge cases', () => {
        it('should handle undefined fetchingState gracefully', async () => {
            const user = userEvent.setup()
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: undefined,
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
                screen.queryByText('Re-generate translation'),
            ).not.toBeInTheDocument()
        })

        it('should handle clicking on re-generate translation button', async () => {
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

            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })

            await act(async () => {
                await user.click(regenerateButton)
            })

            expect(regenerateButton).toBeInTheDocument()
        })
    })
})
