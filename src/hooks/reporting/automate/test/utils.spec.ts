import moment from 'moment'
import {TooltipItem} from 'chart.js'
import {ReportingGranularity} from 'models/reporting/types'
import {SHORT_FORMAT} from 'pages/stats/common/utils'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'
import {
    addZeroValueTimeSeriesForGreyArea,
    mergeAutomateDataByEventType,
    automatePercentLabel,
    AutomateEventType,
    renderAutomateXTickLabel,
    renderAutomateTooltipLabel,
    AUTOMATE_STATS_MEASURE_LABEL_MAP,
    sortByAutomateFeatureLabels,
    automateInteractionsByEventTypeToTimeSeries,
    addNonExistingEventTypesForGraph,
    calculateGreyArea,
} from '../utils'

describe('mergeAutomateDataByEventType', () => {
    it('should merge interactions data by event type correctly', () => {
        const interactionsDataByEventType = {
            eventType1: [
                [
                    {dateTime: '2024-03-20T12:00:00', value: 10},
                    {dateTime: '2024-03-20T12:15:00', value: 15},
                ],
            ],
            eventType2: [
                [
                    {dateTime: '2024-03-20T12:00:00', value: 5},
                    {dateTime: '2024-03-20T12:15:00', value: 8},
                ],
            ],
        }
        const eventTypesToMerge = ['eventType1', 'eventType2']

        const expectedResult = {
            eventType1: [
                [
                    {dateTime: '2024-03-20T12:00:00', value: 15},
                    {dateTime: '2024-03-20T12:15:00', value: 23},
                ],
            ],
        }

        expect(
            mergeAutomateDataByEventType(
                interactionsDataByEventType,
                eventTypesToMerge
            )
        ).toEqual(expectedResult)
    })

    it('should return unchanged data if no event types to merge', () => {
        const interactionsDataByEventType = {
            eventType1: [
                [{dateTime: '2024-03-20T12:00:00', value: 10}],
                [{dateTime: '2024-03-20T12:15:00', value: 15}],
            ],
            eventType2: [
                [{dateTime: '2024-03-20T12:00:00', value: 5}],
                [{dateTime: '2024-03-20T12:15:00', value: 8}],
            ],
        }

        expect(
            mergeAutomateDataByEventType(interactionsDataByEventType, [])
        ).toEqual(interactionsDataByEventType)
    })

    it('should handle empty data correctly', () => {
        const interactionsDataByEventType = {}
        const eventTypesToMerge = ['eventType1', 'eventType2']

        const expectedResult = {}

        expect(
            mergeAutomateDataByEventType(
                interactionsDataByEventType,
                eventTypesToMerge
            )
        ).toEqual(expectedResult)
    })
})

