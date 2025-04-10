import React from 'react'

import { render } from '@testing-library/react'
import moment from 'moment-timezone'
import { Props as MockDateRangePickerProps } from 'react-bootstrap-daterangepicker'

import { useTheme } from 'core/theme'
import { PeriodPickerContainer, Props } from 'pages/stats/common/PeriodPicker'

const periodPickerClassListMockSpy = jest.fn()
const periodPickerRangesClassListMockSpy = jest.fn()
const periodPickerRangesAttributesListMockSpy = jest.fn()
const mockDateRangePickerTestId = 'MockDateRangePicker'
const mockedEventTarget = {
    container: {
        get: () => ({
            classList: {
                add: periodPickerClassListMockSpy,
            },
            querySelectorAll: () => [],
            querySelector: (val: string) => {
                if (val === '.ranges ul') {
                    return {
                        setAttribute: periodPickerRangesAttributesListMockSpy,
                        classList: { add: periodPickerRangesClassListMockSpy },
                    }
                }
                return null
            },
        }),
    },
}
jest.mock(
    'react-bootstrap-daterangepicker',
    () =>
        ({ onApply, initialSettings, onShow }: MockDateRangePickerProps) => {
            onApply?.({} as any, initialSettings as any)
            return (
                <div
                    data-testid={mockDateRangePickerTestId}
                    data-initial-settings={JSON.stringify(initialSettings)}
                    onClick={(e) => {
                        onShow?.(e as any, mockedEventTarget as any)
                    }}
                    onChange={(e) => {
                        onApply?.(
                            e as any,
                            (e.target as unknown as Record<string, any>).value,
                        )
                    }}
                />
            )
        },
)

jest.spyOn(console, 'error').mockImplementation(() => {})

