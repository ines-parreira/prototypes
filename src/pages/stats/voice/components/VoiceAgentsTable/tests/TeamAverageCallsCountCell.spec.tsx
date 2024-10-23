import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockFlags} from 'jest-launchdarkly-mock'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import {RootState, StoreDispatch} from 'state/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {agents} from 'fixtures/agents'
import {AGENT_PERFORMANCE_SLICE_NAME} from 'state/ui/stats/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {useTotalCallsMetric} from 'pages/stats/voice/hooks/agentMetrics'
import {FeatureFlagKey} from 'config/featureFlags'
import TeamAverageCallsCountCell from 'pages/stats/voice/components/VoiceAgentsTable/TeamAverageCallsCountCell'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const renderComponent = (mockUseMetric: typeof useTotalCallsMetric) => {
    const statsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2023-12-11T00:00:00.000Z',
            end_datetime: '2023-12-11T23:59:59.999Z',
        },
        agents: [agents[0].id],
    }
    const state = {
        stats: {
            filters: statsFilters,
        },
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: fromLegacyStatsFilters(statsFilters),
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
        </QueryClientProvider>
    )
}

describe('TeamAverageCallsCountCell', () => {
    it('should render not available label', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: null, decile: null, allData: []},
        })

        const {getByText} = renderComponent(useMetricMock)
        expect(getByText('-')).toBeInTheDocument()
    })

    it('should render average talk time', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        const {getByText} = renderComponent(useMetricMock)
        expect(getByText('1.2')).toBeInTheDocument()
    })

    it('should render loader', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: true,
            isError: false,
            data: {value: 125, decile: null, allData: []},
        })

        const {container} = renderComponent(useMetricMock)
        expect(container.getElementsByClassName('skeleton')).toHaveLength(1)
    })
})

describe('TeamAverageCallsCountCell with the new filters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
        })
    })

    it('renders the component with the new filters', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        const {getByText} = renderComponent(useMetricMock)
        expect(getByText('1.2')).toBeInTheDocument()
    })
})
