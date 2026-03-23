import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import { SkillsTemplateCard } from './SkillsTemplateCard'

const mockSkillTemplate: SkillTemplate = {
    id: 'order-status',
    name: 'Order status, tracking or delivery timing',
    guidanceId: 'order-status-guidance',
    tag: 'Order',
    style: {
        color: 'content-accent-default',
        background: 'surface-accent-default',
    },
    intents: [
        {
            name: 'order::status',
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
        },
        {
            name: 'shipping::delay',
            status: IntentStatus.Linked,
            help_center_id: 0,
            articles: [],
        },
        {
            name: 'order::cancel',
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
        },
    ],
}

const renderComponent = (
    props?: {
        hasStats?: boolean
        hasCTA?: boolean
        hasActiveCTA?: boolean
    },
    onCreateSkillsFromTemplate = jest.fn(),
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <SkillsTemplateCard
                    skillTemplate={mockSkillTemplate}
                    onCreateSkillsFromTemplate={onCreateSkillsFromTemplate}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('SkillsTemplateCard', () => {
    it('renders the skill template name', () => {
        renderComponent()

        expect(
            screen.getByText('Order status, tracking or delivery timing'),
        ).toBeInTheDocument()
    })

    describe('intent tags', () => {
        it('renders a maximum of 2 intent tags', () => {
            renderComponent()

            expect(screen.getByText('Order / Status')).toBeInTheDocument()
            expect(screen.getByText('Shipping / Delay')).toBeInTheDocument()
            expect(screen.queryByText('Order / Cancel')).not.toBeInTheDocument()
        })

        it('shows the remaining count when there are more than 2 intents', () => {
            renderComponent()

            expect(screen.getByText('+1')).toBeInTheDocument()
        })

        it('shows a tooltip with the hidden intent names on hover', async () => {
            jest.useFakeTimers()
            renderComponent()

            const tooltipTrigger = screen
                .getByText('+1')
                .closest('[data-name="tooltip-trigger"]') as HTMLElement

            await act(async () => {
                tooltipTrigger.focus()
                jest.runAllTimers()
            })

            expect(
                screen.getByRole('tooltip', { hidden: true }),
            ).toHaveTextContent('Order / Cancel')

            jest.useRealTimers()
        })

        it('does not show a remaining count when there are 2 or fewer intents', () => {
            render(
                <ThemeProvider>
                    <SkillsTemplateCard
                        skillTemplate={{
                            ...mockSkillTemplate,
                            intents: mockSkillTemplate.intents.slice(0, 2),
                        }}
                        onCreateSkillsFromTemplate={jest.fn()}
                    />
                </ThemeProvider>,
            )

            expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
        })
    })

    describe('stats section', () => {
        it('is not rendered by default', () => {
            renderComponent()

            expect(screen.queryByText('Ticket volume')).not.toBeInTheDocument()
            expect(screen.queryByText('Handover')).not.toBeInTheDocument()
        })

        it('is rendered when hasStats is true', () => {
            renderComponent({ hasStats: true })

            expect(screen.getByText('Ticket volume')).toBeInTheDocument()
            expect(screen.getByText('Handover')).toBeInTheDocument()
        })
    })

    describe('CTA button', () => {
        it('is not rendered by default', () => {
            renderComponent()

            expect(
                screen.queryByRole('button', { name: /set up skill/i }),
            ).not.toBeInTheDocument()
        })

        it('is rendered when hasCTA is true', () => {
            renderComponent({ hasCTA: true })

            expect(
                screen.getByRole('button', { name: /set up skill/i }),
            ).toBeInTheDocument()
        })

        it('calls onCreateSkillsFromTemplate when clicked', async () => {
            const user = userEvent.setup()
            const onCreateSkillsFromTemplate = jest.fn()
            renderComponent({ hasCTA: true }, onCreateSkillsFromTemplate)

            await user.click(
                screen.getByRole('button', { name: /set up skill/i }),
            )

            expect(onCreateSkillsFromTemplate).toHaveBeenCalledTimes(1)
        })
    })

    describe('card click', () => {
        it('calls onCreateSkillsFromTemplate when the card is clicked and hasCTA is false', async () => {
            const user = userEvent.setup()
            const onCreateSkillsFromTemplate = jest.fn()
            renderComponent({ hasCTA: false }, onCreateSkillsFromTemplate)

            await user.click(
                screen.getByText('Order status, tracking or delivery timing'),
            )

            expect(onCreateSkillsFromTemplate).toHaveBeenCalledTimes(1)
        })

        it('does not call onCreateSkillsFromTemplate when the card is clicked and hasCTA is true', async () => {
            const user = userEvent.setup()
            const onCreateSkillsFromTemplate = jest.fn()
            renderComponent({ hasCTA: true }, onCreateSkillsFromTemplate)

            await user.click(
                screen.getByText('Order status, tracking or delivery timing'),
            )

            expect(onCreateSkillsFromTemplate).not.toHaveBeenCalled()
        })
    })
})
