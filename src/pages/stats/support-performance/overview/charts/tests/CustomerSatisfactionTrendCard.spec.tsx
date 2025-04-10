import React, { ComponentProps } from 'react'

import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { ActivateCustomerSatisfactionSurveyTip } from 'pages/stats/support-performance/components/ActivateCustomerSatisfactionSurveyTip'
import { SupportPerformanceTip } from 'pages/stats/support-performance/components/SupportPerformanceTip'
import { CustomerSatisfactionTrendCard } from 'pages/stats/support-performance/overview/charts/CustomerSatisfactionTrendCard'
import { STATS_TIPS_VISIBILITY_KEY } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { AccountSettingType } from 'state/currentAccount/types'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'pages/stats/support-performance/components/ActivateCustomerSatisfactionSurveyTip',
)
const ActivateCustomerSatisfactionSurveyTipMock = assumeMock(
    ActivateCustomerSatisfactionSurveyTip,
)
jest.mock('pages/stats/support-performance/components/SupportPerformanceTip')
const SupportPerformanceTipMock = assumeMock(SupportPerformanceTip)
jest.mock('pages/stats/common/components/TrendCard')
const TrendCardMock = assumeMock(TrendCard)

describe('CustomerSatisfactionTrendCard', () => {
    const accountWithSatisfactionSurvey = {
        ...account,
        settings: [
            {
                id: 13,
                type: AccountSettingType.SatisfactionSurveys,
                data: {
                    send_survey_for_chat: true,
                    send_survey_for_email: true,
                    survey_email_html: 'string',
                    survey_email_text: 'string',
                    survey_interval: 500,
                },
            },
        ],
    }
    const accountWithOutSatisfactionSurvey = {
        ...account,
        settings: [],
    }
    const defaultState = {
        currentAccount: fromJS(accountWithSatisfactionSurvey),
    } as RootState

    beforeEach(() => {
        TrendCardMock.mockImplementation(
            ({ tip }: ComponentProps<typeof TrendCard>) => <div>{tip}</div>,
        )
        ActivateCustomerSatisfactionSurveyTipMock.mockImplementation(() => (
            <div></div>
        ))
        SupportPerformanceTipMock.mockImplementation(() => <div></div>)
        localStorage.setItem(STATS_TIPS_VISIBILITY_KEY, 'true')
    })

    it('should render the SupportPerformanceTip', () => {
        renderWithStore(
            <CustomerSatisfactionTrendCard chartId="ID" />,
            defaultState,
        )

        expect(SupportPerformanceTipMock).toHaveBeenCalled()
    })

    it('should render Activate Customer Satisfaction Survey when feature disabled or not configured', () => {
        const state = {
            currentAccount: fromJS(accountWithOutSatisfactionSurvey),
        } as RootState

        renderWithStore(<CustomerSatisfactionTrendCard chartId="ID" />, state)

        expect(ActivateCustomerSatisfactionSurveyTipMock).toHaveBeenCalled()
    })
})
