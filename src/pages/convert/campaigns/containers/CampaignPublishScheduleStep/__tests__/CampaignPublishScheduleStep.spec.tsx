import React from 'react'
import {fromJS} from 'immutable'
import {ulid} from 'ulidx'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import userEvent from '@testing-library/user-event'
import {act, render, fireEvent} from '@testing-library/react'

import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'

import {campaign, campaignSchedule} from 'fixtures/campaign'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'

import {SETTING_TYPE_BUSINESS_HOURS} from 'state/currentAccount/constants'
import {RootState, StoreDispatch} from 'state/types'

import {
    CampaignScheduleRuleValueEnum,
    CampaignScheduleModeEnum,
} from 'pages/convert/campaigns/types/enums/CampaignScheduleSettingsValues.enum'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {
    CampaignDetailsFormApi,
    CampaignDetailsFormProvider,
} from 'pages/convert/campaigns/providers/CampaignDetailsForm/context'

import CampaignPublishScheduleStep from '../CampaignPublishScheduleStep'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const mockOpenFn = jest.fn()
jest.mock('hooks/useModalManager/useModalManager.tsx', () => {
    return {
        useModalManager: () => ({
            getParams: jest.fn().mockReturnValue({id: 1}),
            isOpen: jest.fn().mockReturnValue(false),
            on: jest.fn(),
            openModal: mockOpenFn,
        }),
    }
})

jest.mock('pages/convert/common/components/ConvertSubscriptionModal', () => {
    return jest.fn(() => {
        return <div>ConvertSubscriptionModal</div>
    })
})

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

