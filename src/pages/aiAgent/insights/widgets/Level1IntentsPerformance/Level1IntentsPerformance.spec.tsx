import { render, screen } from '@testing-library/react'

import { useAIAgentMetrics } from 'domains/reporting/hooks/automate/useAIAgentInsightsDataset'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { MISSING_AI_AGENT_USER_ID } from 'domains/reporting/hooks/automate/utils'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { IntentsPerformance } from 'pages/aiAgent/insights/widgets/IntentsPerformance/IntentsPerformance'
import { Level1IntentsPerformance } from 'pages/aiAgent/insights/widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/aiAgent/insights/widgets/IntentsPerformance/IntentsPerformance',
)
const IntentPerformanceMock = assumeMock(IntentsPerformance)

jest.mock('domains/reporting/hooks/automate/useAIAgentInsightsDataset')
const useAIAgentMetricsMock = useAIAgentMetrics as jest.Mock

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useAutomateFiltersMock = useAutomateFilters as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

jest.mock('domains/reporting/state/stats/selectors')

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(() => ({
            intentCustomFieldId: 'intentCustomFieldId',
            outcomeCustomFieldId: 'outcomeCustomFieldId',
        })),
    }),
)

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({ shopName: 'shopName' })),
}))
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations')
const useGetTicketChannelsStoreIntegrationsMock = assumeMock(
    useGetTicketChannelsStoreIntegrations,
)
const aiAgentAutomatedInteractionTrend = {
    data: {
        isFetching: false,
        isError: false,
        data: { value: 420, prevValue: 450 },
    },
    isError: false,
    isFetching: false,
}

const aiAgentCSAT = {
    data: { prevValue: 3.5, value: 3.7 },
    isError: false,
    isFetching: true,
}

const aiAgentSuccessRate = {
    data: { prevValue: 0.23, value: 0.3 },
    isError: true,
    isFetching: false,
}

const coverageTrend = {
    data: {
        isFetching: false,
        isError: false,
        data: { value: 30, prevValue: 27 },
    },
    isError: false,
    isFetching: false,
}

