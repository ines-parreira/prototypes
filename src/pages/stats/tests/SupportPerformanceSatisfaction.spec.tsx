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
    latestSatisfactionSurveys,
    satisfactionSurveys,
} from '../../../fixtures/stats'
import {renderWithRouter} from '../../../utils/testing'
import {SATISFACTION_SURVEYS} from '../../../config/stats'
import {integrationsState} from '../../../fixtures/integrations'
import {StatsFilterType} from '../../../state/stats/types'
import {agents} from '../../../fixtures/agents'
import {teams} from '../../../fixtures/teams'
import SupportPerformanceSatisfaction from '../SupportPerformanceSatisfaction'
import TagsStatsFilter from '../TagsStatsFilter'
import {account} from '../../../fixtures/account'
import {AccountFeature} from '../../../state/currentAccount/types'
import Paywall from '../../common/components/Paywall/Paywall'

jest.mock('../useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock(
    '../TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof TagsStatsFilter>) =>
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
)
jest.mock(
    '../../common/components/Paywall/Paywall',
    () =>
        ({feature}: ComponentProps<typeof Paywall>) => {
            return <div>Paywall for {feature}</div>
        }
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const useStatResourceMock = useStatResource as jest.MockedFunction<
    typeof useStatResource
>
let dateNowSpy: jest.SpiedFunction<typeof Date.now>
let mathRandomSpy: jest.SpiedFunction<typeof Math.random>

describe('SupportPerformanceSatisfaction', () => {
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
                <SupportPerformanceSatisfaction />
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
                    [StatsFilterType.Tags]: [1],
                    [StatsFilterType.Agents]: [agents[0].id],
                    [StatsFilterType.Score]: ['2'],
                },
            }),
        })
        useStatResourceMock.mockImplementation(({resourceName}) => {
            if (resourceName === SATISFACTION_SURVEYS) {
                return [satisfactionSurveys, false]
            }
            return [latestSatisfactionSurveys, false]
        })

        const {container} = renderWithRouter(
            <Provider store={store}>
                <SupportPerformanceSatisfaction />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the paywall when the current account has no satisfaction surveys feature', () => {
        const store = mockStore({
            ...defaultState,
            currentAccount: defaultState.currentAccount.setIn(
                ['features', AccountFeature.SatisfactionSurveys, 'enabled'],
                false
            ),
        })
        const {container} = render(
            <Provider store={store}>
                <SupportPerformanceSatisfaction />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
