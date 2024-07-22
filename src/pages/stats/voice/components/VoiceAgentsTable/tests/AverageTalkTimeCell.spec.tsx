import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {User} from 'config/types/user'
import {RootState, StoreDispatch} from 'state/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {agents} from 'fixtures/agents'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {initialState as agentPerformanceInitialState} from 'state/ui/stats/agentPerformanceSlice'
import {useAverageTalkTimeMetricPerAgent} from 'pages/stats/voice/hooks/metricsPerDimension'

import AverageTalkTimeCell from '../AverageTalkTimeCell'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/voice/hooks/metricsPerDimension')
const useMetricMock = assumeMock(useAverageTalkTimeMetricPerAgent)

describe('AverageTalkTimeCell', () => {
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
                    <AverageTalkTimeCell agent={agent} />
                </Provider>
            </QueryClientProvider>
        )
    }

    it('should render not available label', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: null, decile: null, allData: []},
        })

        const {getByText} = renderComponent()
        expect(getByText('-')).toBeInTheDocument()
    })

    it('should render average talk time', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 12, decile: null, allData: []},
        })

        const {getByText} = renderComponent()
        expect(getByText('12s')).toBeInTheDocument()
    })

    it('should render transformed duration', () => {
        useMetricMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {value: 125, decile: null, allData: []},
        })

        const {getByText} = renderComponent()
        expect(getByText('2m 05s')).toBeInTheDocument()
    })

    it('should render loader', () => {
        useMetricMock.mockReturnValue({
            isFetching: true,
            isError: false,
            data: {value: 125, decile: null, allData: []},
        })

        const {container} = renderComponent()
        expect(container.getElementsByClassName('skeleton')).toHaveLength(1)
    })
})