describe('addZeroValueTimeSeriesForGreyArea', () => {
    const showGreyArea = {from: moment('2024-03-15'), to: moment('2024-03-20')}
    it('should add zero value time series data for each dateTime in showGreyArea', () => {
        const timeSeries = [
            {
                label: 'series1',
                values: [
                    {x: moment('2024-03-10').format(SHORT_FORMAT), y: 10},
                    {x: moment('2024-03-25').format(SHORT_FORMAT), y: 20},
                ],
            },
        ]
        const expectedOutput = [
            {
                label: 'series1',
                values: [
                    {x: moment('2024-03-10').format(SHORT_FORMAT), y: 10},
                    {x: moment('2024-03-15').format(SHORT_FORMAT), y: 0},
                    {x: moment('2024-03-16').format(SHORT_FORMAT), y: 0},
                    {x: moment('2024-03-17').format(SHORT_FORMAT), y: 0},
                    {x: moment('2024-03-18').format(SHORT_FORMAT), y: 0},
                    {x: moment('2024-03-19').format(SHORT_FORMAT), y: 0},
                    {x: moment('2024-03-20').format(SHORT_FORMAT), y: 0},
                    {x: moment('2024-03-25').format(SHORT_FORMAT), y: 20},
                ],
            },
        ]
        const result = addZeroValueTimeSeriesForGreyArea(
            showGreyArea,
            timeSeries
        )
        expect(result).toEqual(expectedOutput)
    })

    it('should return the original timeSeries if showGreyArea is empty', () => {
        const timeSeries = [
            {
                label: 'series1',
                values: [],
            },
            {
                label: 'series2',
                values: [],
            },
        ]
        const result = addZeroValueTimeSeriesForGreyArea(
            showGreyArea,
            timeSeries
        )
        expect(result).toEqual(timeSeries)
    })
})
describe('automatePercentLabel', () => {
    it('should correctly format numbers as percentages', () => {
        const input = 0.1234
        const expectedOutput = '12.34%'
        const result = automatePercentLabel(input)
        expect(result).toBe(expectedOutput)
    })

    it('should round percentages to two decimal places', () => {
        const input = 0.129
        const expectedOutput = '12.9%'
        const result = automatePercentLabel(input)
        expect(result).toBe(expectedOutput)
    })

    it('should leave strings unchanged', () => {
        const input = 'Not a number'
        const result = automatePercentLabel(input)
        expect(result).toBe(input)
    })

    it('should return 0% for input 0', () => {
        const input = 0
        const expectedOutput = '0%'
        const result = automatePercentLabel(input)
        expect(result).toBe(expectedOutput)
    })

    it('should return 100% for input 1', () => {
        const input = 1
        const expectedOutput = '100%'
        const result = automatePercentLabel(input)
        expect(result).toBe(expectedOutput)
    })
    it('should return 100% for input 1', () => {
        const input = 'Label'
        const expectedOutput = 'Label'
        const result = automatePercentLabel(input)
        expect(result).toBe(expectedOutput)
    })
})
describe('calculateGreyArea', () => {
    it('should return the correct grey area', () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-03-20T00:00:00Z'))

        const startDate = moment('2024-03-15T00:00:00Z')
        const endDate = moment('2024-03-20T00:00:00Z')

        const result = calculateGreyArea(startDate, endDate)
        expect(result?.from.toISOString()).toEqual('2024-03-17T00:00:00.000Z')
        expect(result?.to.toISOString()).toEqual('2024-03-20T00:00:00.000Z')
    })

    it('should return the correct grey area', () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-03-20T00:00:00Z'))

        const startDate = moment('2024-03-15T00:00:00Z')
        const endDate = moment('2024-03-18T00:00:00Z')

        const result = calculateGreyArea(startDate, endDate)
        expect(result?.from.toISOString()).toEqual('2024-03-17T00:00:00.000Z')
        expect(result?.to.toISOString()).toEqual('2024-03-18T00:00:00.000Z')
    })

    it('should return the correct grey area', () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-03-30T00:00:00Z'))

        const startDate = moment('2024-03-15T00:00:00Z')
        const endDate = moment('2024-03-20T00:00:00Z')

        const result = calculateGreyArea(startDate, endDate)
        expect(result).toBeNull()
    })
})

describe('addNonExistingEventTypesForGraph', () => {
    it('should add non-existing event types with zero values to interactions data', () => {
        const interactionsDataByEventType = {
            [AutomateEventType.TRACK_ORDER]: [
                [
                    {
                        dateTime: '2024-01-01T00:00:00.000',
                        value: 10,
                        label: AutomateEventType.TRACK_ORDER,
                    },
                ],
            ],
            [AutomateEventType.QUICK_RESPONSE_STARTED]: [
                [
                    {
                        dateTime: '2024-01-01T00:00:00.000',
                        value: 15,
                        label: AutomateEventType.QUICK_RESPONSE_STARTED,
                    },
                ],
            ],
        }

        const filter = {
            period: {
                start_datetime: '2024-01-01T00:00:00.000',
                end_datetime: '2024-01-03T00:00:00.000',
            },
        }
        const granularity = ReportingGranularity.Day

        const result = addNonExistingEventTypesForGraph(
            interactionsDataByEventType,
            filter,
            granularity
        )
        Object.values(AutomateEventType).forEach((eventType) => {
            expect(result).toHaveProperty(eventType)
            expect(result[eventType]).toHaveLength(1)
            expect(result[eventType][0][0]).toEqual({
                dateTime: '2024-01-01T00:00:00.000',
                value:
                    eventType in interactionsDataByEventType
                        ? interactionsDataByEventType[eventType][0][0].value
                        : 0,
                label: eventType,
            })
        })
    })

    it('should handle empty interactionsDataByEventType', () => {
        const interactionsDataByEventType = {}

        const filter = {
            period: {
                start_datetime: '2024-01-01T00:00:00.000',
                end_datetime: '2024-01-03T00:00:00.000',
            },
        }
        const granularity = ReportingGranularity.Day

        const result = addNonExistingEventTypesForGraph(
            interactionsDataByEventType,
            filter,
            granularity
        )

        Object.values(AutomateEventType).forEach((eventType) => {
            expect(result).toHaveProperty(eventType)
            expect(result[eventType]).toHaveLength(1)
            expect(result[eventType][0][0]).toEqual({
                dateTime: '2024-01-01T00:00:00.000',
                value: 0,
                label: eventType,
            })
        })
    })
})

