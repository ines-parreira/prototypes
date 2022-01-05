import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {OPEN_TICKETS_ASSIGNMENT_STATUSES, USERS_STATUSES} from 'config/stats'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    openTicketsAssignmentStatuses,
    supportVolumePerHour,
    usersStatuses,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {StatsFilterType} from 'state/stats/types'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import Paywall from 'pages/common/components/Paywall/Paywall'

import LiveOverview from '../LiveOverview'
import useStatResource from '../useStatResource'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Line: () => <canvas />}))
jest.mock(
    '../../common/components/Paywall/Paywall',
    () =>
        ({feature}: ComponentProps<typeof Paywall>) => {
            return <div>Paywall for {feature}</div>
        }
)
jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>

describe('LiveOverview', () => {
    const defaultState = {
        currentAccount: fromJS(account),
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
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <LiveOverview />
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
                    [StatsFilterType.Agents]: [agents[0].id],
                },
            }),
        })
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === USERS_STATUSES) {
                return [usersStatuses, false]
            } else if (resourceName === OPEN_TICKETS_ASSIGNMENT_STATUSES) {
                return [openTicketsAssignmentStatuses, false]
            }
            return [supportVolumePerHour, false]
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <LiveOverview />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the paywall when the current account has no overview live statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.OverviewLiveStatistics, 'enabled'],
                false
            ),
        })
        const {container} = render(
            <Provider store={store}>
                <LiveOverview />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
