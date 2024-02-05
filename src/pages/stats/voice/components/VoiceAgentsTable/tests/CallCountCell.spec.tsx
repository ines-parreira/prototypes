import React from 'react'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {User} from 'config/types/user'
import {RootState, StoreDispatch} from 'state/types'
import {StatsFilters} from 'models/stat/types'
import {agents} from 'fixtures/agents'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {useTotalCallsMetricPerAgent} from 'pages/stats/voice/hooks/metricsPerDimension'

import CallsCountCell from '../CallsCountCell'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('CallsCountCell', () => {
    const renderComponent = (
        mockUseMetric: typeof useTotalCallsMetricPerAgent
    ) => {
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2023-12-11T00:00:00.000Z',
                end_datetime: '2023-12-11T23:59:59.999Z',
            },
            agents: [agents[0].id],
        }
        const state = {
            stats: fromJS({
                filters: statsFilters,
            }),
            ui: {
                stats: {
                    cleanStatsFilters: statsFilters,
                    isFilterDirty: false,
                    fetchingMap: {},
                },
                agentPerformance: agentPerformanceInitialState,
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
                    />
                </Provider>
            </QueryClientProvider>
        )
    }

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
})
