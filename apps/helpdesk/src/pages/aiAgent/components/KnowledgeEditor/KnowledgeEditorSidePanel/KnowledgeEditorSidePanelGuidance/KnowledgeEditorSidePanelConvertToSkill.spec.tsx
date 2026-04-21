import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorSidePanelConvertToSkill } from './KnowledgeEditorSidePanelConvertToSkill'

const mockOnConvert = jest.fn()

const renderComponent = (isConvertDisabled = false) =>
    render(
        <KnowledgeEditorSidePanelConvertToSkill
            isConvertDisabled={isConvertDisabled}
            onConvert={mockOnConvert}
        />,
    )

describe('KnowledgeEditorSidePanelConvertToSkill', () => {
    afterEach(() => jest.clearAllMocks())

    describe('content', () => {
        it('renders the "Convert to skill" heading', () => {
            renderComponent()

            expect(screen.getByText('Convert to skill')).toBeInTheDocument()
        })

        it('renders the description text', () => {
            renderComponent()

            expect(
                screen.getByText(
                    'Create a skill from this content and link intents so AI Agent knows when to use it.',
                ),
            ).toBeInTheDocument()
        })

        it('renders the Convert button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Convert to skill' }),
            ).toBeInTheDocument()
        })
    })

    describe('button state', () => {
        it('enables the button when isConvertDisabled is false', () => {
            renderComponent(false)

            expect(
                screen.getByRole('button', { name: 'Convert to skill' }),
            ).not.toBeDisabled()
        })

        it('disables the button when isConvertDisabled is true', () => {
            renderComponent(true)

            expect(
                screen.getByRole('button', { name: 'Convert to skill' }),
            ).toBeDisabled()
        })
    })

    describe('interactions', () => {
        it('calls onConvert when the button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: 'Convert to skill' }),
            )

            expect(mockOnConvert).toHaveBeenCalledTimes(1)
        })

        it('does not call onConvert when the button is disabled', async () => {
            const user = userEvent.setup()
            renderComponent(true)

            await user.click(
                screen.getByRole('button', { name: 'Convert to skill' }),
            )

            expect(mockOnConvert).not.toHaveBeenCalled()
        })
    })
})
