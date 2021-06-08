import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import moment from 'moment'

import DatePicker from '../DatePicker.tsx'

describe('DatePicker', () => {
    beforeEach(() => {
        const mockDate = new Date('2021-05-14T12:34:56.000Z')
        global.Date.now = jest.fn(() => mockDate)
    })

    it('should render a date range picker', () => {
        const datetime = moment('2021-05-14')
        const ranges = {
            tomorrow: [datetime.add(1, 'days'), datetime.add(1, 'days')],
        }
        const {container} = render(
            <DatePicker
                isOpen={true}
                toggle={null}
                onApply={null}
                initialSettings={{
                    applyButtonClasses: 'btn-success mr-2',
                    cancelButtonClasses: 'btn-secondary',
                    minDate: datetime,
                    opens: 'left',
                    ranges,
                    timePicker: true,
                    showCustomRangeLabel: false,
                    singleDatePicker: true,
                    startDate: datetime,
                }}
            >
                <button>Select a date</button>
            </DatePicker>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the opened date picker', () => {
        const {getByText} = render(
            <DatePicker isOpen={true}>
                <button>Select a date</button>
            </DatePicker>
        )

        const [dateRangePickerElement] = document.getElementsByClassName(
            'daterangepicker'
        )

        expect(dateRangePickerElement.classList).toContain('displayed')
        expect(getByText('May 2021')).toBeTruthy()
        expect(getByText('Jun 2021')).toBeTruthy()
    })

    it('should open the date range picker on trigger element click', async () => {
        const showSpy = jest.fn()
        const {getByText} = render(
            <DatePicker toggle={showSpy}>
                <button>Select a date</button>
            </DatePicker>
        )

        fireEvent.click(getByText('Select a date'))
        await waitFor(() => expect(showSpy).toHaveBeenCalled)
    })

    it('should call toggle callback on click outside', async () => {
        const externalText = document.createElement('div')
        externalText.textContent = 'I am outside'
        document.body.appendChild(externalText)

        const toggleSpy = jest.fn()
        const {getByText} = render(
            <DatePicker isOpen toggle={toggleSpy}>
                <button>Select a date</button>
            </DatePicker>
        )

        fireEvent.click(getByText(externalText.textContent))
        await waitFor(() => expect(toggleSpy).toHaveBeenCalled)
    })
})
