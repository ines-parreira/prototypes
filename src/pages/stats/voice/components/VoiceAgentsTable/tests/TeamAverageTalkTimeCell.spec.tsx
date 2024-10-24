import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {agents} from 'fixtures/agents'
import {LegacyStatsFilters} from 'models/stat/types'
import TeamAverageTalkTimeCell from 'pages/stats/voice/components/VoiceAgentsTable/TeamAverageTalkTimeCell'
import {useAverageTalkTimeMetric} from 'pages/stats/voice/hooks/agentMetrics'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {AGENT_PERFORMANCE_SLICE_NAME} from 'state/ui/stats/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/voice/hooks/agentMetrics')
const useMetricMock = assumeMock(useAverageTalkTimeMetric)

const renderComponent = () => {
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
                <TeamAverageTalkTimeCell />
            </Provider>
        </QueryClientProvider>
    )
}

describe('TeamAverageTalkTimeCell', () => {
    it('should render not available label', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: null},
        })

        const {getByText} = renderComponent()
        expect(getByText('-')).toBeInTheDocument()
    })

    it('should render average talk time', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12},
        })

        const {getByText} = renderComponent()
        expect(getByText('12s')).toBeInTheDocument()
    })

    it('should render transformed duration', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 125},
        })

        const {getByText} = renderComponent()
        expect(getByText('2m 05s')).toBeInTheDocument()
    })

    it('should render under 1s duration', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 0.7},
        })

        const {getByText} = renderComponent()
        expect(getByText('<1s')).toBeInTheDocument()
    })

    it('should render loader', () => {
        useMetricMock.mockReturnValue({
            isFetching: true,
            isError: false,
            data: {value: 125},
        })

        const {container} = renderComponent()
        expect(container.getElementsByClassName('skeleton')).toHaveLength(1)
    })
})

describe('TeamAverageTalkTimeCell with the new filters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
        })
    })

    it('should render the component with the new filters', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12},
        })

        const {getByText} = renderComponent()
        expect(getByText('12s')).toBeInTheDocument()
    })
})
