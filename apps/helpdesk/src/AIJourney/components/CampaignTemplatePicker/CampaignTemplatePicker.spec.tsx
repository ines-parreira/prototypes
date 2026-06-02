import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { CampaignTemplatesList } from 'AIJourney/data/CampaignTemplatesData'
import { ThemeProvider } from 'core/theme'

import { CampaignTemplatePicker } from './CampaignTemplatePicker'

const renderPicker = (
    props?: Partial<{
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        onSelectTemplate: (
            template: (typeof CampaignTemplatesList)[number],
        ) => void
    }>,
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <CampaignTemplatePicker
                    isOpen
                    onOpenChange={jest.fn()}
                    onSelectTemplate={jest.fn()}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('<CampaignTemplatePicker />', () => {
    it('does not render the dialog when isOpen is false', () => {
        renderPicker({ isOpen: false })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the dialog with the "Templates" heading when isOpen is true', () => {
        renderPicker()

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'Templates' }),
        ).toBeInTheDocument()
    })

    it('renders one card per campaign template', () => {
        renderPicker()

        for (const template of CampaignTemplatesList) {
            expect(screen.getByText(template.name)).toBeInTheDocument()
        }
    })

    it('calls onSelectTemplate with the matching template when a card is clicked', async () => {
        const user = userEvent.setup()
        const onSelectTemplate = jest.fn()
        renderPicker({ onSelectTemplate })

        const target = CampaignTemplatesList[0]
        await user.click(screen.getByText(target.name))

        expect(onSelectTemplate).toHaveBeenCalledWith(target)
    })

    it('calls onOpenChange with false when Escape is pressed', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderPicker({ onOpenChange })

        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('does not include a "Start from scratch" entry inside the modal', () => {
        renderPicker()

        expect(
            screen.queryByText(/start from scratch/i),
        ).not.toBeInTheDocument()
    })
})
