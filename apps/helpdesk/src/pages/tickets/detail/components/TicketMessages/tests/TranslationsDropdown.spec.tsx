import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TicketMessagesTranslationDisplayContext } from '../TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { TranslationsDropdown } from '../TranslationsDropdown/TranslationsDropdown'

const mockMessageId = 123

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
            'original',
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
        expect(screen.getByText('Re-generate translation')).toBeInTheDocument()
    })

    describe('when displaying original content', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                'original',
            )
        })

        it('should show "See translation" option', async () => {
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
            ).toHaveBeenCalledWith(mockMessageId, 'translated')
        })
    })

    describe('when displaying translated content', () => {
        beforeEach(() => {
            mockTranslationContext.getTicketMessageTranslationDisplay.mockReturnValue(
                'translated',
            )
        })

        it('should show "See original" option', async () => {
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
            ).toHaveBeenCalledWith(mockMessageId, 'original')
        })
    })

    describe('when dropdown is open', () => {
        let user: ReturnType<typeof userEvent.setup>

        beforeEach(async () => {
            user = userEvent.setup()
            renderWithContext()

            const toggleButton = screen.getByRole('button', {
                name: /translate message/i,
            })
            await act(async () => {
                await user.click(toggleButton)
            })
        })

        it('should display all translation options with correct labels', () => {
            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
        })

        it('should display correct icons for each translation option', () => {
            // All icons should be present
            const translateIcons = screen.getAllByText('translate')
            const loopIcon = screen.getByText('loop')

            // One translate icon in toggle button, one in menu item
            expect(translateIcons).toHaveLength(2)
            expect(loopIcon).toBeInTheDocument()
        })

        it('should make translation menu items clickable', async () => {
            const seeTranslationButton = screen.getByRole('button', {
                name: /see translation/i,
            })
            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })

            expect(seeTranslationButton).toBeInTheDocument()
            expect(regenerateButton).toBeInTheDocument()

            // Test that buttons can be clicked without errors
            await act(async () => {
                await user.click(seeTranslationButton)
                await user.click(regenerateButton)
            })
        })

        it('should render menu items as list items', () => {
            const listItems = screen.getAllByRole('listitem')
            expect(listItems).toHaveLength(2) // Only 2 items when showing original content
        })

        it('should render menu items as buttons within the list', () => {
            // Get all buttons - one toggle button + two menu item buttons
            const buttons = screen.getAllByRole('button')
            expect(buttons).toHaveLength(3)

            // The menu item buttons should have the correct accessible names
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

        // Verify the context is called with the correct messageId
        expect(
            mockTranslationContext.getTicketMessageTranslationDisplay,
        ).toHaveBeenCalledWith(customMessageId)
    })
})
