import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { agents } from 'fixtures/agents'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters } from 'models/stat/types'
import TeamAverageCallsCountCell from 'pages/stats/voice/components/VoiceAgentsTable/TeamAverageCallsCountCell'
import { useTotalCallsMetric } from 'pages/stats/voice/hooks/agentMetrics'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as agentPerformanceInitialState } from 'state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const renderComponent = (mockUseMetric: typeof useTotalCallsMetric) => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2023-12-11T00:00:00.000Z',
            end_datetime: '2023-12-11T23:59:59.999Z',
        },
        agents: withDefaultLogicalOperator([agents[0].id]),
    }
    const state = {
        stats: {
            filters: statsFilters,
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: statsFilters,
                    isFilterDirty: false,
                },
                fetchingMap: {},
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
    } as RootState

    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <TeamAverageCallsCountCell
                    agentsCount={10}
                    useMetric={mockUseMetric}
                />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('TeamAverageCallsCountCell', () => {
    it('should render not available label', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: null, decile: null, allData: [] },
        })

        const { getByText } = renderComponent(useMetricMock)
        expect(getByText('-')).toBeInTheDocument()
    })

    it('should render average talk time', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 12, decile: null, allData: [] },
        })

        const { getByText } = renderComponent(useMetricMock)
        expect(getByText('1.2')).toBeInTheDocument()
    })

    it('should render loader', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: true,
            isError: false,
            data: { value: 125, decile: null, allData: [] },
        })

        const { container } = renderComponent(useMetricMock)
        expect(
            container.getElementsByClassName('react-loading-skeleton'),
        ).toHaveLength(1)
    })
})
