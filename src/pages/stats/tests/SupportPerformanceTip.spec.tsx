import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { tags } from 'fixtures/tag'
import { teams } from 'fixtures/teams'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import * as PerformanceTipHook from 'hooks/reporting/usePerformanceTips'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import { SupportPerformanceTip } from 'pages/stats/SupportPerformanceTip'
import { MetricName } from 'services/reporting/constants'
import { TipQualifier } from 'services/supportPerformanceTipService'
import { AccountSettingType } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/usePerformanceTips')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('SupportPerformanceTip', () => {
    const defaultStatsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([
            integrationsState.integrations[0].id,
        ]),
        agents: withDefaultLogicalOperator([agents[0].id]),
        tags: [
            {
                ...withDefaultLogicalOperator([1]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const metric = MetricName.MessagesPerTicket
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
        stats: {
            filters: defaultStatsFilters,
        },
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
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
    })

    it('should render tip from PerformanceTipProvider', () => {
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
            </Provider>,
        )

        expect(screen.getByText(average)).toBeInTheDocument()
        expect(screen.getByText(topTen)).toBeInTheDocument()
        expect(screen.getByText(content, { exact: false })).toBeInTheDocument()
    })

    it('should pass null to the provider when value is missing', () => {
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
            </Provider>,
        )

        expect(providerMock).toHaveBeenCalledWith(metric, null)
    })

    it('should pass legacyStatsFilters to the data hook', () => {
        const useTrendSpy = jest.fn()
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: defaultStatsFilters,
            userTimezone: DEFAULT_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTip metric={metric} useTrend={useTrendSpy} />
            </Provider>,
        )

        expect(useTrendSpy).toHaveBeenCalledWith(
            defaultStatsFilters,
            DEFAULT_TIMEZONE,
        )
    })

    it('should pass statsFiltersWithLogicalOperators to the data hook', () => {
        const useTrendSpy = jest.fn()

        render(
            <Provider store={mockStore(defaultState)}>
                <SupportPerformanceTip metric={metric} useTrend={useTrendSpy} />
            </Provider>,
        )

        expect(useTrendSpy).toHaveBeenCalledWith(
            defaultStatsFilters,
            DEFAULT_TIMEZONE,
        )
    })
})
