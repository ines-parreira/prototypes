import React from 'react'

import { render } from '@testing-library/react'

import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useAIAgentMetrics } from 'hooks/reporting/automate/useAIAgentInsightsDataset'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'

import { IntentsPerformance } from '../IntentsPerformance/IntentsPerformance'
import { Level1IntentsPerformance } from './Level1IntentsPerformance'

jest.mock('../IntentsPerformance/IntentsPerformance', () => ({
    IntentsPerformance: jest.fn(() => <></>),
}))

jest.mock('hooks/reporting/automate/useAIAgentInsightsDataset')
const useAIAgentMetricsMock = useAIAgentMetrics as jest.Mock

jest.mock('hooks/reporting/automate/useAutomateFilters')
const useNewAutomateFiltersMock = useAutomateFilters as jest.Mock

jest.mock('state/stats/selectors')
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('hooks/reporting/automate/useAIAgentUserId')
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
    beforeEach(() => {
        useNewAutomateFiltersMock.mockReturnValue({ userTimezone: 'UTC' })

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
        expect(IntentsPerformance).toHaveBeenCalledWith(
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
        expect(IntentsPerformance).toHaveBeenCalledWith(
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
})
