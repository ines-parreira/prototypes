import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import { RecommendedSkillsSection } from './RecommendedSkillsSection'

const makeTemplate = (id: string, name: string): SkillTemplate => ({
    id,
    name,
    guidanceId: `${id}-guidance`,
    intents: [
        {
            name: 'order::status',
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
        },
    ],
})

const mockTemplates: SkillTemplate[] = [
    makeTemplate('order-status', 'Order Status'),
    makeTemplate('returns', 'Returns and Exchanges'),
    makeTemplate('order-cancel', 'Order Cancellations'),
]

const renderComponent = (
    skillsTemplates = mockTemplates,
    onCreateSkillsFromTemplate = jest.fn(),
): ReturnType<typeof render> =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <RecommendedSkillsSection
                    skillsTemplates={skillsTemplates}
                    onCreateSkillsFromTemplate={onCreateSkillsFromTemplate}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('RecommendedSkillsSection', () => {
    it('renders the section heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Recommended skills' }),
        ).toBeInTheDocument()
    })

    it('renders the description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Based on handover rate and ticket volume across your store',
            ),
        ).toBeInTheDocument()
    })

    it('renders the first template card', () => {
        renderComponent()

        expect(screen.getByText('Order Status')).toBeInTheDocument()
    })

    it('shows the stats section on the card', () => {
        renderComponent()

        expect(screen.getByText('Ticket volume')).toBeInTheDocument()
        expect(screen.getByText('Handover')).toBeInTheDocument()
    })

    it('renders the Set up skill CTA button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /set up skill/i }),
        ).toBeInTheDocument()
    })

    it('calls onCreateSkillsFromTemplate when the CTA button is clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkillsFromTemplate = jest.fn()
        renderComponent(mockTemplates, onCreateSkillsFromTemplate)

        await user.click(screen.getByRole('button', { name: /set up skill/i }))

        expect(onCreateSkillsFromTemplate).toHaveBeenCalledTimes(1)
    })
})
