import {render} from '@testing-library/react'
import React from 'react'
import {Props as MockDateRangePickerProps} from 'react-bootstrap-daterangepicker'
import moment from 'moment-timezone'
import {useTheme} from 'theme'

import {PeriodPickerContainer, Props} from 'pages/stats/common/PeriodPicker'

const periodPickerClassListMockSpy = jest.fn()
const periodPickerRangesClassListMockSpy = jest.fn()
const periodPickerRangesAttributesListMockSpy = jest.fn()
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
                        classList: {add: periodPickerRangesClassListMockSpy},
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
        ({onApply, initialSettings, onShow}: MockDateRangePickerProps) => {
            onApply?.({} as any, initialSettings as any)
            return (
                <div
                    data-testid="MockDateRangePicker"
                    onClick={(e) => {
                        onShow?.(e as any, mockedEventTarget as any)
                    }}
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

    it('should render default period picker if no props related to v2 are added', () => {
        const {getByTestId} = render(<PickerWithDefaultProps />)

        getByTestId('MockDateRangePicker').click()

        expect(periodPickerClassListMockSpy).toHaveBeenCalledWith(
            theme,
            'displayed'
        )
        expect(periodPickerRangesClassListMockSpy).toHaveBeenCalledWith(
            'with-label'
        )
        expect(periodPickerRangesAttributesListMockSpy).toHaveBeenCalledWith(
            'label',
            'Shortcuts'
        )
    })

    it('should render with v2 styles', () => {
        const {getByTestId} = render(
            <PickerWithDefaultProps pickerV2Styles={true} />
        )

        getByTestId('MockDateRangePicker').click()

        expect(periodPickerClassListMockSpy.mock.calls).toEqual([
            [theme, 'displayed'],
            ['picker-v2', 'apply-v2-styles'],
        ])
    })

    it('should render with v2 styles and ranges on left', () => {
        const {getByTestId} = render(
            <PickerWithDefaultProps pickerV2Styles={true} rangesOnLeft={true} />
        )

        getByTestId('MockDateRangePicker').click()

        expect(periodPickerClassListMockSpy.mock.calls).toEqual([
            [theme, 'displayed'],
            ['picker-v2', 'apply-v2-styles'],
            ['picker-v2', 'ranges-on-left'],
        ])
    })

    it('should render ranges without label', () => {
        const {getByTestId} = render(
            <PickerWithDefaultProps showRangesLabel={false} />
        )

        getByTestId('MockDateRangePicker').click()

        expect(periodPickerRangesClassListMockSpy).not.toHaveBeenCalled()
        expect(periodPickerRangesAttributesListMockSpy).not.toHaveBeenCalled()
    })
})
