import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    ticketsClosedPerAgentPerDay,
    ticketsCreatedPerChannel,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {TICKETS_CLOSED_PER_AGENT_PER_DAY} from 'config/stats'
import {integrationsState} from 'fixtures/integrations'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'

import SupportPerformanceAgents from '../SupportPerformanceAgents'
import useStatResource from '../useStatResource'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>

describe('SupportPerformanceAgents', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [integrationsState.integrations[0].id],
                agents: [agents[0].id],
            } as StatsFilters,
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        entities: {
            tags: {},
        },
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true, _noop])
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => 1487076708000)
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === TICKETS_CLOSED_PER_AGENT_PER_DAY) {
                return [ticketsClosedPerAgentPerDay, false, _noop]
            }
            return [ticketsCreatedPerChannel, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceAgents />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
