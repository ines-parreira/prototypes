import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS, Map} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'

import {RootState, StoreDispatch} from '../../../state/types'
import useStatResource from '../useStatResource'
import {TicketChannel} from '../../../business/types/ticket'
import {
    revenueOverview,
    revenuePerAgent,
    revenuePerDay,
    revenuePerTicket,
} from '../../../fixtures/stats'
import {renderWithRouter} from '../../../utils/testing'
import {
    REVENUE_OVERVIEW,
    REVENUE_PER_AGENT,
    REVENUE_PER_DAY,
} from '../../../config/stats'
import {integrationsStateWithShopify} from '../../../fixtures/integrations'
import {StatsFilterType} from '../../../state/stats/types'
import {agents} from '../../../fixtures/agents'
import {teams} from '../../../fixtures/teams'
import SupportPerformanceRevenue from '../SupportPerformanceRevenue'
import Paywall from '../../common/components/Paywall/Paywall'
import {account} from '../../../fixtures/account'
import TagsStatsFilter from '../TagsStatsFilter'
import {AccountFeature} from '../../../state/currentAccount/types'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock(
    '../../common/components/Paywall/Paywall',
    () =>
        ({feature}: ComponentProps<typeof Paywall>) => {
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
                <SupportPerformanceRevenue />
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
                        (
                            integrationsStateWithShopify.getIn([
                                'integrations',
                                '0',
                            ]) as Map<any, any>
                        ).get('id'),
                    ],
                    [StatsFilterType.Agents]: [agents[0].id],
                    [StatsFilterType.Tags]: [1],
                },
            }),
        })
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
            <Provider store={store}>
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
