import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'

import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useInsightPerformanceMetrics } from 'hooks/reporting/automate/useAIAgentInsightsL2Dataset'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { Level2IntentsPerformance } from 'pages/aiAgent/insights/Level2IntentsPerformance/Level2IntentsPerformance'
import { getPageStatsFilters } from 'state/stats/selectors'
import { assumeMock } from 'utils/testing'

import { IntentsPerformanceProps } from '../widgets/IntentsPerformance/IntentsPerformance'

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
}))

jest.mock('hooks/reporting/automate/useAIAgentInsightsL2Dataset')
jest.mock('hooks/reporting/automate/useAutomateFilters')
jest.mock('hooks/useAppSelector')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
jest.mock('state/stats/selectors')
jest.mock('hooks/reporting/automate/useAIAgentUserId')
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations')
const useGetTicketChannelsStoreIntegrationsMock = assumeMock(
    useGetTicketChannelsStoreIntegrations,
)

describe('Level2IntentsPerformance', () => {
    const mockUseParams = assumeMock(useParams)
    const mockUseInsightPerformanceMetrics = assumeMock(
        useInsightPerformanceMetrics,
    )
    const mockUseNewAutomateFilters = assumeMock(useAutomateFilters)
    const mockUseAppSelector = assumeMock(useAppSelector)
    const mockUseGetCustomTicketsFieldsDefinitionData = assumeMock(
        useGetCustomTicketsFieldsDefinitionData,
    )
    const mockGetPageStatsFilters = assumeMock(getPageStatsFilters)

    beforeEach(() => {
        mockUseParams.mockReturnValue({ intentId: 'intentA' })
        mockUseInsightPerformanceMetrics.mockReturnValue({
            successRateUpliftOpportunityPerIntent: {
                data: { value: 10, prevValue: 5 },
                isFetching: false,
                isError: false,
            },
            ticketsPerIntent: {
                data: { value: 20, prevValue: 15 },
                isFetching: false,
                isError: false,
            },
            successRatePerIntent: {
                data: { value: 0.8, prevValue: 0.75 },
                isFetching: false,
                isError: false,
            },
            customerSatisfactionPerIntent: {
                data: { value: 4.5, prevValue: 4.0 },
                isFetching: false,
                isError: false,
            },
        })
        mockUseNewAutomateFilters.mockReturnValue({
            userTimezone: 'UTC',
            statsFilters: {
                period: {
                    start_datetime: '2021-01-01',
                    end_datetime: '2021-01-31',
                },
            },
            granularity: ReportingGranularity.Day,
        })
        mockUseAppSelector.mockReturnValue({
            period: {
                start_datetime: '2021-01-01',
                end_datetime: '2021-01-31',
            },
        })
        mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
            intentCustomFieldId: 1,
            outcomeCustomFieldId: 2,
        })
        mockGetPageStatsFilters.mockReturnValue({
            period: {
                start_datetime: '2021-01-01',
                end_datetime: '2021-01-31',
            },
        })

        useGetTicketChannelsStoreIntegrationsMock.mockReturnValue(['1'])
    })

    it('renders correctly with valid data', () => {
        const { result } = renderHook(() => Level2IntentsPerformance())
        const componentProps = result.current
            .props as unknown as IntentsPerformanceProps
        const metrics = componentProps.metrics

        expect(metrics[0].title).toBe('Success rate uplift opportunity')
        expect(metrics[0].trend.data?.value).toBe(10)
        expect(metrics[0]?.trend.data?.prevValue).toBe(5)

        expect(metrics[1].title).toBe('Tickets')
        expect(metrics[1].trend.data?.value).toBe(20)
        expect(metrics[1]?.trend.data?.prevValue).toBe(15)

        expect(metrics[2].title).toBe('Success rate')
        expect(metrics[2].trend.data?.value).toBe(0.8)
        expect(metrics[2].trend.data?.prevValue).toBe(0.75)

        expect(metrics[3].title).toBe('Customer satisfaction')
        expect(metrics[3].trend.data?.value).toBe(4.5)
        expect(metrics[3].trend.data?.prevValue).toBe(4.0)
    })

    it('handles missing intentId', () => {
        mockUseParams.mockReturnValue({ intentId: undefined })
        const { result } = renderHook(() => Level2IntentsPerformance())
        const componentProps = result.current
            .props as unknown as IntentsPerformanceProps
        const sectionSubtitle = componentProps.sectionSubtitle

        expect(sectionSubtitle).toBeUndefined()
    })

    it('handles fetching state', () => {
        mockUseInsightPerformanceMetrics.mockReturnValue({
            successRateUpliftOpportunityPerIntent: {
                data: { value: 10, prevValue: 5 },
                isFetching: true,
                isError: false,
            },
            ticketsPerIntent: {
                data: { value: 20, prevValue: 15 },
                isFetching: true,
                isError: false,
            },
            successRatePerIntent: {
                data: { value: 0.8, prevValue: 0.75 },
                isFetching: true,
                isError: false,
            },
            customerSatisfactionPerIntent: {
                data: { value: 4.5, prevValue: 4.0 },
                isFetching: true,
                isError: false,
            },
        })
        const { result } = renderHook(() => Level2IntentsPerformance())
        const componentProps = result.current
            .props as unknown as IntentsPerformanceProps
        const metrics = componentProps.metrics

        expect(metrics[0].trend.isFetching).toBe(true)
        expect(metrics[1].trend.isFetching).toBe(true)
        expect(metrics[2].trend.isFetching).toBe(true)
        expect(metrics[3].trend.isFetching).toBe(true)
    })

    it('handles error state', () => {
        mockUseInsightPerformanceMetrics.mockReturnValue({
            successRateUpliftOpportunityPerIntent: {
                data: { value: 10, prevValue: 5 },
                isFetching: false,
                isError: true,
            },
            ticketsPerIntent: {
                data: { value: 20, prevValue: 15 },
                isFetching: false,
                isError: true,
            },
            successRatePerIntent: {
                data: { value: 0.8, prevValue: 0.75 },
                isFetching: false,
                isError: true,
            },
            customerSatisfactionPerIntent: {
                data: { value: 4.5, prevValue: 4.0 },
                isFetching: false,
                isError: true,
            },
        })
        const { result } = renderHook(() => Level2IntentsPerformance())
        const componentProps = result.current
            .props as unknown as IntentsPerformanceProps
        const metrics = componentProps.metrics

        expect(metrics[0].trend.isError).toBe(true)
        expect(metrics[1].trend.isError).toBe(true)
        expect(metrics[2].trend.isError).toBe(true)
        expect(metrics[3].trend.isError).toBe(true)
    })
})
