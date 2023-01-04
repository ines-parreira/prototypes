import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    firstResponseTime,
    resolutionTime,
    supportVolume,
    ticketsCreatedPerHourPerWeekday,
    totalMessagesSent,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {
    FIRST_RESPONSE_TIME,
    MEDIAN_FIRST_RESPONSE_TIME,
    MEDIAN_RESOLUTION_TIME,
    RESOLUTION_TIME,
    SUPPORT_VOLUME,
    TOTAL_MESSAGES_RECEIVED,
    TOTAL_MESSAGES_SENT,
    TOTAL_ONE_TOUCH_TICKETS,
    TOTAL_TICKETS_CLOSED,
    TOTAL_TICKETS_CREATED,
    TOTAL_TICKETS_REPLIED,
} from 'config/stats'
import {integrationsState} from 'fixtures/integrations'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'
import {account} from 'fixtures/account'

import TagsStatsFilter from '../TagsStatsFilter'
import DEPRECATED_SupportPerformanceOverview from '../DEPRECATED_SupportPerformanceOverview'
import useStatResource from '../useStatResource'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({
    Bar: () => <canvas />,
    Line: () => <canvas />,
}))
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
let mathRandomSpy: jest.SpiedFunction<typeof Math.random>

describe('DEPRECATED_SupportPerformanceOverview', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [integrationsState.integrations[0].id],
                agents: [agents[0].id],
                tags: [1],
            } as StatsFilters,
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true, _noop])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
        mathRandomSpy = jest.spyOn(Math, 'random').mockImplementation(() => 42)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
        mathRandomSpy.mockRestore()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            switch (resourceName) {
                case TOTAL_TICKETS_CREATED:
                case TOTAL_TICKETS_REPLIED:
                case TOTAL_TICKETS_CLOSED:
                case TOTAL_MESSAGES_SENT:
                case TOTAL_MESSAGES_RECEIVED:
                case MEDIAN_FIRST_RESPONSE_TIME:
                case MEDIAN_RESOLUTION_TIME:
                case TOTAL_ONE_TOUCH_TICKETS:
                    return [totalMessagesSent, false, _noop]
                case SUPPORT_VOLUME:
                    return [supportVolume, false, _noop]
                case RESOLUTION_TIME:
                    return [resolutionTime, false, _noop]
                case FIRST_RESPONSE_TIME:
                    return [firstResponseTime, false, _noop]
                default:
                    return [ticketsCreatedPerHourPerWeekday, false, _noop]
            }
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <DEPRECATED_SupportPerformanceOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
