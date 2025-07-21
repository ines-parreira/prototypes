import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketChannel } from 'business/types/ticket'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as PerformanceTipHook from 'domains/reporting/hooks/usePerformanceTips'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import { MetricName } from 'domains/reporting/services/constants'
import { TipQualifier } from 'domains/reporting/services/supportPerformanceTipService'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { account } from 'fixtures/account'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { tags } from 'fixtures/tag'
import { teams } from 'fixtures/teams'
import { AccountSettingType } from 'state/currentAccount/types'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/usePerformanceTips')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
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
