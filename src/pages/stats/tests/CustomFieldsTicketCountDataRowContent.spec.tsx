import {render, screen} from '@testing-library/react'
import {forEach} from 'lodash'
import React from 'react'
import {Provider} from 'react-redux'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'
import {BREAKDOWN_FIELD, VALUE_FIELD} from 'hooks/reporting/withBreakdown'
import {CustomFieldsTicketCountDataRowContent} from 'pages/stats/CustomFieldsTicketCountDataRowContent'
import {
    getHeatmapMode,
    getValueMode,
    ValueMode,
    getSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock, mockStore} from 'utils/testing'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'
import {ReportingGranularity} from 'models/reporting/types'

jest.mock('state/ui/stats/ticketInsightsSlice')
jest.mock(
    'state/ui/stats/agentPerformanceSlice',
    () =>
        ({
            ...jest.requireActual('state/ui/stats/agentPerformanceSlice'),
            getCleanStatsFiltersWithTimezone: jest.fn(),
        } as Record<string, any>)
)

const getValueModeMock = assumeMock(getValueMode)
const getHeatmapModeMock = assumeMock(getHeatmapMode)
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone
)
const getSelectedCustomFieldMock = assumeMock(getSelectedCustomField)

describe('<CustomFieldsTicketCountDataRowContent />', () => {
    beforeEach(() => {
        getValueModeMock.mockReturnValue(ValueMode.TotalCount)
        getHeatmapModeMock.mockReturnValue(false)
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            granularity: ReportingGranularity.Week,
            cleanStatsFilters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        } as any)
        getSelectedCustomFieldMock.mockReturnValue({
            id: 123,
            label: 'someLabel',
            isLoading: false,
        })
    })

    it('should format total count values with thousands separator', () => {
        const value = 1234
        const valueWithSeparator = '1,234'
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: 3456,
            initialCustomFieldValue: ['someTag'],
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value,
                    percentage: 15,
                    decile: 2,
                    totalsDecile: 3,
                },
            ],
            percentage: 15,
            decile: 2,
            totalsDecile: 3,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(screen.getByText(valueWithSeparator)).toBeInTheDocument()
        expect(screen.getByText('3,456')).toBeInTheDocument()
    })

    it('should format values as percentages', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const totalPercent = 44.44
        const formattedTotalValue = '44%'
        const percent = 30
        const formattedPercent = '30%'
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: 56,
            initialCustomFieldValue: ['someTag'],
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value: 15,
                    percentage: percent,
                    decile: 2,
                    totalsDecile: 3,
                },
            ],
            percentage: totalPercent,
            decile: 2,
            totalsDecile: 3,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(screen.getByText(formattedTotalValue)).toBeInTheDocument()
        expect(screen.getByText(formattedPercent)).toBeInTheDocument()
    })

    it('should format small values as refined-percentages', () => {
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        const lessThenHalfValue = 0.4
        const lessThenHalfValueAsRefinedPercentage = '0.4%'
        const percent = 0.31
        const formattedPercent = '0.3%'
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: 12,
            initialCustomFieldValue: ['someTag'],
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value: 5,
                    percentage: lessThenHalfValue,
                    decile: 2,
                    totalsDecile: 3,
                },
            ],
            percentage: percent,
            decile: 2,
            totalsDecile: 3,
        }

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        expect(
            screen.getByText(lessThenHalfValueAsRefinedPercentage)
        ).toBeInTheDocument()
        expect(screen.getByText(formattedPercent)).toBeInTheDocument()
    })

    it.each([
        {value: undefined, mode: ValueMode.TotalCount},
        {value: undefined, mode: ValueMode.Percentage},
        {value: 0, mode: ValueMode.TotalCount},
        {value: 0, mode: ValueMode.Percentage},
    ])(
        `should render ${NOT_AVAILABLE_PLACEHOLDER} when value is %`,
        ({value, mode}) => {
            getValueModeMock.mockReturnValue(mode)
            const props = {
                [BREAKDOWN_FIELD]: 'someTag',
                [VALUE_FIELD]: value,
                initialCustomFieldValue: ['someTag'],
                timeSeries: [
                    {
                        dateTime: '2023-08-09',
                        value: 123,
                        percentage: 15,
                        decile: 2,
                        totalsDecile: 3,
                    },
                ],
                percentage: value || 0,
                decile: 2,
                totalsDecile: 3,
            }

            render(
                <Provider store={mockStore({} as any)}>
                    <CustomFieldsTicketCountDataRowContent {...props} />
                </Provider>
            )

            expect(
                screen.getByText(NOT_AVAILABLE_PLACEHOLDER)
            ).toBeInTheDocument()
        }
    )

    it('should render heatmap on level 0 data cells with a decile', () => {
        const decile = 2
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: undefined,
            initialCustomFieldValue: ['someTag'],
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value: 123,
                    percentage: 15,
                    decile: 2,
                    totalsDecile: 3,
                },
            ],
            percentage: 15,
            decile,
            totalsDecile: 3,
            level: 0,
        }
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        getHeatmapModeMock.mockReturnValue(true)

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        forEach(screen.getAllByRole('cell'), (cell, index) => {
            if (index > 0) {
                expect(cell).toHaveClass('heatmap')
                expect(cell).toHaveClass(`p${decile}`)
            }
        })
    })

    it('should not render heatmap on levels other then 0', () => {
        const decile = 2
        const props = {
            [BREAKDOWN_FIELD]: 'someTag',
            [VALUE_FIELD]: undefined,
            initialCustomFieldValue: ['someTag'],
            timeSeries: [
                {
                    dateTime: '2023-08-09',
                    value: 123,
                    percentage: 15,
                    decile: 2,
                    totalsDecile: 3,
                },
            ],
            percentage: 15,
            decile,
            totalsDecile: 3,
            level: 2,
        }
        getValueModeMock.mockReturnValue(ValueMode.Percentage)
        getHeatmapModeMock.mockReturnValue(true)

        render(
            <Provider store={mockStore({} as any)}>
                <CustomFieldsTicketCountDataRowContent {...props} />
            </Provider>
        )

        forEach(screen.getAllByRole('cell'), (cell, index) => {
            if (index > 0) {
                expect(cell).not.toHaveClass('heatmap')
            }
        })
    })
})
