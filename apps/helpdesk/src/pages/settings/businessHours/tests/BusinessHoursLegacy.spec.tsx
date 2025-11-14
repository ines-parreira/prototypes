import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { submitSetting } from 'state/currentAccount/actions'
import { SETTING_TYPE_BUSINESS_HOURS } from 'state/currentAccount/constants'
import { renderWithRouter } from 'utils/testing'

import BusinessHoursLegacy from '../BusinessHoursLegacy'
import { DEPRECATED_DAYS_OPTIONS } from '../constants'

const mockStore = configureMockStore([thunk])

jest.mock('state/currentAccount/actions')
const submitSettingMock = submitSetting as jest.Mock

describe('<BusinessHoursLegacy />', () => {
    beforeEach(() => {
        submitSettingMock.mockClear()
        submitSettingMock.mockResolvedValue({})
    })

    it('should render default values', () => {
        renderWithRouter(
            <Provider store={mockStore()}>
                <BusinessHoursLegacy />
            </Provider>,
        )

        expect(screen.getAllByText('Business hours')).toHaveLength(2)
        expect(
            screen.getByText(/Let customers know when your team is online/),
        ).toBeInTheDocument()
        expect(screen.getByText('Weekdays')).toBeInTheDocument()
        expect(screen.getByDisplayValue('09:00')).toHaveAttribute(
            'name',
            'fromTime',
        )
        expect(screen.getByDisplayValue('17:00')).toHaveAttribute(
            'name',
            'toTime',
        )
        expect(screen.getByText('Add business hours')).toBeInTheDocument()
        expect(screen.getByText('Time zone')).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })

    it('should render values from state', async () => {
        renderWithRouter(
            <Provider
                store={mockStore({
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
                                            to_time: '19:00',
                                        },
                                    ],
                                    timezone: 'US/Pacific',
                                },
                            },
                        ],
                    }),
                })}
            >
                <BusinessHoursLegacy />
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getAllByText('Tuesday')).toHaveLength(2)
            expect(screen.getByDisplayValue('10:00')).toHaveAttribute(
                'name',
                'fromTime',
            )
            expect(screen.getByDisplayValue('17:00')).toHaveAttribute(
                'name',
                'toTime',
            )
            expect(screen.getAllByText('Thursday')).toHaveLength(2)
            expect(screen.getByDisplayValue('11:00')).toHaveAttribute(
                'name',
                'fromTime',
            )
            expect(screen.getByDisplayValue('19:00')).toHaveAttribute(
                'name',
                'toTime',
            )
        })
    })

    it('should dispatch submitSetting when form is submitted', () => {
        const wednesdayOption = DEPRECATED_DAYS_OPTIONS.find(
            ({ label }) => label === 'Wednesday',
        )
        const initialBusinessHours = {
            id: 'test-id-123',
            type: SETTING_TYPE_BUSINESS_HOURS,
            data: {
                business_hours: [
                    {
                        days: '1,2,3,4,5',
                        from_time: '09:00',
                        to_time: '17:00',
                    },
                ],
                timezone: 'UTC',
            },
        }

        renderWithRouter(
            <Provider
                store={mockStore({
                    currentAccount: fromJS({
                        settings: [
                            {
                                id: 'test-id-123',
                                type: SETTING_TYPE_BUSINESS_HOURS,
                                data: {
                                    business_hours: [
                                        {
                                            days: '1,2,3,4,5',
                                            from_time: '09:00',
                                            to_time: '17:00',
                                        },
                                    ],
                                    timezone: 'UTC',
                                },
                            },
                        ],
                    }),
                })}
            >
                <BusinessHoursLegacy />
            </Provider>,
        )

        act(() => {
            screen.getByText('Weekdays').click()
            screen.getByText(wednesdayOption!.label as string).click()
            fireEvent.change(screen.getByDisplayValue('09:00'), {
                target: { value: '15:00' },
            })
            const saveButton = screen.getByText('Save changes')
            saveButton.click()
        })

        expect(submitSettingMock).toHaveBeenCalledWith({
            ...initialBusinessHours,
            data: {
                timezone: 'UTC',
                business_hours: [
                    {
                        days: wednesdayOption!.value,
                        from_time: '15:00',
                        to_time: '17:00',
                    },
                ],
            },
        })
    })
})
