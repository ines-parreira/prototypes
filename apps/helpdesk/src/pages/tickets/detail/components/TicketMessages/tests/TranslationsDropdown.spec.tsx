import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TranslationsDropdown } from '../TranslationsDropdown/TranslationsDropdown'

describe('TranslationsDropdown', () => {
    it('should render the translation toggle button', () => {
        render(<TranslationsDropdown />)

        const toggleButton = screen.getByRole('button')
        expect(toggleButton).toBeInTheDocument()

        const translateIcon = screen.getByLabelText('Translate message')
        expect(translateIcon).toBeInTheDocument()
    })

    it('should open the dropdown when toggle button is clicked', async () => {
        const user = userEvent.setup()
        render(<TranslationsDropdown />)

        const toggleButton = screen.getByRole('button')
        await act(async () => {
            await user.click(toggleButton)
        })

        expect(screen.getByText('See translation')).toBeInTheDocument()
        expect(screen.getByText('See original')).toBeInTheDocument()
        expect(screen.getByText('Re-generate translation')).toBeInTheDocument()
    })

    describe('when dropdown is open', () => {
        let user: ReturnType<typeof userEvent.setup>

        beforeEach(async () => {
            user = userEvent.setup()
            render(<TranslationsDropdown />)

            const toggleButton = screen.getByRole('button')
            await act(async () => {
                await user.click(toggleButton)
            })
        })

        it('should display all translation options with correct labels', () => {
            expect(screen.getByText('See translation')).toBeInTheDocument()
            expect(screen.getByText('See original')).toBeInTheDocument()
            expect(
                screen.getByText('Re-generate translation'),
            ).toBeInTheDocument()
        })

        it('should display correct icons for each translation option', () => {
            // All icons should be present
            const translateIcons = screen.getAllByText('translate')
            const undoIcon = screen.getByText('undo')
            const loopIcon = screen.getByText('loop')

            // One translate icon in toggle button, one in menu item
            expect(translateIcons).toHaveLength(2)
            expect(undoIcon).toBeInTheDocument()
            expect(loopIcon).toBeInTheDocument()
        })

        it('should make translation menu items clickable', async () => {
            const seeTranslationButton = screen.getByRole('button', {
                name: /see translation/i,
            })
            const seeOriginalButton = screen.getByRole('button', {
                name: /see original/i,
            })
            const regenerateButton = screen.getByRole('button', {
                name: /re-generate translation/i,
            })

            expect(seeTranslationButton).toBeInTheDocument()
            expect(seeOriginalButton).toBeInTheDocument()
            expect(regenerateButton).toBeInTheDocument()

            // Test that buttons can be clicked without errors
            await act(async () => {
                await user.click(seeTranslationButton)
                await user.click(seeOriginalButton)
                await user.click(regenerateButton)
            })
        })

        it('should render menu items as list items', () => {
            const listItems = screen.getAllByRole('listitem')
            expect(listItems).toHaveLength(3)
        })

        it('should render menu items as buttons within the list', () => {
            // Get all buttons - one toggle button + three menu item buttons
            const buttons = screen.getAllByRole('button')
            expect(buttons).toHaveLength(4)

            // The three menu item buttons should have the correct accessible names
            expect(
                screen.getByRole('button', { name: /see translation/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /see original/i }),
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
        render(<TranslationsDropdown />)

        const toggleButton = screen.getByRole('button')
        await act(async () => {
            await user.hover(toggleButton)
        })

        const tooltip = screen.getByText('Translations menu')
        expect(tooltip).toBeInTheDocument()
    })
})
