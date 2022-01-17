import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render, fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {userPerformanceOverview} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {StatsFilterType} from 'state/stats/types'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import Paywall from 'pages/common/components/Paywall/Paywall'

import useStatResource from '../useStatResource'
import TagsStatsFilter from '../TagsStatsFilter'
import LiveAgents from '../LiveAgents'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock(
    'pages/common/components/Paywall/Paywall',
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

describe('LiveAgents', () => {
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
        useStatResourceMock.mockReturnValue([null, true, _noop])
    })

    it('should not render the filters nor the stats when stats filters are not defined', () => {
        const store = mockStore(defaultState)
        const {container} = render(
            <Provider store={store}>
                <LiveAgents />
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
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <LiveAgents />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the paywall when the current account has no user live statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.UsersLiveStatistics, 'enabled'],
                false
            ),
        })
        const {container} = render(
            <Provider store={store}>
                <LiveAgents />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch prev and next page when navigation buttons are clicked', () => {
        const store = mockStore({
            ...defaultState,
            stats: fromJS({
                filters: {
                    [StatsFilterType.Period]: {
                        start_time: '2021-02-03T00:00:00.000Z',
                        end_time: '2021-02-03T23:59:59.999Z',
                    },
                },
            }),
        })
        const fetchPage = jest.fn()
        useStatResourceMock.mockImplementation(() => {
            return [
                {
                    ...userPerformanceOverview,
                    meta: {
                        ...userPerformanceOverview.meta,
                        prev_cursor: 'prev-cursor',
                        next_cursor: 'next-cursor',
                    },
                },
                false,
                fetchPage,
            ]
        })

        const {getByText} = renderWithRouter(
            <Provider store={store}>
                <LiveAgents />
            </Provider>
        )
        fireEvent.click(getByText('keyboard_arrow_left'))
        fireEvent.click(getByText('keyboard_arrow_right'))

        expect(fetchPage.mock.calls).toMatchSnapshot()
    })
})
