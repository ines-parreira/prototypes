import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { DateTimeFormatMapper, DateTimeFormatType } from 'constants/datetime'
import DatePicker from 'pages/common/forms/DatePicker'
import {
    getDateAndTimeFormatter,
    getTimezone,
} from 'state/currentUser/selectors'

import { END_OF_TODAY_DATE, MIN_RANGE_DATE } from '../../constants'
import { getRangeLabel } from '../helpers/rangeFilter'
import { RangeFilter, ranges } from '../RangeFilter'

jest.mock('../helpers/rangeFilter', () => ({
    getRangeLabel: jest.fn(),
}))

jest.mock('../../../hooks/useAppSelector', () => (fn: () => unknown) => fn())

jest.mock('../../../pages/common/forms/DatePicker', () =>
    jest.fn(({ children }) => <div data-testid="DatePicker">{children}</div>),
)
jest.mock('../../../state/currentUser/selectors', () => ({
    getTimezone: jest.fn(),
    getDateAndTimeFormatter: jest.fn(() => () => {}),
}))

const getTimezoneMock = assumeMock(getTimezone)
const getDateAndTimeFormatterMock = assumeMock(getDateAndTimeFormatter)
const getRangeLabelMock = assumeMock(getRangeLabel)
const DatePickerMock = assumeMock(DatePicker)

describe('RangeFilter', () => {
    const mockSetRangeFilter = jest.fn()
    const timezoneMock = 'UTC'

    beforeEach(() => {
        getRangeLabelMock.mockReturnValue('All time')
        getTimezoneMock.mockReturnValue(timezoneMock)
        getDateAndTimeFormatterMock.mockReturnValue(
            () =>
                DateTimeFormatMapper[
                    DateTimeFormatType.SHORT_DATE_WITH_YEAR_EN_US
                ],
        )
    })

    it('should correctly render', () => {
        const range = { start: null, end: null }

        render(
            <RangeFilter range={range} setRangeFilter={mockSetRangeFilter} />,
        )

        expect(screen.getByText('date')).toBeInTheDocument()
        expect(screen.getByText('All time')).toBeInTheDocument()
        expect(screen.getByTestId('DatePicker')).toBeInTheDocument()
    })

    it('should pass correct props to DatePicker', () => {
        const range = { start: 1672531200000, end: 1672617600000 }

        render(
            <RangeFilter range={range} setRangeFilter={mockSetRangeFilter} />,
        )

        expect(DatePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                initialSettings: expect.objectContaining({
                    startDate: new Date(range.start),
                    endDate: new Date(range.end),
                    minDate: expect.any(Date),
                    maxDate: expect.any(Date),
                    ranges: ranges,
                }),
                userTimezone: timezoneMock,
                onSubmit: expect.any(Function),
                onClear: expect.any(Function),
            }),
            {},
        )
    })

    it('calls setRangeFilter with null values when cleared', () => {
        const range = { start: 1672531200000, end: 1672617600000 }

        render(
            <RangeFilter range={range} setRangeFilter={mockSetRangeFilter} />,
        )

        const datePickerProps = (DatePicker as jest.Mock).mock.calls[0][0]
        datePickerProps.onClear()

        expect(mockSetRangeFilter).toHaveBeenCalledWith({
            start: null,
            end: null,
        })
    })

    it('calls setRangeFilter with correct values on submit', () => {
        const range = { start: null, end: null }

        render(
            <RangeFilter range={range} setRangeFilter={mockSetRangeFilter} />,
        )

        const datePickerProps = (DatePicker as jest.Mock).mock.calls[0][0]
        const mockStartDate = moment(new Date('2023-01-01'))
        const mockEndDate = moment(new Date('2023-01-31'))

        datePickerProps.onSubmit(mockStartDate, mockEndDate)

        expect(mockSetRangeFilter).toHaveBeenCalledWith({
            start: mockStartDate.valueOf(),
            end: mockEndDate.valueOf(),
        })
    })

    it('should call setRangeFilter with null values when start and end ranges equal min / max date', () => {
        const range = { start: null, end: null }

        render(
            <RangeFilter range={range} setRangeFilter={mockSetRangeFilter} />,
        )

        const datePickerProps = DatePickerMock.mock.calls[0][0]
        const mockMinDate = moment(MIN_RANGE_DATE)
        const mockEndDate = moment(END_OF_TODAY_DATE)

        datePickerProps.onSubmit(mockMinDate, mockEndDate)

        expect(mockSetRangeFilter).toHaveBeenCalledWith({
            start: null,
            end: null,
        })
    })
})
