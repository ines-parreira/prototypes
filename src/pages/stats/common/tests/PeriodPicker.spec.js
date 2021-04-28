// @flow
import {mount} from 'enzyme'
import React, {type ElementProps} from 'react'
import DateRangePicker from 'react-bootstrap-daterangepicker'
import moment from 'moment-timezone'

import PeriodPicker from '../PeriodPicker'

jest.mock(
    'react-bootstrap-daterangepicker',
    () => ({onApply}: ElementProps<typeof DateRangePicker>) => (
        <div
            onChange={(e) => {
                onApply(e, e.target.value)
            }}
        />
    )
)

describe('PeriodPicker', () => {
    it("it should select dates with user's timezone", () => {
        const onChange = jest.fn()
        const component = mount(
            <PeriodPicker
                startDatetime={moment()}
                onChange={onChange}
                endDatetime={moment()}
            />
        )

        component.find(DateRangePicker).simulate('change', {
            target: {
                value: {
                    startDate: moment.tz('2020-05-02', 'Europe/Paris'),
                    endDate: moment.tz('2020-05-07', 'Europe/Paris'),
                },
            },
        })

        expect(onChange).toBeCalledWith({
            start_datetime: moment
                .tz('2020-05-02 00:00:00', 'America/Creston')
                .format(),
            end_datetime: moment
                .tz('2020-05-07 23:59:59', 'America/Creston')
                .format(),
        })
    })
})
