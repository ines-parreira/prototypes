import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
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
import {StatsFilterType} from 'state/stats/types'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'

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
            filters: null,
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
    } as RootState

    beforeEach(() => {
        jest.clearAllMocks()
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <AutomationOverview />
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
                },
            }),
        })
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === AUTOMATION_OVERVIEW) {
                return [automationOverview, false, _noop]
            } else if (resourceName === AUTOMATION_FLOW) {
                return [automationFlow, false, _noop]
            }
            return [automationPerChannel, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <AutomationOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