describe('CampaignPublishScheduleStep', () => {
    const updateCampaignSpy = jest.fn()
    const defaultProps = {
        count: 1,
        key: CampaignStepsKeys.PublishSchedule,
        isPristine: false,
        isValid: true,
        isDisabled: false,
        isConvertSubscriber: true,
        isLightCampaign: false,
    }

    const renderComponent = ({
        campaignData,
        props,
    }: {
        campaignData?: Partial<Campaign>
        props: any
    }) => {
        const triggers = (campaignData?.triggers ?? []).reduce(
            (acc, trigger) => {
                const id = ulid()
                return {
                    ...acc,
                    [trigger?.id ?? id.toString()]: trigger,
                }
            },
            {}
        )

        const campaignContextValues: CampaignDetailsFormApi = {
            campaign: {
                ...campaign,
                ...(campaignData ? campaignData : {}),
            } as Campaign,
            triggers: triggers,
            updateCampaign: updateCampaignSpy,
            addTrigger: jest.fn(),
            updateTrigger: jest.fn(),
            deleteTrigger: jest.fn,
        }

        return render(
            <Provider store={mockStore(defaultState)}>
                <CampaignDetailsFormProvider value={campaignContextValues}>
                    <CampaignPublishScheduleStep {...props} />
                </CampaignDetailsFormProvider>
            </Provider>
        )
    }

    beforeEach(() => {
        updateCampaignSpy.mockReset()
    })

    it('renders', () => {
        const {getByText, container} = renderComponent({
            props: defaultProps,
            campaignData: {
                publish_mode: CampaignScheduleModeEnum.Schedule,
                schedule: {
                    ...campaignSchedule,
                    schedule_rule: CampaignScheduleRuleValueEnum.Custom,
                    end_datetime: '2024-02-16T09:57:44.284000',
                },
            },
        })

        expect(getByText('Publish now')).toBeInTheDocument()
        expect(getByText('Save and publish later')).toBeInTheDocument()
        expect(getByText(/Schedule/)).toBeInTheDocument()

        expect(getByText('Add Date-Specific Hours')).toBeInTheDocument()

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).not.toBeDisabled()
    })

    it('end date is not specified', () => {
        const {getByText, container} = renderComponent({
            campaignData: {publish_mode: CampaignScheduleModeEnum.Schedule},
            props: defaultProps,
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

    it('schedule configuration section is disabled', () => {
        const {container} = renderComponent({
            props: {...defaultProps, isDisabled: true},
        })

        expect(
            container.getElementsByClassName('toggleContainer')[0].className
        ).toContain('isDisabled')
    })

    it('renders notice when user is not convert subscriber', () => {
        const {getByText, container} = renderComponent({
            props: {
                ...defaultProps,
                isConvertSubscriber: false,
            },
        })

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).toBeDisabled()

        expect(getByText('Subscribe to Convert')).toBeInTheDocument()
    })

    it('user can open and close `subscribe to convert` modal', () => {
        const {getByText} = renderComponent({
            props: {
                ...defaultProps,
                isConvertSubscriber: false,
            },
        })

        act(() => {
            getByText('Subscribe to Convert').click()
        })

        expect(mockOpenFn).toBeCalled()
    })

    it('schedule option is disabled for light campaign', () => {
        const {container} = renderComponent({
            props: {
                ...defaultProps,
                isConvertSubscriber: false,
                isLightCampaign: true,
            },
        })

        const scheduleOption = container.querySelector(
            `#${CampaignScheduleModeEnum.Schedule}`
        )
        expect(scheduleOption).toBeDisabled()
    })

    it('when user selects schedule option, the campaign is updated', () => {
        const {getByText} = renderComponent({props: defaultProps})

        const scheduleOption = getByText(/Schedule/)

        act(() => {
            userEvent.click(scheduleOption)
        })

        expect(updateCampaignSpy).toHaveBeenCalledWith(
            'publish_mode',
            'schedule'
        )

        updateCampaignSpy.mockReset()

        const publishNowOption = getByText(/Publish now/)
        act(() => {
            userEvent.click(publishNowOption)
        })

        expect(updateCampaignSpy).toHaveBeenCalledWith(
            'publish_mode',
            'publish_now'
        )
    })

    it('user is not able to select `durign` option, because there is trigger definied', () => {
        const triggerId = '1'
        const campaignTrigger = {
            id: triggerId,
            type: CampaignTriggerType.BusinessHours,
            operator: CampaignTriggerOperator.Eq,
            value: CampaignTriggerBusinessHoursValuesEnum.During,
        }
        const campaignData = {
            trigger_rule: `{${triggerId}}`,
            triggers: [campaignTrigger],
            publish_mode: CampaignScheduleModeEnum.Schedule,
        }

        const {getByTestId} = renderComponent({
            campaignData,
            props: defaultProps,
        })

        const duringOptionSelect = getByTestId('selected-schedule-rule')
        expect(duringOptionSelect.textContent).toEqual('Business hours')
    })

    it('user is able to select `during` option when mode is schedule', () => {
        const {getByTestId, getByRole} = renderComponent({
            campaignData: {publish_mode: CampaignScheduleModeEnum.Schedule},
            props: defaultProps,
        })

        const duringOptionSelect = getByTestId('selected-schedule-rule')

        userEvent.click(duringOptionSelect)

        userEvent.click(
            getByRole('menuitem', {
                name: 'Business hours',
            })
        )

        expect(updateCampaignSpy).toHaveBeenCalledWith('schedule', {
            custom_schedule: [],
            end_datetime: null,
            schedule_rule: 'during',
            start_datetime: expect.any(String),
        })
    })

    it('user is able to selects dates', () => {
        const {getByLabelText, getAllByText, getAllByRole} = renderComponent({
            campaignData: {publish_mode: CampaignScheduleModeEnum.Schedule},
            props: defaultProps,
        })

        // Open calendar
        const fromToggle = getByLabelText(/From/)
        fireEvent.click(fromToggle)

        // Click the day 21
        let selectedDate = getAllByText('21')[0]
        userEvent.click(selectedDate)

        // Confirm choice
        let applyBtn = getAllByRole('button', {
            name: 'Apply',
        }).filter((element) => !(element as HTMLButtonElement).disabled)[0]

        fireEvent.click(applyBtn)

        expect(updateCampaignSpy).toHaveBeenCalledWith('schedule', {
            custom_schedule: [],
            end_datetime: null,
            schedule_rule: 'anytime',
            start_datetime: expect.any(String),
        })

        updateCampaignSpy.mockReset()

        // Open calendar
        const toToggle = getByLabelText(/To/)
        act(() => {
            // needed because of useState and toggle
            fireEvent.focus(toToggle as Element)
        })

        // Click the day 21
        selectedDate = getAllByText('21')[0]
        userEvent.click(selectedDate)

        // Confirm choice
        applyBtn = getAllByRole('button', {
            name: 'Apply',
        }).filter((element) => !(element as HTMLButtonElement).disabled)[0]

        act(() => {
            fireEvent.click(applyBtn)
        })

        expect(updateCampaignSpy).toHaveBeenCalledWith('schedule', {
            custom_schedule: [],
            schedule_rule: 'anytime',
            start_datetime: expect.any(String),
            end_datetime: expect.any(String),
        })
    })

    it('user is able clear end date', () => {
        const {getByText} = renderComponent({
            campaignData: {
                publish_mode: CampaignScheduleModeEnum.Schedule,
                schedule: {
                    ...campaignSchedule,
                    end_datetime: '2024-02-16T09:57:44.284000',
                },
            },
            props: defaultProps,
        })

        userEvent.click(getByText('cancel'))

        expect(updateCampaignSpy).toBeCalledWith('schedule', {
            custom_schedule: [],
            end_datetime: null,
            schedule_rule: 'anytime',
            start_datetime: expect.any(String),
        })
    })
})
