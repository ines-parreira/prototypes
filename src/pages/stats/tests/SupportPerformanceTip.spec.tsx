import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {TicketChannel} from 'business/types/ticket'
import {account} from 'fixtures/account'
import {agents} from 'fixtures/agents'
import {integrationsState} from 'fixtures/integrations'
import {tags} from 'fixtures/tag'
import {teams} from 'fixtures/teams'
import {StatsFilters} from 'models/stat/types'
import {TipQualifier} from 'services/supportPerformanceTipService'
import {SupportPerformanceTip} from 'pages/stats/SupportPerformanceTip'
import * as PerformanceTipHook from 'hooks/reporting/usePerformanceTips'
import {MetricName} from 'services/reporting/constants'
import {AccountSettingType} from 'state/currentAccount/types'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as uiStatsInitialState} from 'state/ui/stats/reducer'

jest.mock('hooks/reporting/usePerformanceTips')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('SupportPerformanceTip', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }

    const tag = tags[0]
    const defaultAccount = {
        ...account,
        settings: [
            ...account.settings,
            {
                id: 123,
                type: AccountSettingType.SatisfactionSurveys,
                data: {
                    send_survey_for_chat: true,
                    send_survey_for_email: false,
                    survey_email_html: 'string',
                    survey_email_text: 'string',
                    survey_interval: 100,
                },
            },
        ],
    }
    const defaultState = {
        currentAccount: fromJS(defaultAccount),
        integrations: fromJS(integrationsState),
        stats: fromJS({
            filters: defaultStatsFilters,
        }),
        // stats: initialState,
        agents: fromJS({
            all: agents,
        }),
        teams: fromJS({
            all: teams,
        }),
        entities: {
            tags: {
                [tag.id]: tag,
            },
        },
        ui: {
            stats: uiStatsInitialState,
        },
    } as RootState

    it('should render tip from PerformanceTipProvider', () => {
        const metric = MetricName.MessagesPerTicket
        const average = '4.9'
        const topTen = '3.1'
        const content = 'some content'

        jest.spyOn(PerformanceTipHook, 'usePerformanceTips').mockReturnValue({
            type: TipQualifier.Success,
            content,
            average,
            topTen,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTip
                    metric={metric}
                    useTrend={() => ({
                        data: {
                            value: 5,
                            prevValue: 4,
                        },
                        isFetching: false,
                        isError: false,
                    })}
                />
            </Provider>
        )

        expect(screen.getByText(average)).toBeInTheDocument()
        expect(screen.getByText(topTen)).toBeInTheDocument()
        expect(screen.getByText(content, {exact: false})).toBeInTheDocument()
    })

    it('should pass null to the provider when value is missing', () => {
        const metric = MetricName.MessagesPerTicket

        const providerMock = jest
            .spyOn(PerformanceTipHook, 'usePerformanceTips')
            .mockReturnValue({
                type: TipQualifier.Success,
                content: 'no content',
                average: '4.9',
                topTen: '3.1',
            })

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTip
                    metric={metric}
                    useTrend={() => ({
                        data: undefined,
                        isError: false,
                        isFetching: true,
                    })}
                />
            </Provider>
        )

        expect(providerMock).toHaveBeenCalledWith(metric, null)
    })
})
