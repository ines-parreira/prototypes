import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import _noop from 'lodash/noop'
import {TagFilterInstanceId} from 'models/stat/types'

import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {RootState, StoreDispatch} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {latestSatisfactionSurveys, satisfactionSurveys} from 'fixtures/stats'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'
import {renderWithRouter} from 'utils/testing'
import {SATISFACTION_SURVEYS} from 'config/stats'
import {integrationsState} from 'fixtures/integrations'
import {agents} from 'fixtures/agents'
import {teams} from 'fixtures/teams'
import {account} from 'fixtures/account'
import {AccountFeature} from 'state/currentAccount/types'
import FeaturePaywall from 'pages/common/components/FeaturePaywall/FeaturePaywall'

import useStatResource from 'hooks/reporting/useStatResource'
import SupportPerformanceSatisfaction from 'pages/stats/SupportPerformanceSatisfaction'
import DEPRECATED_TagsStatsFilter from 'pages/stats/common/filters/DEPRECATED_TagsStatsFilter'

jest.mock('hooks/reporting/useStatResource')
jest.mock('react-chartjs-2', () => ({Bar: () => <canvas />}))
jest.mock(
    'pages/stats/common/filters/DEPRECATED_TagsStatsFilter',
    () =>
        ({value}: ComponentProps<typeof DEPRECATED_TagsStatsFilter>) => (
            <div>TagsStatsFilterMock, value: {JSON.stringify(value)}</div>
        )
)
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))
jest.mock(
    'pages/common/components/FeaturePaywall/FeaturePaywall',
    () =>
        ({feature}: ComponentProps<typeof FeaturePaywall>) => {
            return <div>Paywall for {feature}</div>
        }
)
jest.mock(
    'pages/stats/common/filters/DEPRECATED_ChannelsStatsFilter',
    () => () => <div>ChannelsStatsFilter</div>
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
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
                channels: withDefaultLogicalOperator([TicketChannel.Chat]),
                integrations: withDefaultLogicalOperator([
                    integrationsState.integrations[0].id,
                ]),
                tags: [
                    {
                        ...withDefaultLogicalOperator([1]),
                        filterInstanceId: TagFilterInstanceId.First,
                    },
                ],
                agents: withDefaultLogicalOperator([agents[0].id]),
                score: withDefaultLogicalOperator(['2']),
            },
        },
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    beforeEach(() => {
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
            if (resourceName === SATISFACTION_SURVEYS) {
                return [satisfactionSurveys, false, _noop]
            }
            return [latestSatisfactionSurveys, false, _noop]
        })

        const {container} = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
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
