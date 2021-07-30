import {mount} from 'enzyme'
import React from 'react'
import DateRangePicker, {
    Props as MockDateRangePickerProps,
} from 'react-bootstrap-daterangepicker'
import moment from 'moment-timezone'

import {PeriodPickerContainer} from '../PeriodPicker'

jest.mock(
    'react-bootstrap-daterangepicker',
    () => ({onApply}: MockDateRangePickerProps) => (
        <div
            onChange={(e) => {
                onApply!(
                    e as any,
                    ((e.target as unknown) as Record<string, any>).value
                )
            }}
        />
    )
)

describe('PeriodPicker', () => {
    it("it should select dates with user's timezone", () => {
        const userTimezone = 'America/New_York'
        const onChange = jest.fn()
        const component = mount(
            <PeriodPickerContainer
                startDatetime={moment()}
                onChange={onChange}
                endDatetime={moment()}
                userTimezone={userTimezone}
            />
        )

        const startDate = moment.tz('2020-05-02', 'Europe/Paris')
        const endDate = moment.tz('2020-05-07', 'Europe/Paris')

        component.find(DateRangePicker).simulate('change', {
            target: {
                value: {
                    startDate,
                    endDate,
                },
            },
        })

        expect(onChange).toBeCalledWith({
            startDatetime: moment.tz(startDate.format(), userTimezone).format(),
            endDatetime: moment.tz(endDate.format(), userTimezone).format(),
        })
    })

    it("it should select dates without user's timezone", () => {
        const onChange = jest.fn()
        const component = mount(
            <PeriodPickerContainer
                startDatetime={moment()}
                onChange={onChange}
                endDatetime={moment()}
            />
        )

        const startDate = moment.tz('2020-05-02', 'Europe/Paris')
        const endDate = moment.tz('2020-05-07', 'Europe/Paris')

        component.find(DateRangePicker).simulate('change', {
            target: {
                value: {
                    startDate,
                    endDate,
                },
            },
        })

        expect(onChange).toBeCalledWith({
            startDatetime: moment
                .tz(startDate.format(), 'America/Creston')
                .format(),
            endDatetime: moment
                .tz(endDate.format(), 'America/Creston')
                .format(),
        })
    })
})
