import {renderHook} from '@testing-library/react-hooks'
import {TooltipItem} from 'chart.js'
import moment from 'moment'

import {
    customFieldsMetric,
    emptyMetric,
    totalTicketsMetric,
} from 'fixtures/aiAgentInsights'
import {QueryReturnType} from 'hooks/reporting/useMetricPerDimension'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {BREAKDOWN_FIELD} from 'hooks/reporting/withBreakdown'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {SHORT_FORMAT} from 'pages/stats/common/utils'

import {CUSTOM_FIELD_COUNT, TICKET_COUNT} from '../types'
import {useAutomateStatsMeasureLabelMap} from '../useAutomateStatsMeasureLabelMap'
import {
    addZeroValueTimeSeriesForGreyArea,
    mergeAutomateDataByEventType,
    automatePercentLabel,
    AutomateEventType,
    renderAutomateXTickLabel,
    renderAutomateTooltipLabel,
    sortByAutomateFeatureLabels,
    automateInteractionsByEventTypeToTimeSeries,
    addNonExistingEventTypesForGraph,
    calculateGreyArea,
    sortAllData,
    enrichWithAutomationOpportunity,
    enrichWithSuccessRate,
    calculateAiAgentKnowledgeResourcePerIntent,
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
    it('should handle existing dates in the time series correctly', () => {
        const timeSeries = [
            {
                label: 'series1',
                values: [
                    {x: moment('2024-03-15').format(SHORT_FORMAT), y: 10},
                    {x: moment('2024-03-16').format(SHORT_FORMAT), y: 20},
                    {x: moment('2024-03-18').format(SHORT_FORMAT), y: 30},
                ],
            },
        ]
        const expectedOutput = [
            {
                label: 'series1',
                values: [
                    {x: moment('2024-03-15').format(SHORT_FORMAT), y: 10}, // Existing date, should not change
                    {x: moment('2024-03-16').format(SHORT_FORMAT), y: 20}, // Existing date, should not change
                    {x: moment('2024-03-17').format(SHORT_FORMAT), y: 0}, // New date
                    {x: moment('2024-03-18').format(SHORT_FORMAT), y: 30}, // Existing date, should not change
                    {x: moment('2024-03-19').format(SHORT_FORMAT), y: 0}, // New date
                    {x: moment('2024-03-20').format(SHORT_FORMAT), y: 0}, // New date
                ],
            },
        ]
        const result = addZeroValueTimeSeriesForGreyArea(
            showGreyArea,
            timeSeries
        )
        expect(result).toEqual(expectedOutput)
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
    it('should add non-existing event types with zero values to interactions data with weekly granularity', () => {
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
                end_datetime: '2024-01-21T00:00:00.000',
            },
        }
        const granularity = ReportingGranularity.Week

        const dateTimes = ['2024-01-01T00:00:00.000']

        const result = addNonExistingEventTypesForGraph(
            interactionsDataByEventType,
            filter,
            granularity
        )

        Object.values(AutomateEventType).forEach((eventType) => {
            expect(result).toHaveProperty(eventType)
            expect(result[eventType]).toHaveLength(1)
            dateTimes.forEach((dateTime, index) => {
                expect(result[eventType][0][index]).toEqual({
                    dateTime,
                    value:
                        eventType in interactionsDataByEventType
                            ? interactionsDataByEventType[eventType][0][0].value
                            : 0,
                    label: eventType,
                })
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
    const {result} = renderHook(() => useAutomateStatsMeasureLabelMap())
    const automateStatsMeasureLabelMap = result.current
    const labels = Object.values(automateStatsMeasureLabelMap)

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

        const sortedLabels = unsortedLabels.sort(
            sortByAutomateFeatureLabels(automateStatsMeasureLabelMap)
        )

        expect(sortedLabels).toEqual(expectedOrder)
    })

    test('No sorting will be applied as it is sorted', () => {
        const sortedLabels = [
            {label: labels[0]},
            {label: labels[1]},
            {label: labels[2]},
            {label: labels[3]},
        ]
        expect(
            sortedLabels.sort(
                sortByAutomateFeatureLabels(automateStatsMeasureLabelMap)
            )
        ).toEqual(sortedLabels)
    })
})
describe('automateInteractionsByEventTypeToTimeSeries', () => {
    test('should convert interactions data by event type to time series data', () => {
        const {result: mapResult} = renderHook(() =>
            useAutomateStatsMeasureLabelMap()
        )
        const automateStatsMeasureLabelMap = mapResult.current

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
            Object.keys(automateStatsMeasureLabelMap).length
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
    test('should convert interactions data by event type to time series data', () => {
        const interactionsDataByEventType: Record<
            string,
            TimeSeriesDataItem[][]
        > = {
            ['Others']: [[{dateTime: '2024-03-25T12:00:00', value: 5}]],
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
        expect(result.length).toBe(9)

        // Hour granularrity to 24 items
        expect(result[2].length).toBe(24)

        expect(result[0][0].label).toBe('Others')
        expect(result[0][0].value).toBe(5)
    })
})

describe('sortAllData', () => {
    const mockDataWithAutomationOpportunity = [
        {
            automationOpportunity: 0.5,
            [BREAKDOWN_FIELD]: 'A',
            [TICKET_COUNT]: '2',
            [CUSTOM_FIELD_COUNT]: '1',
        },
        {
            automationOpportunity: 0.2,
            [BREAKDOWN_FIELD]: 'B',
            [TICKET_COUNT]: '5',
            [CUSTOM_FIELD_COUNT]: '1',
        },
        {
            automationOpportunity: 0.8,
            [BREAKDOWN_FIELD]: 'C',
            [TICKET_COUNT]: '4',
            [CUSTOM_FIELD_COUNT]: '3',
        },
    ]
    it('should sort data with automationOpportunity in ascending order', () => {
        const result = sortAllData(
            mockDataWithAutomationOpportunity,
            'automationOpportunity',
            OrderDirection.Asc
        )
        expect(result).toEqual([
            {
                automationOpportunity: 0.2,
                [BREAKDOWN_FIELD]: 'B',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
            },
            {
                automationOpportunity: 0.5,
                [BREAKDOWN_FIELD]: 'A',
                [TICKET_COUNT]: '2',
                [CUSTOM_FIELD_COUNT]: '1',
            },
            {
                automationOpportunity: 0.8,
                [BREAKDOWN_FIELD]: 'C',
                [TICKET_COUNT]: '4',
                [CUSTOM_FIELD_COUNT]: '3',
            },
        ])
    })

    it('should sort data with automationOpportunity in descending order', () => {
        const result = sortAllData(
            mockDataWithAutomationOpportunity,
            'automationOpportunity',
            OrderDirection.Desc
        )
        expect(result).toEqual([
            {
                automationOpportunity: 0.8,
                [BREAKDOWN_FIELD]: 'C',
                [TICKET_COUNT]: '4',
                [CUSTOM_FIELD_COUNT]: '3',
            },

            {
                automationOpportunity: 0.5,
                [BREAKDOWN_FIELD]: 'A',
                [TICKET_COUNT]: '2',
                [CUSTOM_FIELD_COUNT]: '1',
            },
            {
                automationOpportunity: 0.2,
                [BREAKDOWN_FIELD]: 'B',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
            },
        ])
    })

    it('should handle empty array', () => {
        const result = sortAllData(
            [],
            'automationOpportunity',
            OrderDirection.Asc
        )
        expect(result).toEqual([])
    })
})

describe('enrichWithAutomationOpportunity', () => {
    it('should return enriched data sorted in descending order by default', () => {
        const result = enrichWithAutomationOpportunity(
            customFieldsMetric,
            '5',
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        )
        expect(result).toEqual([
            {
                [BREAKDOWN_FIELD]: 'Other::Platform',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '3',
                automationOpportunity: 0.6,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::Other',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
                automationOpportunity: 0.2,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::App',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
                automationOpportunity: 0.2,
            },
        ])
    })

    it('should return enriched data sorted in ascending order', () => {
        const result = enrichWithAutomationOpportunity(
            customFieldsMetric,
            '5',
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            OrderDirection.Asc
        )
        expect(result).toEqual([
            {
                [BREAKDOWN_FIELD]: 'Other::Other',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
                automationOpportunity: 0.2,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::App',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
                automationOpportunity: 0.2,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::Platform',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '3',
                automationOpportunity: 0.6,
            },
        ])
    })

    it('should return an empty array if allData is empty', () => {
        const result = enrichWithAutomationOpportunity(
            emptyMetric,
            '5',
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        )
        expect(result).toEqual([])
    })
})

describe('enrichWithSuccessRate', () => {
    it('should return enriched data sorted in ascending order by default', () => {
        const result = enrichWithSuccessRate(
            customFieldsMetric,
            totalTicketsMetric,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        )
        expect(result).toEqual([
            {
                [BREAKDOWN_FIELD]: 'Other::Other',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
                successRate: 0.2,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::App',
                [TICKET_COUNT]: '4',
                [CUSTOM_FIELD_COUNT]: '1',
                successRate: 0.25,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::Platform',
                [TICKET_COUNT]: '10',
                [CUSTOM_FIELD_COUNT]: '3',
                successRate: 0.3,
            },
        ])
    })

    it('should return enriched data sorted in descending order', () => {
        const result = enrichWithSuccessRate(
            customFieldsMetric,
            totalTicketsMetric,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
            OrderDirection.Desc
        )
        expect(result).toEqual([
            {
                [BREAKDOWN_FIELD]: 'Other::Platform',
                [TICKET_COUNT]: '10',
                [CUSTOM_FIELD_COUNT]: '3',
                successRate: 0.3,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::App',
                [TICKET_COUNT]: '4',
                [CUSTOM_FIELD_COUNT]: '1',
                successRate: 0.25,
            },
            {
                [BREAKDOWN_FIELD]: 'Other::Other',
                [TICKET_COUNT]: '5',
                [CUSTOM_FIELD_COUNT]: '1',
                successRate: 0.2,
            },
        ])
    })

    it('should return an empty array if filteredData is empty', () => {
        const result = enrichWithSuccessRate(
            customFieldsMetric,
            emptyMetric,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
        )
        expect(result).toEqual([])
    })
})

describe('calculateAiAgentKnowledgeResourcePerIntent', () => {
    it('returns correct resource mapping for valid inputs', () => {
        const aiAgentTicketsWithIntentData = [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'intentA',
                [TicketDimension.TicketId]: 'ticket1',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'intentB',
                [TicketDimension.TicketId]: 'ticket2',
            },
        ]
        const resourcePerTicketIdData = [
            {
                'AutomationDataset.ticketId': 'ticket1',
                [AutomationDatasetMeasure.AutomatedInteractions]: '5',
            },
            {
                'AutomationDataset.ticketId': 'ticket2',
                [AutomationDatasetMeasure.AutomatedInteractions]: '3',
            },
        ]

        const result = calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntentData,
            resourcePerTicketIdData
        )

        expect(result).toEqual([
            {'TicketCustomFieldsEnriched.valueString': 'intentA', resources: 5},
            {'TicketCustomFieldsEnriched.valueString': 'intentB', resources: 3},
        ])
    })

    it('returns empty array when no intents are present', () => {
        const aiAgentTicketsWithIntentData: QueryReturnType<Cubes> = []
        const resourcePerTicketIdData: QueryReturnType<Cubes> = []

        const result = calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntentData,
            resourcePerTicketIdData
        )

        expect(result).toEqual([])
    })

    it('ignores tickets without matching resources', () => {
        const aiAgentTicketsWithIntentData = [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'intentA',
                [TicketDimension.TicketId]: 'ticket1',
            },
        ]
        const resourcePerTicketIdData: QueryReturnType<Cubes> = []

        const result = calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntentData,
            resourcePerTicketIdData
        )

        expect(result).toEqual([
            {'TicketCustomFieldsEnriched.valueString': 'intentA', resources: 0},
        ])
    })

    it('handles multiple resources for the same intent', () => {
        const aiAgentTicketsWithIntentData = [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'intentA',
                [TicketDimension.TicketId]: 'ticket1',
            },
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    'intentA',
                [TicketDimension.TicketId]: 'ticket2',
            },
        ]
        const resourcePerTicketIdData = [
            {
                'AutomationDataset.ticketId': 'ticket1',
                [AutomationDatasetMeasure.AutomatedInteractions]: '5',
            },
            {
                'AutomationDataset.ticketId': 'ticket2',
                [AutomationDatasetMeasure.AutomatedInteractions]: '3',
            },
        ]

        const result = calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntentData,
            resourcePerTicketIdData
        )

        expect(result).toEqual([
            {'TicketCustomFieldsEnriched.valueString': 'intentA', resources: 8},
        ])
    })

    it('handles tickets with null intents', () => {
        const aiAgentTicketsWithIntentData = [
            {
                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]:
                    null,
                [TicketDimension.TicketId]: 'ticket1',
            },
        ]
        const resourcePerTicketIdData = [
            {
                'AutomationDataset.ticketId': 'ticket1',
                [AutomationDatasetMeasure.AutomatedInteractions]: '5',
            },
        ]

        const result = calculateAiAgentKnowledgeResourcePerIntent(
            aiAgentTicketsWithIntentData,
            resourcePerTicketIdData
        )

        expect(result).toEqual([])
    })
})
