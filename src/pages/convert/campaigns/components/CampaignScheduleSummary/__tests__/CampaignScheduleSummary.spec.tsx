import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {CampaignScheduleRuleValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'

import {SETTING_TYPE_BUSINESS_HOURS} from 'state/currentAccount/constants'
import {RootState, StoreDispatch} from 'state/types'

import CampaignScheduleSummary from '../CampaignScheduleSummary'
import {SCHEDULE_RULE_LABELS} from '../constants'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const defaultState = {
    currentAccount: fromJS({
        settings: [
            {
                type: SETTING_TYPE_BUSINESS_HOURS,
                data: {
                    business_hours: [
                        {
                            days: '2',
                            from_time: '10:00',
                            to_time: '17:00',
                        },
                        {
                            days: '4',
                            from_time: '11:00',
                            to_time: '17:00',
                        },
                    ],
                    timezone: 'US/Pacific',
                },
            },
        ],
    }),
} as RootState

const defaultStore = mockStore(defaultState)

const renderComponent = (props?: any) => {
    return render(
        <Provider store={defaultStore}>
            <CampaignScheduleSummary {...props} />
        </Provider>
    )
}

describe('<CampaignScheduleSummary />', () => {
    const mockedStartDate = '2024-09-04T07:00:00'
    const mockedEndDate = '2024-10-05T23:59:59'

    it.each([
        {
            schedule_rule: CampaignScheduleRuleValueEnum.AllDay,
            start_datetime: mockedStartDate,
            end_datetime: undefined,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.AllDay,
            start_datetime: mockedStartDate,
            end_datetime: mockedEndDate,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.During,
            start_datetime: mockedStartDate,
            end_datetime: undefined,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.During,
            start_datetime: mockedStartDate,
            end_datetime: mockedEndDate,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.Outside,
            start_datetime: mockedStartDate,
            end_datetime: undefined,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.Outside,
            start_datetime: mockedStartDate,
            end_datetime: mockedEndDate,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.Custom,
            start_datetime: mockedStartDate,
            end_datetime: undefined,
        },
        {
            schedule_rule: CampaignScheduleRuleValueEnum.Custom,
            start_datetime: mockedStartDate,
            end_datetime: mockedEndDate,
        },
    ])('renders $schedule_type, $startDate - $endDate', (configuration) => {
        const {getByText} = renderComponent({
            scheduleConfiguration: configuration,
        })

        expect(getByText('Wednesday, 4 September 2024')).toBeInTheDocument()
        expect(getByText(/US\/Pacific/)).toBeInTheDocument()

        if (configuration.schedule_rule in SCHEDULE_RULE_LABELS) {
            expect(
                getByText(SCHEDULE_RULE_LABELS[configuration.schedule_rule])
            ).toBeInTheDocument()
        }

        if (configuration.end_datetime) {
            expect(getByText(/Saturday, 5 October 2024/)).toBeInTheDocument()
        }
    })
})
