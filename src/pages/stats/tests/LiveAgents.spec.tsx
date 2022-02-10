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
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import {StatsFilters} from 'models/stat/types'

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
    'pages/common/components/FeaturePaywall/FeaturePaywall',
    () =>
        ({feature}: ComponentProps<typeof FeaturePaywall>) => {
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
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
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
    })

    it('should render the filters and stats when stats filters are defined', () => {
        useStatResourceMock.mockImplementation(() => {
            return [userPerformanceOverview, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
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
                    period: {
                        start_datetime: '2021-02-03T00:00:00.000Z',
                        end_datetime: '2021-02-03T23:59:59.999Z',
                    },
                } as StatsFilters,
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
