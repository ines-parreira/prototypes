import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockFlags} from 'jest-launchdarkly-mock'
import {User} from 'config/types/user'
import {RootState, StoreDispatch} from 'state/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {agents} from 'fixtures/agents'
import {AGENT_PERFORMANCE_SLICE_NAME} from 'state/ui/stats/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {useTotalCallsMetricPerAgent} from 'pages/stats/voice/hooks/metricsPerDimension'
import * as DrillDownModalTrigger from 'pages/stats/DrillDownModalTrigger'

import {VoiceAgentsMetric} from 'state/ui/stats/types'
import {FeatureFlagKey} from 'config/featureFlags'
import CallsCountCell from '../CallsCountCell'

const DrillDownModalTriggerSpy = jest.spyOn(
    DrillDownModalTrigger,
    'DrillDownModalTrigger'
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultMetricData = {
    metricName: VoiceAgentsMetric.AgentTotalCalls,
    title: 'Total calls',
}

const renderComponent = (
    mockUseMetric: typeof useTotalCallsMetricPerAgent,
    metricData: typeof defaultMetricData | null = defaultMetricData,
    isDrillDownEnabled?: boolean
) => {
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
            statsTables: {
                [AGENT_PERFORMANCE_SLICE_NAME]: agentPerformanceInitialState,
            },
            stats: {
                cleanStatsFilters: statsFilters,
                isFilterDirty: false,
                fetchingMap: {},
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
                <CallsCountCell
                    agent={agent}
                    useMetricPerAgent={mockUseMetric}
                    metricData={metricData || undefined}
                    isDrillDownEnabled={isDrillDownEnabled}
                />
            </Provider>
        </QueryClientProvider>
    )
}

describe('CallsCountCell', () => {
    beforeEach(() => {
        mockFlags({[FeatureFlagKey.VoiceCallsDrillDown]: true})
    })

    it('should render not available label', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: null, decile: null, allData: []},
        })

        const {getByText} = renderComponent(useMetricMock)
        expect(getByText('-')).toBeInTheDocument()
        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
            {}
        )
    })

    it('should render average talk time', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        const {getByText} = renderComponent(useMetricMock)
        expect(getByText('12')).toBeInTheDocument()
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

    it('should pass correct props to DrillDownModalTrigger', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        renderComponent(useMetricMock)

        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
            {}
        )
    })

    it('should not open drill down modal when isDrillDownEnabled is false', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        renderComponent(useMetricMock, defaultMetricData, false)

        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
            {}
        )
    })

    it('should not open drill down modal when drill down FF is disabled', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        mockFlags({[FeatureFlagKey.VoiceCallsDrillDown]: false})

        renderComponent(useMetricMock)

        expect(DrillDownModalTriggerSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
            {}
        )
    })

    it('should not render DrillDownModalTrigger when metricData is not provided', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        const {queryByText} = renderComponent(useMetricMock, null, false)

        expect(queryByText('12')).toBeInTheDocument()
        expect(DrillDownModalTriggerSpy).not.toHaveBeenCalled()
    })
})

describe('CallsCountCell with the new filters', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.VoiceCallsDrillDown]: true,
            [FeatureFlagKey.AnalyticsNewFiltersVoice]: true,
        })
    })

    it('should render average talk time', () => {
        const useMetricMock = jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        const {getByText} = renderComponent(useMetricMock)
        expect(getByText('12')).toBeInTheDocument()
    })
})
