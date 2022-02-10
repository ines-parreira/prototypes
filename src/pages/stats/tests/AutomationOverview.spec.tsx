import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    automationFlow,
    automationOverview,
    automationPerChannel,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {AUTOMATION_FLOW, AUTOMATION_OVERVIEW} from 'config/stats'
import {integrationsState} from 'fixtures/integrations'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'

import useStatResource from '../useStatResource'
import AutomationOverview from '../AutomationOverview'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => {
    const ChartComponent = () => <canvas />
    ChartComponent.Bar = () => <canvas />
    return ChartComponent
})
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('AutomationOverview', () => {
    const defaultState = {
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [integrationsState.integrations[0].id],
            } as StatsFilters,
        }),
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        entities: {
            selfServiceConfigurations: {},
        },
        billing: fromJS({plans: []}),
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === AUTOMATION_OVERVIEW) {
                return [automationOverview, false, _noop]
            } else if (resourceName === AUTOMATION_FLOW) {
                return [automationFlow, false, _noop]
            }
            return [automationPerChannel, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <AutomationOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
