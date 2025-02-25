import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { FeatureFlagKey } from 'config/featureFlags'
import { User } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { LegacyStatsFilters } from 'models/stat/types'
import * as DrillDownModalTrigger from 'pages/stats/DrillDownModalTrigger'
import { useAverageTalkTimeMetricPerAgent } from 'pages/stats/voice/hooks/metricsPerDimension'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as agentPerformanceInitialState } from 'state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import { VoiceAgentsMetric } from 'state/ui/stats/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import AverageTalkTimeCell from '../AverageTalkTimeCell'

const DrillDownModalTriggerSpy = jest.spyOn(
    DrillDownModalTrigger,
    'DrillDownModalTrigger',
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/voice/hooks/metricsPerDimension')
const useMetricMock = assumeMock(useAverageTalkTimeMetricPerAgent)

const metricData = {
    metricName: VoiceAgentsMetric.AgentTotalCalls,
    title: 'Total calls',
}

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
    const agent = {
        id: 1,
        name: 'John Doe',
        email: '',
    } as User

    return render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(state)}>
                <AverageTalkTimeCell agent={agent} metricData={metricData} />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('AverageTalkTimeCell', () => {
    it('should render not available label', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: null, decile: null, allData: [] },
        })

        const { getByText } = renderComponent()
        expect(getByText('-')).toBeInTheDocument()
        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
            {},
        )
    })

    it('should render average talk time', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 12, decile: null, allData: [] },
        })

        const { getByText } = renderComponent()
        expect(getByText('12s')).toBeInTheDocument()
    })

    it('should render transformed duration', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 125, decile: null, allData: [] },
        })

        const { getByText } = renderComponent()
        expect(getByText('2m 05s')).toBeInTheDocument()
    })

    it('should render loader', () => {
        useMetricMock.mockReturnValue({
            isFetching: true,
            isError: false,
            data: { value: 125, decile: null, allData: [] },
        })

        const { container } = renderComponent()
        expect(
            container.getElementsByClassName('react-loading-skeleton'),
        ).toHaveLength(1)
    })
})

describe('AverageTalkTimeCell with the new filters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
        })
    })

    it('should render the component', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 12, decile: null, allData: [] },
        })

        const { getByText } = renderComponent()
        expect(getByText('12s')).toBeInTheDocument()
    })
})
