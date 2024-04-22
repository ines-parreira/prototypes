import {render} from '@testing-library/react'
import React from 'react'
import {Props as MockDateRangePickerProps} from 'react-bootstrap-daterangepicker'
import moment from 'moment-timezone'

import {PeriodPickerContainer} from 'pages/stats/common/PeriodPicker'

jest.mock(
    'react-bootstrap-daterangepicker',
    () =>
        ({onApply, initialSettings}: MockDateRangePickerProps) => {
            onApply?.({} as any, initialSettings as any)
            return (
                <div
                    onChange={(e) => {
                        onApply?.(
                            e as any,
                            (e.target as unknown as Record<string, any>).value
                        )
                    }}
                />
            )
        }
)

describe('PeriodPicker', () => {
    it("it should select dates with user's timezone", () => {
        const userTimezone = 'America/New_York'
        const onChange = jest.fn()
        const startDate = moment.tz('2020-05-02', 'Europe/Paris')
        const endDate = moment.tz('2020-05-07', 'Europe/Paris')

        render(
            <PeriodPickerContainer
                startDatetime={startDate}
                onChange={onChange}
                endDatetime={endDate}
                userTimezone={userTimezone}
            />
        )

        expect(onChange).toBeCalledWith({
            startDatetime: moment.tz(startDate.format(), userTimezone).format(),
            endDatetime: moment.tz(endDate.format(), userTimezone).format(),
        })
    })

    it("it should select dates without user's timezone", () => {
        const onChange = jest.fn()
        const startDate = moment.tz('2020-05-02', 'Europe/Paris')
        const endDate = moment.tz('2020-05-07', 'Europe/Paris')

        render(
            <PeriodPickerContainer
                startDatetime={startDate}
                onChange={onChange}
                endDatetime={endDate}
                dateRanges={{
                    'Last 7 days': [
                        moment.tz('2020-05-02', 'Europe/Paris'),
                        moment.tz('2020-05-07', 'Europe/Paris'),
                    ],
                }}
            />
        )

        expect(onChange).toBeCalledWith({
            startDatetime: moment.tz(startDate.format(), 'UTC').format(),
            endDatetime: moment.tz(endDate.format(), 'UTC').format(),
        })
    })
})
