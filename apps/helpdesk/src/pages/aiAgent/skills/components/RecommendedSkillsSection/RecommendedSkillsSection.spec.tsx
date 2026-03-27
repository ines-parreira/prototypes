import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useIntentsMetrics } from 'pages/aiAgent/skills/hooks/useIntentsMetrics'
import { useTotalAiAgentTickets } from 'pages/aiAgent/skills/hooks/useTotalAiAgentTickets'
import { IntentStatus } from 'pages/aiAgent/skills/types'
import type { Intent, SkillTemplate } from 'pages/aiAgent/skills/types'

import { RecommendedSkillsSection } from './RecommendedSkillsSection'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

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
jest.mock('pages/aiAgent/skills/hooks/useIntentsMetrics', () => ({
    useIntentsMetrics: jest.fn(),
}))
jest.mock('pages/aiAgent/skills/hooks/useTotalAiAgentTickets', () => ({
    useTotalAiAgentTickets: jest.fn(),
}))
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

const mockUseIntentsMetrics = useIntentsMetrics as jest.Mock
const mockUseTotalAiAgentTickets = useTotalAiAgentTickets as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetCustomTicketsFieldsDefinitionData =
    useGetCustomTicketsFieldsDefinitionData as jest.Mock

const makeTemplate = (
    id: string,
    name: string,
    intentName: Intent['name'],
): SkillTemplate => ({
    id,
    name,
    guidanceId: `${id}-guidance`,
    intents: [
        {
            name: intentName,
            status: IntentStatus.NotLinked,
            help_center_id: 0,
            articles: [],
        },
    ],
})

const mockTemplates: SkillTemplate[] = [
    makeTemplate('order-status', 'Order Status', 'order::status'),
    makeTemplate('order-cancel', 'Order Cancellations', 'order::cancel'),
    makeTemplate('returns', 'Returns and Exchanges', 'return::request'),
]

const defaultMetricsDateRange = {
    start_datetime: '2024-01-01T00:00:00.000Z',
    end_datetime: '2024-01-28T23:59:59.000Z',
}

const renderComponent = (
    skillsTemplates = mockTemplates,
    onCreateSkillsFromTemplate = jest.fn(),
): ReturnType<typeof render> =>
    render(
        <Provider store={store}>
            <AxiomProvider rootNode={document.body}>
                <ThemeProvider>
                    <RecommendedSkillsSection
                        skillsTemplates={skillsTemplates}
                        onCreateSkillsFromTemplate={onCreateSkillsFromTemplate}
                    />
                </ThemeProvider>
            </AxiomProvider>
        </Provider>,
    )

describe('RecommendedSkillsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: { storeName: 'test-store' },
        })
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
        })
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map(),
            isLoading: false,
            metricsDateRange: defaultMetricsDateRange,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 0 })
    })

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

    it('renders a card for each template', () => {
        renderComponent()

        expect(screen.getByText('Order Status')).toBeInTheDocument()
        expect(screen.getByText('Order Cancellations')).toBeInTheDocument()
        expect(screen.getByText('Returns and Exchanges')).toBeInTheDocument()
    })

    it('renders scroll left and right buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Scroll left' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Scroll right' }),
        ).toBeInTheDocument()
    })

    it('scroll left button is disabled initially', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Scroll left' }),
        ).toBeDisabled()
    })

    it('shows loading skeletons for stats when metrics are loading', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map(),
            isLoading: true,
            metricsDateRange: defaultMetricsDateRange,
        })

        renderComponent()

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('shows the stats section on the card', () => {
        renderComponent()

        expect(screen.getAllByText('Ticket volume').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Handover').length).toBeGreaterThan(0)
    })

    it('calls onCreateSkillsFromTemplate when the CTA button is clicked', async () => {
        const user = userEvent.setup()
        const onCreateSkillsFromTemplate = jest.fn()
        renderComponent(mockTemplates, onCreateSkillsFromTemplate)

        await user.click(
            screen.getAllByRole('button', { name: /set up skill/i })[0],
        )

        expect(onCreateSkillsFromTemplate).toHaveBeenCalledTimes(1)
    })

    it('renders a "Set up skill" button for each template', () => {
        renderComponent()

        expect(
            screen.getAllByRole('button', { name: /set up skill/i }),
        ).toHaveLength(mockTemplates.length)
    })

    it('scroll right button is disabled initially', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Scroll right' }),
        ).toBeDisabled()
    })

    it('renders cards sorted by descending ticket volume', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 50,
                        handoverCount: 0,
                        ticketVolumePercent: 17,
                        handoverPercent: 0,
                    },
                ],
                [
                    'return::request',
                    {
                        ticketVolume: 150,
                        handoverCount: 0,
                        ticketVolumePercent: 50,
                        handoverPercent: 0,
                    },
                ],
                [
                    'order::cancel',
                    {
                        ticketVolume: 100,
                        handoverCount: 0,
                        ticketVolumePercent: 33,
                        handoverPercent: 0,
                    },
                ],
            ]),
            isLoading: false,
            metricsDateRange: defaultMetricsDateRange,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 300 })

        renderComponent()

        const orderStatus = screen.getByText('Order Status')
        const orderCancel = screen.getByText('Order Cancellations')
        const returns = screen.getByText('Returns and Exchanges')

        expect(
            returns.compareDocumentPosition(orderCancel) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
        expect(
            orderCancel.compareDocumentPosition(orderStatus) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
    })

    it('displays stats computed from metrics data', () => {
        mockUseIntentsMetrics.mockReturnValue({
            data: new Map([
                [
                    'order::status',
                    {
                        ticketVolume: 200,
                        handoverCount: 0,
                        ticketVolumePercent: 50,
                        handoverPercent: 0,
                    },
                ],
            ]),
            isLoading: false,
            metricsDateRange: defaultMetricsDateRange,
        })
        mockUseTotalAiAgentTickets.mockReturnValue({ totalCount: 400 })

        renderComponent()

        expect(screen.getByText('200 (50%)')).toBeInTheDocument()
    })
})
