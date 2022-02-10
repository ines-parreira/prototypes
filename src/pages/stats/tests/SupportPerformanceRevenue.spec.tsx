import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {
    revenueOverview,
    revenuePerAgent,
    revenuePerDay,
    revenuePerTicket,
} from 'fixtures/stats'
import {renderWithRouter} from 'utils/testing'
import {
    REVENUE_OVERVIEW,
    REVENUE_PER_AGENT,
    REVENUE_PER_DAY,
} from 'config/stats'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'
import {integrationsStateWithShopify} from 'fixtures/integrations'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import {StatsFilters} from 'models/stat/types'

import TagsStatsFilter from '../TagsStatsFilter'
import useStatResource from '../useStatResource'
import SupportPerformanceRevenue from '../SupportPerformanceRevenue'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock(
    'pages/common/components/FeaturePaywall/FeaturePaywall',
    () =>
        ({feature}: ComponentProps<typeof FeaturePaywall>) => {
            return <div>Paywall for {feature}</div>
        }
)
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

describe('SupportPerformanceRevenue', () => {
    const defaultState = {
        currentAccount: fromJS(account),
        integrations: integrationsStateWithShopify,
        stats: fromJS({
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: [TicketChannel.Chat],
                integrations: [
                    (
                        integrationsStateWithShopify.getIn([
                            'integrations',
                            '0',
                        ]) as Map<any, any>
                    ).get('id'),
                ],
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
                case REVENUE_OVERVIEW:
                    return [revenueOverview, false, _noop]
                case REVENUE_PER_DAY:
                    return [revenuePerDay, false, _noop]
                case REVENUE_PER_AGENT:
                    return [revenuePerAgent, false, _noop]
                default:
                    return [revenuePerTicket, false, _noop]
            }
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceRevenue />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the paywall when the current account has no revenue statistics feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.RevenueStatistics, 'enabled'],
                false
            ),
        })
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceRevenue />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the restricted feature page when where are no store integrations', () => {
        const store = mockStore({
            ...defaultState,
            integrations: fromJS([]),
        })
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceRevenue />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