describe('OptimizeContainer', () => {
    const aiAgentUserId = 123
    const shopName = 'shopName'

    beforeEach(() => {
        useAIAgentUserIdMock.mockReturnValue(aiAgentUserId)
        useAutomateFiltersMock.mockReturnValue({ userTimezone: 'UTC' })

        useAppSelectorMock.mockReturnValueOnce({
            period: {
                start_datetime: '2024-12-13T00:00:00.000',
                end_datetime: '2024-12-20T00:00:00.000',
            },
        })
        useGetTicketChannelsStoreIntegrationsMock.mockReturnValue(['1'])
    })

    it('renders the component correctly', () => {
        useAIAgentMetricsMock.mockReturnValueOnce({
            aiAgentAutomatedInteractionTrend,
            aiAgentCSAT,
            aiAgentSuccessRate,
            coverageTrend,
        })

        render(<Level1IntentsPerformance />)

        expect(useAIAgentMetrics).toHaveBeenCalledWith(
            {
                period: {
                    start_datetime: '2024-12-13T00:00:00.000',
                    end_datetime: '2024-12-20T00:00:00.000',
                },
            },
            'UTC',
            shopName,
            aiAgentUserId,
        )
        expect(IntentPerformanceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                period: {
                    start_datetime: '2024-12-13T00:00:00.000',
                    end_datetime: '2024-12-20T00:00:00.000',
                },
                metrics: [
                    expect.objectContaining({
                        title: 'Coverage rate',
                        trend: coverageTrend,
                    }),
                    expect.objectContaining({
                        title: 'Automated interactions',
                        trend: aiAgentAutomatedInteractionTrend,
                    }),
                    expect.objectContaining({
                        title: 'Success rate',
                        trend: aiAgentSuccessRate,
                    }),
                    expect.objectContaining({
                        title: 'Customer satisfaction',
                        trend: aiAgentCSAT,
                    }),
                ],
            }),
            {},
        )
    })

    it('passes placeholder Ai Agent id when the Bot is missing', () => {
        useAIAgentUserIdMock.mockReturnValue(undefined)
        useAIAgentMetricsMock.mockReturnValueOnce({
            aiAgentAutomatedInteractionTrend,
            aiAgentCSAT,
            aiAgentSuccessRate,
            coverageTrend,
        })

        render(<Level1IntentsPerformance />)

        expect(useAIAgentMetrics).toHaveBeenCalledWith(
            {
                period: {
                    start_datetime: '2024-12-13T00:00:00.000',
                    end_datetime: '2024-12-20T00:00:00.000',
                },
            },
            'UTC',
            shopName,
            MISSING_AI_AGENT_USER_ID,
        )
    })

    it('renders the component correctly with loading and error', () => {
        useAIAgentMetricsMock.mockReturnValueOnce({
            aiAgentAutomatedInteractionTrend: {
                ...aiAgentAutomatedInteractionTrend,
                isLoading: true,
            },
            aiAgentCSAT: {
                ...aiAgentCSAT,
                data: {
                    ...aiAgentCSAT.data,
                    value: 2,
                },
            },
            aiAgentSuccessRate: {
                ...aiAgentSuccessRate,
                data: {
                    ...aiAgentCSAT.data,
                    value: 0,
                },
            },
            coverageTrend: {
                ...coverageTrend,
                isLoading: true,
            },
        })

        render(<Level1IntentsPerformance />)

        expect(IntentPerformanceMock).toHaveBeenCalledWith(
            expect.objectContaining({
                period: {
                    start_datetime: '2024-12-13T00:00:00.000',
                    end_datetime: '2024-12-20T00:00:00.000',
                },
                metrics: [
                    expect.objectContaining({
                        title: 'Coverage rate',
                        trend: {
                            ...coverageTrend,
                            isLoading: true,
                        },
                    }),
                    expect.objectContaining({
                        title: 'Automated interactions',
                        trend: {
                            ...aiAgentAutomatedInteractionTrend,
                            isLoading: true,
                        },
                    }),
                    expect.objectContaining({
                        title: 'Success rate',
                        trend: {
                            ...aiAgentSuccessRate,
                            data: {
                                ...aiAgentCSAT.data,
                                value: 0,
                            },
                        },
                    }),
                    expect.objectContaining({
                        title: 'Customer satisfaction',
                        trend: {
                            ...aiAgentCSAT,
                            data: {
                                ...aiAgentCSAT.data,
                                value: 2,
                            },
                        },
                    }),
                ],
            }),
            {},
        )
    })

    describe('hasAiAgentTicket and AIBanner', () => {
        it('should not render AIBanner when hasAiAgentTicket is true', () => {
            useAIAgentMetricsMock.mockReturnValueOnce({
                aiAgentAutomatedInteractionTrend,
                aiAgentCSAT,
                aiAgentSuccessRate,
                coverageTrend: {
                    data: {
                        value: 1,
                        prevValue: 0,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            render(<Level1IntentsPerformance />)

            expect(
                screen.queryByText(
                    'There are no AI Agent interactions for the selected date range.',
                ),
            ).not.toBeInTheDocument()
        })

        it('should render AIBanner when hasAiAgentTicket is false', () => {
            useAIAgentMetricsMock.mockReturnValueOnce({
                aiAgentAutomatedInteractionTrend,
                aiAgentCSAT,
                aiAgentSuccessRate,
                coverageTrend: {
                    data: {
                        value: 0,
                        prevValue: 0,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            render(<Level1IntentsPerformance />)

            expect(
                screen.getByText(
                    'There are no AI Agent interactions for the selected date range.',
                ),
            ).toBeInTheDocument()
        })

        it('should render AIBanner when coverageTrend data is null', () => {
            useAIAgentMetricsMock.mockReturnValueOnce({
                aiAgentAutomatedInteractionTrend,
                aiAgentCSAT,
                aiAgentSuccessRate,
                coverageTrend: {
                    data: {
                        value: null,
                        prevValue: null,
                    },
                    isError: false,
                    isFetching: false,
                },
            })

            render(<Level1IntentsPerformance />)

            expect(
                screen.getByText(
                    'There are no AI Agent interactions for the selected date range.',
                ),
            ).toBeInTheDocument()
        })
    })
})
