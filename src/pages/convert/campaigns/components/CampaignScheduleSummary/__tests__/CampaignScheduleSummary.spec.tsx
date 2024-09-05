import React from 'react'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {render} from '@testing-library/react'

import {CampaignScheduleTypeValueEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'

import {SETTING_TYPE_BUSINESS_HOURS} from 'state/currentAccount/constants'
import {RootState, StoreDispatch} from 'state/types'

import {SCHEDULE_RULE_LABELS} from '../constants'
import CampaignScheduleSummary from '../CampaignScheduleSummary'

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
    const mockedStartDate = '2024-09-04'
    const mockedEndDate = '2024-10-05'

    it.each([
        {
            schedule_type: CampaignScheduleTypeValueEnum.AllDay,
            startDate: mockedStartDate,
            endDate: undefined,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.AllDay,
            startDate: mockedStartDate,
            endDate: mockedEndDate,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.During,
            startDate: mockedStartDate,
            endDate: undefined,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.During,
            startDate: mockedStartDate,
            endDate: mockedEndDate,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.Outside,
            startDate: mockedStartDate,
            endDate: undefined,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.Outside,
            startDate: mockedStartDate,
            endDate: mockedEndDate,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.Custom,
            startDate: mockedStartDate,
            endDate: undefined,
        },
        {
            schedule_type: CampaignScheduleTypeValueEnum.Custom,
            startDate: mockedStartDate,
            endDate: mockedEndDate,
        },
    ])('renders $schedule_type, $startDate - $endDate', (configuration) => {
        const {getByText, queryByText} = renderComponent({
            scheduleConfiguration: configuration,
        })

        expect(getByText('Wednesday, 4 September 2024')).toBeInTheDocument()
        expect(getByText(/US\/Pacific/)).toBeInTheDocument()

        if (configuration.schedule_type in SCHEDULE_RULE_LABELS) {
            expect(
                getByText(SCHEDULE_RULE_LABELS[configuration.schedule_type])
            ).toBeInTheDocument()
        }

        if (
            configuration.endDate &&
            configuration.schedule_type !== CampaignScheduleTypeValueEnum.Custom
        ) {
            expect(getByText('Saturday, 5 October 2024')).toBeInTheDocument()
        } else {
            expect(
                queryByText('Saturday, 5 October 2024')
            ).not.toBeInTheDocument()
        }
    })
})
