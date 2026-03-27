import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'domains/reporting/hooks/automate/types'
import { IntentMetric } from 'domains/reporting/state/ui/stats/types'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { MetricCell } from 'pages/aiAgent/skills/components/SharedTableComponents/MetricCells'
import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import { SkillsTemplateCard } from './SkillsTemplateCard'

jest.mock(
    'pages/aiAgent/skills/components/SharedTableComponents/MetricCells',
    () => ({
        MetricCell: jest.fn(
            ({
                displayValue,
                showProgressBar,
                value,
            }: {
                displayValue: string
                showProgressBar?: boolean
                value: number
            }) => (
                <>
                    <span>{displayValue}</span>
                    {showProgressBar && (
                        <div role="progressbar" aria-valuenow={value} />
                    )}
                </>
            ),
        ),
    }),
)
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations', () => ({
    useGetTicketChannelsStoreIntegrations: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(),
    }),
)
jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
    () => ({
        getLast28DaysDateRange: jest.fn(() => ({
            start_datetime: '2024-01-01T00:00:00.000Z',
            end_datetime: '2024-01-28T23:59:59.000Z',
        })),
    }),
)

const mockMetricCell = MetricCell as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetTicketChannelsStoreIntegrations =
    useGetTicketChannelsStoreIntegrations as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock

const mockStore = configureMockStore([thunk])
const store = mockStore({})

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

const renderComponent = (
    props?: {
        hasStats?: boolean
        hasCTA?: boolean
        hasActiveCTA?: boolean
        stats?: {
            ticketVolume: number
            ticketVolumePercent: number
            handoverCount: number
            handoverPercent: number
        } | null
        isLoadingStats?: boolean
    },
    onCreateSkillsFromTemplate = jest.fn(),
) =>
    render(
        <Provider store={store}>
            <AxiomProvider rootNode={document.body}>
                <ThemeProvider>
                    <SkillsTemplateCard
                        skillTemplate={mockSkillTemplate}
                        onCreateSkillsFromTemplate={onCreateSkillsFromTemplate}
                        {...props}
                    />
                </ThemeProvider>
            </AxiomProvider>
        </Provider>,
    )

describe('SkillsTemplateCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { storeName: 'test-store' },
        })
        mockUseGetTicketChannelsStoreIntegrations.mockReturnValue(['store-1'])
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
        })
    })

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

        it('shows a tooltip on a linked intent tag on hover', async () => {
            jest.useFakeTimers()
            renderComponent()

            const linkedTagTrigger = screen
                .getByText('Shipping / Delay')
                .closest('[data-name="tooltip-trigger"]') as HTMLElement

            await act(async () => {
                linkedTagTrigger.focus()
                jest.runAllTimers()
            })

            expect(
                screen.getByRole('tooltip', { hidden: true }),
            ).toHaveTextContent('Intent already linked to an existing skill')

            jest.useRealTimers()
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
                <Provider store={store}>
                    <ThemeProvider>
                        <SkillsTemplateCard
                            skillTemplate={{
                                ...mockSkillTemplate,
                                intents: mockSkillTemplate.intents.slice(0, 2),
                            }}
                            onCreateSkillsFromTemplate={jest.fn()}
                        />
                    </ThemeProvider>
                </Provider>,
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

        it('shows loading skeletons when isLoadingStats is true', () => {
            renderComponent({ hasStats: true, isLoadingStats: true })

            expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
        })

        it('shows formatted ticket volume and handover stats when stats are provided', () => {
            renderComponent({
                hasStats: true,
                stats: {
                    ticketVolume: 1500,
                    ticketVolumePercent: 25,
                    handoverCount: 300,
                    handoverPercent: 20,
                },
            })

            expect(screen.getByText('1,500 (25%)')).toBeInTheDocument()
            expect(screen.getByText('300 (20%)')).toBeInTheDocument()
        })

        it('shows placeholder when hasStats is true but stats is null', () => {
            renderComponent({ hasStats: true, stats: null })

            expect(screen.getAllByText('--')).toHaveLength(2)
        })

        it('shows a progress bar when handoverCount is greater than 0', () => {
            renderComponent({
                hasStats: true,
                stats: {
                    ticketVolume: 100,
                    ticketVolumePercent: 10,
                    handoverCount: 30,
                    handoverPercent: 30,
                },
            })

            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })

        it('does not show a progress bar when handoverCount is 0', () => {
            renderComponent({
                hasStats: true,
                stats: {
                    ticketVolume: 100,
                    ticketVolumePercent: 10,
                    handoverCount: 0,
                    handoverPercent: 0,
                },
            })

            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })
    })

    describe('MetricCell integration', () => {
        const mockStats = {
            ticketVolume: 150,
            ticketVolumePercent: 25,
            handoverCount: 30,
            handoverPercent: 20,
        }

        it('passes correct props to MetricCell for ticket volume', () => {
            renderComponent({ hasStats: true, stats: mockStats })

            expect(mockMetricCell).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'intent',
                    metricName: IntentMetric.TicketVolume,
                    intentFieldValues: [
                        'order::status',
                        'shipping::delay',
                        'order::cancel',
                    ],
                    displayValue: '150 (25%)',
                    value: 150,
                    integrationIds: ['store-1'],
                    intentCustomFieldId: 1,
                    outcomeCustomFieldId: 2,
                }),
                expect.anything(),
            )
        })

        it('passes correct props to MetricCell for handover with outcomeValue', () => {
            renderComponent({ hasStats: true, stats: mockStats })

            expect(mockMetricCell).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'intent',
                    metricName: IntentMetric.Handover,
                    intentFieldValues: [
                        'order::status',
                        'shipping::delay',
                        'order::cancel',
                    ],
                    displayValue: '30 (20%)',
                    value: 20,
                    outcomeValue: CUSTOM_FIELD_AI_AGENT_HANDOVER,
                    showProgressBar: true,
                    isRow: true,
                }),
                expect.anything(),
            )
        })

        it('passes placeholder displayValue to MetricCell when stats is null', () => {
            renderComponent({ hasStats: true, stats: null })

            expect(mockMetricCell).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricName: IntentMetric.TicketVolume,
                    displayValue: '--',
                }),
                expect.anything(),
            )
            expect(mockMetricCell).toHaveBeenCalledWith(
                expect.objectContaining({
                    metricName: IntentMetric.Handover,
                    displayValue: '--',
                    showProgressBar: false,
                }),
                expect.anything(),
            )
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
                <Provider store={store}>
                    <AxiomProvider rootNode={document.body}>
                        <ThemeProvider>
                            <SkillsTemplateCard
                                skillTemplate={longNameTemplate}
                                onCreateSkillsFromTemplate={jest.fn()}
                            />
                        </ThemeProvider>
                    </AxiomProvider>
                </Provider>,
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