describe('renderAutomateXTickLabel', () => {
    const scaleMock = {
        getLabelForValue: jest.fn(),
    }
    beforeEach(() => {
        scaleMock.getLabelForValue.mockClear()
    })

    test('renders valid date label', () => {
        const validDate = 'Mar 25th, 2024'
        scaleMock.getLabelForValue.mockReturnValue(validDate)
        const result = renderAutomateXTickLabel.call(
            scaleMock as any,
            validDate,
            0
        )
        expect(result).toBe(moment(validDate, SHORT_FORMAT).format('MMM D'))
    })

    test('returns original label for invalid date', () => {
        const invalidDate = 'Invalid Date'
        scaleMock.getLabelForValue.mockReturnValue(invalidDate)

        const result = renderAutomateXTickLabel.call(
            scaleMock as any,
            invalidDate,
            0
        )

        expect(result).toBe(invalidDate)
    })
})
describe('renderAutomateTooltipLabel', () => {
    test('renders tooltip label without percentage', () => {
        const tooltipItem = {
            raw: 10,
            dataset: {label: 'Dataset Label'},
        } as TooltipItem<'line'>
        const expectedLabel = 'Dataset Label:  10'

        const result = renderAutomateTooltipLabel(false)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })

    test('renders tooltip label with percentage', () => {
        const tooltipItem = {
            raw: 0.1,
            dataset: {label: 'Dataset Label'},
        } as TooltipItem<'line'>
        const expectedLabel = 'Dataset Label:  10%'

        const result = renderAutomateTooltipLabel(true)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })

    test('renders tooltip label with no dataset label', () => {
        const tooltipItem = {
            raw: 0.1,
            dataset: {label: undefined},
        } as TooltipItem<'line'>
        const expectedLabel = ':  10%'

        const result = renderAutomateTooltipLabel(true)(tooltipItem)

        expect(result).toEqual(expectedLabel)
    })
})
describe('sortByAutomateFeatureLabels', () => {
    const labels = Object.values(AUTOMATE_STATS_MEASURE_LABEL_MAP)

    test('sorts labels in ascending order', () => {
        const unsortedLabels = [
            {label: labels[3]}, // Random order
            {label: labels[1]},
            {label: labels[0]},
            {label: labels[2]},
        ]

        const expectedOrder = [
            {label: labels[0]},
            {label: labels[1]},
            {label: labels[2]},
            {label: labels[3]},
        ]

        const sortedLabels = unsortedLabels.sort(sortByAutomateFeatureLabels)

        expect(sortedLabels).toEqual(expectedOrder)
    })

    test('No sorting will be applied as it is sorted', () => {
        const sortedLabels = [
            {label: labels[0]},
            {label: labels[1]},
            {label: labels[2]},
            {label: labels[3]},
        ]
        expect(sortedLabels.sort(sortByAutomateFeatureLabels)).toEqual(
            sortedLabels
        )
    })
})
describe('automateInteractionsByEventTypeToTimeSeries', () => {
    test('should convert interactions data by event type to time series data', () => {
        const interactionsDataByEventType: Record<
            string,
            TimeSeriesDataItem[][]
        > = {
            [AutomateEventType.TRACK_ORDER]: [
                [{dateTime: '2024-03-25T12:00:00', value: 5}],
            ],
            [AutomateEventType.QUICK_RESPONSE_STARTED]: [
                [{dateTime: '2024-03-25T12:00:00', value: 10}],
            ],
        }
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: '2021-02-03T00:00:00.000Z',
                end_datetime: '2021-02-03T23:59:59.999Z',
            },
        }

        const granularity = ReportingGranularity.Hour

        const result = automateInteractionsByEventTypeToTimeSeries(
            statsFilters,
            granularity,
            interactionsDataByEventType
        )

        // Check if data is converted properly
        expect(result.length).toBe(
            Object.keys(AUTOMATE_STATS_MEASURE_LABEL_MAP).length
        )

        // Hour granularrity to 24 items
        expect(result[2].length).toBe(24)

        expect(result[0][0].label).toBe(
            AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder
        )
        expect(result[0][0].value).toBe(5)
        expect(result[1][0].label).toBe(
            AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse
        )
        expect(result[1][0].value).toBe(10)
    })
})
