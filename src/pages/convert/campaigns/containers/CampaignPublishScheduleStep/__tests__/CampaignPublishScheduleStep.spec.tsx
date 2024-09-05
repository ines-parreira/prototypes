import React from 'react'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import userEvent from '@testing-library/user-event'
import {act, render} from '@testing-library/react'

import {SETTING_TYPE_BUSINESS_HOURS} from 'state/currentAccount/constants'
import {RootState, StoreDispatch} from 'state/types'

import {CampaignScheduleModeEnum} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'

import CampaignPublishScheduleStep from '../CampaignPublishScheduleStep'

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

const renderComponent = (props: any) => {
    return render(
        <Provider store={mockStore(defaultState)}>
            <CampaignPublishScheduleStep {...props} />
        </Provider>
    )
}

describe('CampaignPublishScheduleStep', () => {
    const defaultProps = {
        count: 1,
        key: CampaignStepsKeys.PublishSchedule,
        isPristine: false,
        isValid: true,
        isDisabled: false,
        isConvertSubscriber: true,
        isLightCampaign: false,
        publishMode: CampaignScheduleModeEnum.PublishNow,
        onPublishModeChange: jest.fn(),
    }

    it('renders', () => {
        const {getByText, container} = renderComponent(defaultProps)

        expect(getByText('Publish Now')).toBeInTheDocument()
        expect(getByText('Save and publish later')).toBeInTheDocument()
        expect(getByText(/Schedule/)).toBeInTheDocument()

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).not.toBeDisabled()
    })

    it('end date is not specified', () => {
        const {getByText, container} = renderComponent({
            ...defaultProps,
            publishMode: CampaignScheduleModeEnum.Schedule,
        })

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).toBeInTheDocument()

        act(() => {
            userEvent.click(scheduleOption as Element)
        })

        expect(
            getByText(
                /The campaign will run indefinitely if no end date is set./
            )
        ).toBeInTheDocument()
    })

    it('can disable accordtion', () => {
        const {container} = renderComponent({
            ...defaultProps,
            isDisabled: true,
        })

        expect(
            container.getElementsByClassName('toggleContainer')[0].className
        ).toContain('isDisabled')
    })

    it('renders when user is not convert subscriber', () => {
        const {getByText, container} = renderComponent({
            ...defaultProps,
            isConvertSubscriber: false,
        })

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).toBeDisabled()

        expect(getByText('Subscribe to Convert')).toBeInTheDocument()
    })

    it('schedule is disabled for light campaign', () => {
        const {container} = renderComponent({
            ...defaultProps,
            isConvertSubscriber: false,
            isLightCampaign: true,
        })

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).toBeDisabled()
    })
})