describe('PeriodPicker', () => {
    const theme = useTheme()

    beforeEach(() => {
        class MockMutationObserver implements MutationObserver {
            constructor(private callback: MutationCallback) {}

            public observe(): void {}

            public disconnect(): void {}

            public takeRecords(): MutationRecord[] {
                return []
            }

            public trigger(mutationsList: MutationRecord[]): void {
                this.callback(mutationsList, this)
            }
        }

        global.MutationObserver = MockMutationObserver as any
    })

    const PickerWithDefaultProps = (additionalProps?: Partial<Props>) => {
        const onChange = jest.fn()
        const startDate = moment.tz('2020-05-02', 'Europe/Paris')
        const endDate = moment.tz('2020-05-07', 'Europe/Paris')
        return (
            <PeriodPickerContainer
                {...additionalProps}
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
    }

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
            />,
        )

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                startDatetime: moment
                    .tz(startDate.format(), userTimezone)
                    .format(),
                endDatetime: moment.tz(endDate.format(), userTimezone).format(),
            }),
        )
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
            />,
        )

        expect(onChange).toHaveBeenCalledWith({
            startDatetime: moment.tz(startDate.format(), 'UTC').format(),
            endDatetime: moment.tz(endDate.format(), 'UTC').format(),
        })
    })

    it('should render default period picker if props related to v1 are provided', () => {
        const pickerV1Props = {
            pickerV2Styles: false,
            rangesOnLeft: false,
            showRangesLabel: true,
            actionButtonsOnTheBottom: false,
            changeButtonColorsToV2: true,
            rangeDatesInFooter: false,
            shouldShowMonthAndYearDropdowns: false,
        }

        const { getByTestId } = render(
            <PickerWithDefaultProps {...pickerV1Props} />,
        )

        getByTestId(mockDateRangePickerTestId).click()

        expect(periodPickerClassListMockSpy).toHaveBeenCalledWith(
            theme.resolvedName,
            'displayed',
        )
        expect(periodPickerRangesClassListMockSpy).toHaveBeenCalledWith(
            'with-label',
        )
        expect(periodPickerRangesAttributesListMockSpy).toHaveBeenCalledWith(
            'label',
            'Shortcuts',
        )
    })

    it('should render with v2 styles', () => {
        const { getByTestId } = render(
            <PickerWithDefaultProps pickerV2Styles={true} />,
        )

        getByTestId(mockDateRangePickerTestId).click()

        expect(periodPickerClassListMockSpy).toHaveBeenNthCalledWith(
            2,
            'picker-v2',
            'apply-v2-styles',
        )
    })

    it('should render with v2 styles and ranges on left', () => {
        const { getByTestId } = render(
            <PickerWithDefaultProps
                pickerV2Styles={true}
                rangesOnLeft={true}
            />,
        )

        getByTestId(mockDateRangePickerTestId).click()

        expect(periodPickerClassListMockSpy).toHaveBeenNthCalledWith(
            2,
            'picker-v2',
            'apply-v2-styles',
        )

        expect(periodPickerClassListMockSpy).toHaveBeenNthCalledWith(
            3,
            'picker-v2',
            'ranges-on-left',
        )
    })

    it('should synchronize dates between React state and DateRangePicker', () => {
        const onChange = jest.fn()
        const startDate = moment.tz('2020-05-02', 'Europe/Paris')
        const endDate = moment.tz('2020-05-07', 'Europe/Paris')

        const { getByTestId } = render(
            <PeriodPickerContainer
                startDatetime={startDate}
                endDatetime={endDate}
                onChange={onChange}
            />,
        )

        const daterangepicker = getByTestId(mockDateRangePickerTestId)
        expect(daterangepicker).toBeInTheDocument()

        const initialSettings = JSON.parse(
            daterangepicker.getAttribute('data-initial-settings') || '{}',
        )
        expect(moment.tz(initialSettings.startDate, 'UTC').format()).toBe(
            moment.tz(startDate.format(), 'UTC').format(),
        )
        expect(moment.tz(initialSettings.endDate, 'UTC').format()).toBe(
            moment.tz(endDate.format(), 'UTC').format(),
        )

        expect(onChange).toHaveBeenCalledWith({
            startDatetime: moment.tz(startDate.format(), 'UTC').format(),
            endDatetime: moment.tz(endDate.format(), 'UTC').format(),
        })
    })

    it('should render ranges without label', () => {
        const { getByTestId } = render(
            <PickerWithDefaultProps showRangesLabel={false} />,
        )

        getByTestId(mockDateRangePickerTestId).click()

        expect(periodPickerRangesClassListMockSpy).not.toHaveBeenCalled()
        expect(periodPickerRangesAttributesListMockSpy).not.toHaveBeenCalled()
    })

    it('should add class names related to buttons on the bottom', () => {
        const { getByTestId } = render(<PickerWithDefaultProps />)

        getByTestId(mockDateRangePickerTestId).click()

        expect(periodPickerClassListMockSpy).toHaveBeenNthCalledWith(
            4,
            'picker-v2',
            'action-buttons-on-the-bottom',
        )
    })

    it('should add class related to date ranges and check that it is added only when buttons on the bottom is enabled', () => {
        const { getByTestId, rerender } = render(
            <PickerWithDefaultProps
                actionButtonsOnTheBottom={false}
                rangeDatesInFooter={true}
            />,
        )

        getByTestId(mockDateRangePickerTestId).click()

        expect(
            periodPickerClassListMockSpy.mock.calls.some((call: string[]) =>
                call.includes('range-dates-in-footer'),
            ),
        ).toBe(false)

        periodPickerClassListMockSpy.mockClear()

        rerender(<PickerWithDefaultProps />)

        getByTestId(mockDateRangePickerTestId).click()

        expect(periodPickerClassListMockSpy.mock.calls.length).toEqual(5)

        expect(periodPickerClassListMockSpy).toHaveBeenNthCalledWith(
            4,
            'picker-v2',
            'action-buttons-on-the-bottom',
        )
        expect(periodPickerClassListMockSpy).toHaveBeenNthCalledWith(
            5,
            'range-dates-in-footer',
        )
    })
})
