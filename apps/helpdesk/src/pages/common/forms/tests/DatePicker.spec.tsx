import type { ComponentProps } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Options } from 'daterangepicker'
import moment from 'moment-timezone'

import { THEME_NAME, useTheme } from 'core/theme'
import { DatePicker } from 'pages/common/forms/DatePicker'

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))

describe('DatePicker', () => {
    let localStorageMock: { [key: string]: string }
    let matchMediaMock: jest.SpyInstance
    const useThemeMock = useTheme as jest.MockedFunction<typeof useTheme>

    const datetime = moment('2021-05-12')

    const minProps: ComponentProps<typeof DatePicker> = {
        initialSettings: {
            applyButtonClasses: 'btn-success mr-2',
            cancelButtonClasses: 'btn-secondary',
            minDate: datetime,
            opens: 'left',
            timePicker: false,
            showCustomRangeLabel: false,
            singleDatePicker: true,
        },
        onSubmit: jest.fn(),
    }

    const listOfV2Classes = [
        'picker-v2',
        'apply-v2-styles',
        'ranges-on-left',
        'action-buttons-on-the-bottom',
        'range-dates-in-footer',
    ]

    const ranges: Options['ranges'] = {
        tomorrow: [datetime.add(1, 'days'), datetime.add(1, 'days')],
    }

    beforeEach(() => {
        useThemeMock.mockReturnValue({
            resolvedName: THEME_NAME.Classic,
            name: THEME_NAME.Classic,
        } as any)

        localStorageMock = {
            theme: JSON.stringify(THEME_NAME.Classic),
        }

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(
                    (key: string) => localStorageMock[key] || null,
                ),
                setItem: jest.fn((key: string, value: string) => {
                    localStorageMock[key] = value
                }),
                removeItem: jest.fn((key: string) => {
                    delete localStorageMock[key]
                }),
                clear: jest.fn(() => {
                    localStorageMock = {}
                }),
            },
            writable: true,
        })

        matchMediaMock = jest.spyOn(window, 'matchMedia')
        matchMediaMock.mockReturnValue({ matches: false })

        const mockDate = new Date('2021-05-14T12:34:56.000Z')
        global.Date.now = jest.fn(() => mockDate.getTime())
    })

    afterEach(() => {
        matchMediaMock.mockRestore()
        jest.clearAllMocks()
    })

    it('should render a date range picker', () => {
        const { baseElement } = render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{
                    ...minProps.initialSettings,
                    ranges,
                }}
            >
                <button>Select a date</button>
            </DatePicker>,
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should display the opened date picker', () => {
        const { getByText } = render(
            <DatePicker
                {...minProps}
                isOpen={true}
                initialSettings={{ showDropdowns: false }}
            >
                <button>Select a date</button>
            </DatePicker>,
        )

        const [dateRangePickerElement] = document.getElementsByClassName(
            'daterangepicker',
        ) as unknown as HTMLDivElement[]

        expect(dateRangePickerElement.classList).toContain('displayed')
        expect(getByText('May 2021')).toBeTruthy()
        expect(getByText('Jun 2021')).toBeTruthy()
    })

    it('should open the date range picker on trigger element click', async () => {
        const showSpy = jest.fn()
        const { getByText } = render(
            <DatePicker {...minProps} toggle={showSpy}>
                <button>Select a date</button>
            </DatePicker>,
        )

        fireEvent.click(getByText('Select a date'))
        await waitFor(() => expect(showSpy).toHaveBeenCalled)
    })

    it('should call toggle callback on click outside', async () => {
        const externalText = document.createElement('div')
        externalText.textContent = 'I am outside'
        document.body.appendChild(externalText)

        const toggleSpy = jest.fn()
        const { getByText } = render(
            <DatePicker {...minProps} isOpen toggle={toggleSpy}>
                <button>Select a date</button>
            </DatePicker>,
        )

        fireEvent.click(getByText(externalText.textContent))
        await waitFor(() => expect(toggleSpy).toHaveBeenCalled)
    })

    it('should call onSubmit with expected date when selecting a date', () => {
        const onSubmit = jest.fn()
        const { getByText } = render(
            <DatePicker {...minProps} isOpen={true} onSubmit={onSubmit}>
                <button>Select a date</button>
            </DatePicker>,
        )

        fireEvent.click(getByText('Apply'))

        expect(onSubmit.mock.calls).toMatchSnapshot()
    })

    it('should call onSubmit with expected range when selecting a range of date', () => {
        const onSubmit = jest.fn()
        const { getByText } = render(
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
            </DatePicker>,
        )

        fireEvent.click(getByText('Apply'))

        expect(onSubmit.mock.calls).toMatchSnapshot()
    })

    it('should open the datepicker with multiple themes', async () => {
        render(
            <DatePicker {...minProps} isOpen={true}>
                <button>Select a date</button>
            </DatePicker>,
        )

        await waitFor(() => {
            const elements = document.getElementsByClassName('daterangepicker')
            expect(elements.length).toBeGreaterThan(0)
        })

        const [dateRangePickerElement] = document.getElementsByClassName(
            'daterangepicker',
        ) as unknown as HTMLDivElement[]

        expect(
            dateRangePickerElement.classList.contains(THEME_NAME.Classic),
        ).toBe(true)
    })

    it('should render date picker without the v2 classnames', () => {
        render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{ ranges }}
            >
                <button>Select a date</button>
            </DatePicker>,
        )
        const datePickerElement = document.querySelector('.datepicker')
        const expectedResult = listOfV2Classes.some((className) =>
            datePickerElement?.classList.contains(className),
        )

        expect(expectedResult).toBe(false)
    })

    it('should render date picker with the v2 classnames', () => {
        render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{ ranges }}
                pickerV2Styles={true}
                rangesOnLeft={true}
                actionButtonsOnTheBottom={true}
                rangeDatesInFooter={true}
            >
                <button>Select a date</button>
            </DatePicker>,
        )
        const datePickerElement = document.querySelector('.datepicker')
        const expectedResult = listOfV2Classes.every((className) =>
            datePickerElement?.classList.contains(className),
        )

        expect(expectedResult).toBe(false)
    })

    it('should render date picker without the "range-dates-in-footer" class if actionButtonsOnTheBottom prop is set to false', () => {
        render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{ ranges }}
                actionButtonsOnTheBottom={false}
                rangeDatesInFooter={true}
            >
                <button>Select a date</button>
            </DatePicker>,
        )
        const datePickerElement = document.querySelector('.datepicker')

        expect(
            [...(datePickerElement?.classList || [])].includes(
                '.range-dates-in-footer',
            ),
        ).toBe(false)
    })

    it('should render date picker with the "action-buttons-on-the-bottom" class and no "range-dates-in-footer" class', () => {
        render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{ ranges }}
                actionButtonsOnTheBottom={true}
            >
                <button>Select a date</button>
            </DatePicker>,
        )
        const datePickerElement = document.querySelector('.datepicker')

        expect(
            [...(datePickerElement?.classList || [])].includes(
                '.action-buttons-on-the-bottom',
            ),
        ).toBe(false)
    })

    it('should render date picker with the ranges label', () => {
        const rangesLabel = 'Snooze Ranges'

        render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{ ranges: ranges }}
                showRangesLabel={true}
                rangesLabel="Snooze Ranges"
            >
                <button>Select a date</button>
            </DatePicker>,
        )

        const rangesListElement = document.querySelector('.ranges ul')

        expect(rangesListElement?.hasAttribute('label')).toBeTruthy()
        expect(rangesListElement?.getAttribute('label')).toEqual(rangesLabel)
    })

    it('should render date picker with no ranges label if showRangesLabel is set to false', () => {
        render(
            <DatePicker
                {...minProps}
                isOpen={true}
                toggle={jest.fn()}
                initialSettings={{ ranges: ranges }}
                rangesLabel="Snooze Ranges"
                showRangesLabel={false}
            >
                <button>Select a date</button>
            </DatePicker>,
        )

        const rangesListElement = document.querySelector('.ranges ul')

        expect(rangesListElement?.hasAttribute('label')).toBeFalsy()
        expect(rangesListElement?.getAttribute('label')).toBe(null)
    })

    it('should respect user timezone', () => {
        const mockDate = new Date('2024-09-09T23:59:59.000Z')
        global.Date.now = jest.fn(() => mockDate.getTime())
        const { getByText } = render(
            <DatePicker
                {...minProps}
                isOpen={true}
                initialSettings={{ showDropdowns: false }}
                userTimezone={'utc'}
            >
                <button>Select a date</button>
            </DatePicker>,
        )

        expect(getByText('Sep 2024')).toBeTruthy()
        expect(getByText('Oct 2024')).toBeTruthy()
    })

    it('should call onClear when the clear button is clicked', () => {
        const onClear = jest.fn()
        render(
            <DatePicker {...minProps} onClear={onClear}>
                <button>Select a date</button>
            </DatePicker>,
        )
        fireEvent.click(screen.getByText('Select a date'))
        fireEvent.click(document.querySelector('.cancelBtn') as Element)

        expect(onClear).toHaveBeenCalled()
    })
})
