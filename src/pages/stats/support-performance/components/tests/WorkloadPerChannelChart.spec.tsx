import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TicketChannel} from 'business/types/ticket'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {StatsFilters} from 'models/stat/types'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/components/WorkloadPerChannelChart'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {assumeMock} from 'utils/testing'
import GaugeChart from 'pages/stats/GaugeChart'

jest.mock('pages/stats/GaugeChart')
const gaugeChartMock = assumeMock(GaugeChart)

jest.mock('hooks/reporting/distributions')
const useWorkloadPerChannelDistributionMock = assumeMock(
    useWorkloadPerChannelDistribution
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<WorkloadPerChannelChart />', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }
    const defaultState = {
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    const workloadDistribution = {
        data: [
            {
                value: 200,
                label: TicketChannel.Email,
            },
            {
                value: 34,
                label: TicketChannel.Chat,
            },
        ],
    } as ReturnType<typeof useWorkloadPerChannelDistributionForPreviousPeriod>

    beforeEach(() => {
        jest.resetAllMocks()
        useWorkloadPerChannelDistributionMock.mockReturnValue(
            workloadDistribution
        )
        gaugeChartMock.mockImplementation(() => <div />)
    })

    it('should fetch data and render the chart', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>
        )

        expect(gaugeChartMock).toHaveBeenCalledWith(
            {
                data: workloadDistribution.data,
            },
            {}
        )
    })

    it('should render skeleton when no data', () => {
        useWorkloadPerChannelDistributionMock.mockReturnValue({
            data: undefined,
        } as any)
        render(
            <Provider store={mockStore(defaultState)}>
                <WorkloadPerChannelChart />
            </Provider>
        )
        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })
})
