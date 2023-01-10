import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'

import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {ticketsCreatedPerHourPerWeekday} from 'fixtures/stats'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'
import TagsStatsFilter from 'pages/stats/TagsStatsFilter'
import useStatResource from 'pages/stats/useStatResource'
import {RootState, StoreDispatch} from 'state/types'
import SupportPerformanceWeeklyTicketLoad from '../SupportPerformanceWeeklyTicketLoad'

jest.mock(
    'pages/stats/TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock('pages/stats/useStatResource')
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

describe('<SupportPerformanceWeeklyTicketLoad />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    const useStatResourceMock = useStatResource as jest.MockedFunction<
        typeof useStatResource
    >
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
    })

    it('should render the page', () => {
        useStatResourceMock.mockImplementation(() => {
            return [ticketsCreatedPerHourPerWeekday, false, _noop]
        })
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceWeeklyTicketLoad />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
