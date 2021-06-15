import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'
import moment from 'moment-timezone'

import DatePicker from '../DatePicker.tsx'

describe('DatePicker', () => {
    const datetime = moment('2021-05-12')

    const minProps = {
        initialSettings: {
            applyButtonClasses: 'btn-success mr-2',
            cancelButtonClasses: 'btn-secondary',
            minDate: datetime,
            opens: 'left',
            timePicker: false,
            showCustomRangeLabel: false,
            singleDatePicker: true,
        },
    }

    beforeEach(() => {
        const mockDate = new Date('2021-05-14T12:34:56.000Z')
        global.Date.now = jest.fn(() => mockDate)
    })

    it('should render a date range picker', () => {
        const ranges = {
            tomorrow: [datetime.add(1, 'days'), datetime.add(1, 'days')],
        }
        const {container} = render(
            <DatePicker
                isOpen={true}
                toggle={null}
                onSubmit={null}
                initialSettings={{
                    ...minProps.initialSettings,
                    ranges,
                }}
            >
                <button>Select a date</button>
            </DatePicker>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the opened date picker', () => {
        const {getByText} = render(
            <DatePicker {...minProps} isOpen={true}>
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
            <DatePicker {...minProps} toggle={showSpy}>
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
            <DatePicker {...minProps} isOpen toggle={toggleSpy}>
                <button>Select a date</button>
            </DatePicker>
        )

        fireEvent.click(getByText(externalText.textContent))
        await waitFor(() => expect(toggleSpy).toHaveBeenCalled)
    })

    it('should call onSubmit with expected date when selecting a date', () => {
        const onSubmit = jest.fn()
        const {getByText} = render(
            <DatePicker {...minProps} isOpen={true} onSubmit={onSubmit}>
                <button>Select a date</button>
            </DatePicker>
        )

        fireEvent.click(getByText('Apply'))

        expect(onSubmit.mock.calls).toMatchSnapshot()
    })

    it('should call onSubmit with expected range when selecting a range of date', () => {
        const onSubmit = jest.fn()
        const {getByText} = render(
            <DatePicker
                {...minProps}
                isOpen={true}
                onSubmit={onSubmit}
                initialSettings={{
                    ...minProps.initialSettings,
                    singleDatePicker: false,
                    startDate: moment('2021-05-20'),
                    endDate: moment('2021-05-22'),
                }}
            >
                <button>Select a date</button>
            </DatePicker>
        )

        fireEvent.click(getByText('Apply'))

        expect(onSubmit.mock.calls).toMatchSnapshot()
    })
})
