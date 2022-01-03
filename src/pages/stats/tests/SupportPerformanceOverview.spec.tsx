import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../state/types'
import useStatResource from '../useStatResource'
import {TicketChannel} from '../../../business/types/ticket'
import {
    firstResponseTime,
    resolutionTime,
    supportVolume,
    ticketsCreatedPerHourPerWeekday,
    totalMessagesSent,
} from '../../../fixtures/stats'
import {renderWithRouter} from '../../../utils/testing'
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
} from '../../../config/stats'
import {integrationsState} from '../../../fixtures/integrations'
import {StatsFilterType} from '../../../state/stats/types'
import {agents} from '../../../fixtures/agents'
import {teams} from '../../../fixtures/teams'
import {account} from '../../../fixtures/account'
import TagsStatsFilter from '../TagsStatsFilter'
import SupportPerformanceOverview from '../SupportPerformanceOverview'

jest.mock('../useStatResource')
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

describe('SupportPerformanceOverview', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS(integrationsState),
        stats: fromJS({
            filters: null,
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
        useStatResourceMock.mockReturnValue([null, true])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
        mathRandomSpy = jest.spyOn(Math, 'random').mockImplementation(() => 42)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
        mathRandomSpy.mockRestore()
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceOverview />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    [StatsFilterType.Period]: {
                        start_time: '2021-02-03T00:00:00.000Z',
                        end_time: '2021-02-03T23:59:59.999Z',
                    },
                    [StatsFilterType.Channels]: [TicketChannel.Chat],
                    [StatsFilterType.Integrations]: [
                        integrationsState.integrations[0].id,
                    ],
                    [StatsFilterType.Agents]: [agents[0].id],
                    [StatsFilterType.Tags]: [1],
                },
            }),
        })
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
                    return [totalMessagesSent, false]
                case SUPPORT_VOLUME:
                    return [supportVolume, false]
                case RESOLUTION_TIME:
                    return [resolutionTime, false]
                case FIRST_RESPONSE_TIME:
                    return [firstResponseTime, false]
                default:
                    return [ticketsCreatedPerHourPerWeekday, false]
            }
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <SupportPerformanceOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
