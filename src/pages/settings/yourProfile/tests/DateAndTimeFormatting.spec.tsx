import {render, fireEvent} from '@testing-library/react'
import React from 'react'

import {DateFormattingSetting, TimeFormattingSetting} from 'models/agents/types'
import DateAndTimeFormatting from 'pages/settings/yourProfile/components/DateAndTimeFormatting'

describe('DateAndTimeFormatting', () => {
    it.each([
        [
            // current date format and time format
            Object.keys(DateFormattingSetting)[1], // en_US
            TimeFormattingSetting[1], // AM/PM

            // new date format and time format
            Object.keys(DateFormattingSetting)[0], // en_GB
            DateFormattingSetting.en_GB.label,
            TimeFormattingSetting[0], // 24-hour
        ],
        [
            // current date format and time format
            Object.keys(DateFormattingSetting)[0], // en_GB
            TimeFormattingSetting[0], // 24-hour

            // new date format and time format
            Object.keys(DateFormattingSetting)[1], //en_US
            DateFormattingSetting.en_US.label,
            TimeFormattingSetting[1], // AM/PM
        ],
    ])(
        'should render component and call onSelect functions when changing the formats',
        (
            currentDateFormat,
            currentTimeFormat,
            newDateFormat,
            newDateFormatLabel,
            newTimeFormat
        ) => {
            const onSelectDateFormatMock = jest.fn()
            const onSelectTimeFormatMock = jest.fn()

            const {getByText, getByLabelText} = render(
                <DateAndTimeFormatting
                    dateFormat={currentDateFormat}
                    timeFormat={currentTimeFormat}
                    onSelectDateFormat={onSelectDateFormatMock}
                    onSelectTimeFormat={onSelectTimeFormatMock}
                />
            )

            // Check if the Date format and Time format labels are present
            expect(getByText('Date format')).toBeInTheDocument()
            expect(getByText('Time format')).toBeInTheDocument()

            // Select other date and time formats
            fireEvent.click(getByLabelText(newDateFormatLabel))
            fireEvent.click(getByLabelText(newTimeFormat))

            // Check if onSelect functions are called
            expect(onSelectDateFormatMock).toHaveBeenCalledWith(newDateFormat)
            expect(onSelectTimeFormatMock).toHaveBeenCalledWith(newTimeFormat)
        }
    )
})
