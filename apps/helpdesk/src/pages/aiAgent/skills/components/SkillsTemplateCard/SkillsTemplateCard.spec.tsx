import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
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
type CoverageData =
    | {
          type: 'ticket-volume'
          ticketVolume: number
          ticketVolumePercent: number
      }
    | {
          type: 'automation-rate'
          automationRate: number
      }
type RenderProps = {
    onCTA?: () => void
    coverage?: {
        isLoading?: boolean
        hasAnyCoverage: boolean
        data: CoverageData | null
    } | null
}
const renderComponent = (props?: RenderProps) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <SkillsTemplateCard
                    skillTemplate={mockSkillTemplate}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
        {},
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
                    />
                </ThemeProvider>,
                {},
            )
            expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
        })
    })
    describe('coverage tag', () => {
        it('is not rendered when coverage prop is omitted', () => {
            renderComponent()
            expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        })
        it('is not rendered when coverage prop is null', () => {
            renderComponent({ coverage: null })
            expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        })
        it('shows a loading skeleton when coverage.isLoading is true', () => {
            renderComponent({
                coverage: {
                    isLoading: true,
                    hasAnyCoverage: true,
                    data: null,
                },
            })
            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
            expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
        })
        it('shows the ticket volume coverage label when ticket volume is greater than 0', () => {
            renderComponent({
                coverage: {
                    hasAnyCoverage: true,
                    data: {
                        type: 'ticket-volume',
                        ticketVolume: 2345,
                        ticketVolumePercent: 80,
                    },
                },
            })
            expect(
                screen.getByText('Would cover 2,345 (80%) of your tickets'),
            ).toBeInTheDocument()
        })
        it('shows the automation rate coverage label when automation rate is greater than 0', () => {
            renderComponent({
                coverage: {
                    hasAnyCoverage: true,
                    data: {
                        type: 'automation-rate',
                        automationRate: 6,
                    },
                },
            })
            expect(
                screen.getByText('Estimated impact: +6% automation rate'),
            ).toBeInTheDocument()
        })
        it('does not render any coverage label when data is null', () => {
            renderComponent({
                coverage: { hasAnyCoverage: true, data: null },
            })
            expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
            expect(
                screen.queryByText(/Estimated impact/i),
            ).not.toBeInTheDocument()
        })
        it('does not render any coverage label when ticket volume is 0', () => {
            renderComponent({
                coverage: {
                    hasAnyCoverage: true,
                    data: {
                        type: 'ticket-volume',
                        ticketVolume: 0,
                        ticketVolumePercent: 0,
                    },
                },
            })
            expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
        })
        it('does not render any coverage label when automation rate is 0', () => {
            renderComponent({
                coverage: {
                    hasAnyCoverage: true,
                    data: {
                        type: 'automation-rate',
                        automationRate: 0,
                    },
                },
            })
            expect(
                screen.queryByText(/Estimated impact/i),
            ).not.toBeInTheDocument()
        })
        it('does not render the coverage container when hasAnyCoverage is false and not loading', () => {
            renderComponent({
                coverage: {
                    hasAnyCoverage: false,
                    data: {
                        type: 'ticket-volume',
                        ticketVolume: 2345,
                        ticketVolumePercent: 80,
                    },
                },
            })
            expect(screen.queryByText(/Would cover/i)).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        })
        it('still renders the loading skeleton when hasAnyCoverage is false but loading', () => {
            renderComponent({
                coverage: {
                    isLoading: true,
                    hasAnyCoverage: false,
                    data: null,
                },
            })
            expect(screen.getByLabelText('Loading')).toBeInTheDocument()
        })
    })
    describe('intent display with long names', () => {
        it('shows only 1 intent when any formatted intent name has more than 2 non-slash words', () => {
            const longNameTemplate: SkillTemplate = {
                ...mockSkillTemplate,
                intents: [
                    {
                        name: 'shipping::delivered not received',
                        status: IntentStatus.NotLinked,
                        help_center_id: 0,
                        articles: [],
                    },
                    {
                        name: 'return::request',
                        status: IntentStatus.NotLinked,
                        help_center_id: 0,
                        articles: [],
                    },
                ],
            }
            render(
                <AxiomProvider rootNode={document.body}>
                    <ThemeProvider>
                        <SkillsTemplateCard skillTemplate={longNameTemplate} />
                    </ThemeProvider>
                </AxiomProvider>,
                {},
            )
            expect(
                screen.getByText('Shipping / Delivered Not Received'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Return / Request'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('+1')).toBeInTheDocument()
        })
    })
    describe('card click', () => {
        it('calls onCTA when the card is clicked and onCTA is provided', async () => {
            const user = userEvent.setup()
            const onCTA = jest.fn()
            renderComponent({ onCTA })
            await user.click(
                screen.getByText('Order status, tracking or delivery timing'),
            )
            expect(onCTA).toHaveBeenCalledTimes(1)
        })
        it('does not throw when the card is clicked and onCTA is not provided', async () => {
            const user = userEvent.setup()
            renderComponent()
            await user.click(
                screen.getByText('Order status, tracking or delivery timing'),
            )
        })
    })
})
