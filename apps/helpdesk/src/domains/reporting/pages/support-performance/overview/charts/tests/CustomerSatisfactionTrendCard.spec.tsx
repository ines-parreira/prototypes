import React, { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'

import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { ActivateCustomerSatisfactionSurveyTip } from 'domains/reporting/pages/support-performance/components/ActivateCustomerSatisfactionSurveyTip'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import { CustomerSatisfactionTrendCard } from 'domains/reporting/pages/support-performance/overview/charts/CustomerSatisfactionTrendCard'
import { STATS_TIPS_VISIBILITY_KEY } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { account } from 'fixtures/account'
import { AccountSettingType } from 'state/currentAccount/types'
import { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/support-performance/components/ActivateCustomerSatisfactionSurveyTip',
)
const ActivateCustomerSatisfactionSurveyTipMock = assumeMock(
    ActivateCustomerSatisfactionSurveyTip,
)
jest.mock(
    'domains/reporting/pages/support-performance/components/SupportPerformanceTip',
)
const SupportPerformanceTipMock = assumeMock(SupportPerformanceTip)
jest.mock('domains/reporting/pages/common/components/TrendCard')
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
