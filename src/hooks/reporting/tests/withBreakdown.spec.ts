import {
    BREAKDOWN_FIELD,
    selectTimeSeriesWithBreakdown,
    selectWithBreakdown,
    TAG_SEPARATOR,
    TicketCustomFieldsTicketCountData,
    TicketCustomFieldsTicketCountTimeSeriesData,
    VALUE_FIELD,
    withBreakdown,
} from 'hooks/reporting/withBreakdown'
import { OrderDirection } from 'models/api/types'
import { UsePostReportingQueryData } from 'models/reporting/queries'
import { TicketInsightsOrder } from 'state/ui/stats/ticketInsightsSlice'

describe('withBreakdown', () => {
    const tagL1_1 = 'asd'
    const tagL1_2 = 'rtu'
    const tagL2_1 = 'xyz'
    const tagL2_2 = 'zyx'
    const tagL2_3 = 'same'
    const tagL2_4 = 'jkl'
    const tagL3_1 = 'qwe'
    const tagL3_2 = 'ewq'
    const tagL3_3 = '123'
    const tagL3_4 = 'same'
    const customTags = [
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_1}${TAG_SEPARATOR}${tagL3_1}`,
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_1}${TAG_SEPARATOR}${tagL3_2}`,
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_2}${TAG_SEPARATOR}${tagL3_3}`,
        `${tagL1_1}${TAG_SEPARATOR}${tagL2_3}${TAG_SEPARATOR}${tagL3_4}`,
        `${tagL1_2}${TAG_SEPARATOR}${tagL2_4}`,
    ]

    const results = customTags.map((tag) => ({
        [BREAKDOWN_FIELD]: tag,
        [VALUE_FIELD]: '1',
    }))
    const response = {
        data: {
            data: results,
        },
    } as UsePostReportingQueryData<TicketCustomFieldsTicketCountData[]>

    describe('withBreakdown', () => {
        it('should replace the response data with data with data breakdown', () => {
            const responseWithDeciles = withBreakdown(
                response,
                BREAKDOWN_FIELD,
                VALUE_FIELD,
            )

            expect(responseWithDeciles.data.data).toEqual(
                selectWithBreakdown(results, BREAKDOWN_FIELD, VALUE_FIELD),
            )
        })
    })

    describe('selectWithBreakdown', () => {
        it('should create a hierarchy', () => {
            const breakdown = selectWithBreakdown(
                results,
                BREAKDOWN_FIELD,
                VALUE_FIELD,
            )

            expect(breakdown).toEqual([
                {
                    [BREAKDOWN_FIELD]: tagL1_1,
                    [VALUE_FIELD]: '4',
                    children: [
                        {
                            [BREAKDOWN_FIELD]: tagL2_1,
                            [VALUE_FIELD]: '2',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_1,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                                {
                                    [BREAKDOWN_FIELD]: tagL3_2,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                        {
                            [BREAKDOWN_FIELD]: tagL2_2,
                            [VALUE_FIELD]: '1',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_3,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                        {
                            [BREAKDOWN_FIELD]: tagL2_3,
                            [VALUE_FIELD]: '1',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_4,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    [BREAKDOWN_FIELD]: tagL1_2,
                    [VALUE_FIELD]: '1',
                    children: [
                        {
                            [BREAKDOWN_FIELD]: tagL2_4,
                            [VALUE_FIELD]: '1',
                            children: [],
                        },
                    ],
                },
            ])
        })

        it('should handle timeSeries data', () => {
            const results = customTags.map((tag) => ({
                [BREAKDOWN_FIELD]: tag,
                [VALUE_FIELD]: '1',
            }))

            const breakdown = selectWithBreakdown(
                results,
                BREAKDOWN_FIELD,
                VALUE_FIELD,
            )

            expect(breakdown).toEqual([
                {
                    [BREAKDOWN_FIELD]: tagL1_1,
                    [VALUE_FIELD]: '4',
                    children: [
                        {
                            [BREAKDOWN_FIELD]: tagL2_1,
                            [VALUE_FIELD]: '2',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_1,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                                {
                                    [BREAKDOWN_FIELD]: tagL3_2,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                        {
                            [BREAKDOWN_FIELD]: tagL2_2,
                            [VALUE_FIELD]: '1',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_3,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                        {
                            [BREAKDOWN_FIELD]: tagL2_3,
                            [VALUE_FIELD]: '1',
                            children: [
                                {
                                    [BREAKDOWN_FIELD]: tagL3_4,
                                    [VALUE_FIELD]: '1',
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
                {
                    [BREAKDOWN_FIELD]: tagL1_2,
                    [VALUE_FIELD]: '1',
                    children: [
                        {
                            [BREAKDOWN_FIELD]: tagL2_4,
                            [VALUE_FIELD]: '1',
                            children: [],
                        },
                    ],
                },
            ])
        })
    })

    describe('selectTimeSeriesWithBreakdown', () => {
        const tag1 = `${tagL1_1}${TAG_SEPARATOR}${tagL2_1}${TAG_SEPARATOR}${tagL3_1}`
        const tag2 = `${tagL1_1}${TAG_SEPARATOR}${tagL2_1}${TAG_SEPARATOR}${tagL3_2}`
        const tag3 = `${tagL1_1}${TAG_SEPARATOR}${tagL2_2}${TAG_SEPARATOR}${tagL3_3}`
        const customFields = [tag1, tag2, tag3]
        const day1Value = 2
        const day2Value = 3
        const day3Value = 4

        const timeSeriesData: TicketCustomFieldsTicketCountTimeSeriesData[] =
            customFields.map((tag) => ({
                [BREAKDOWN_FIELD]: tag,
                initialCustomFieldValue: [tag],
                timeSeries: [
                    {
                        label: tag,
                        dateTime: '2022-01-02T00:00:00.000',
                        value: day1Value,
                    },
                    {
                        label: tag,
                        dateTime: '2022-01-03T00:00:00.000',
                        value: day2Value,
                    },
                    {
                        label: tag,
                        dateTime: '2022-01-04T00:00:00.000',
                        value: day3Value,
                    },
                ],
            }))
        const defaultOrder: TicketInsightsOrder = {
            direction: OrderDirection.Asc,
            column: 'label',
        }

        it('should return hierarchy with timeSeries and subtotals', () => {
            const results = selectTimeSeriesWithBreakdown(
                timeSeriesData,
                defaultOrder,
                BREAKDOWN_FIELD,
                VALUE_FIELD,
            )

            expect(results).toEqual([
                {
                    [VALUE_FIELD]:
                        [tagL3_1, tagL3_2, tagL3_3].length *
                        (day1Value + day2Value + day3Value),
                    [BREAKDOWN_FIELD]: tagL1_1,
                    initialCustomFieldValue: [tag1, tag2, tag3],
                    children: [
                        {
                            [VALUE_FIELD]:
                                [tagL3_1, tagL3_2].length *
                                (day1Value + day2Value + day3Value),
                            [BREAKDOWN_FIELD]: tagL2_1,
                            initialCustomFieldValue: [tag1, tag2],
                            children: [
                                {
                                    [VALUE_FIELD]:
                                        day1Value + day2Value + day3Value,
                                    [BREAKDOWN_FIELD]: tagL3_2,
                                    initialCustomFieldValue: [tag2],
                                    children: [],
                                    timeSeries: [
                                        {
                                            dateTime: '2022-01-02T00:00:00.000',
                                            label: tag2,
                                            value: day1Value,
                                        },
                                        {
                                            dateTime: '2022-01-03T00:00:00.000',
                                            label: tag2,
                                            value: day2Value,
                                        },
                                        {
                                            dateTime: '2022-01-04T00:00:00.000',
                                            label: tag2,
                                            value: day3Value,
                                        },
                                    ],
                                },
                                {
                                    [VALUE_FIELD]: 9,
                                    [BREAKDOWN_FIELD]: tagL3_1,
                                    initialCustomFieldValue: [tag1],
                                    children: [],
                                    timeSeries: [
                                        {
                                            dateTime: '2022-01-02T00:00:00.000',
                                            label: tag1,
                                            value: day1Value,
                                        },
                                        {
                                            dateTime: '2022-01-03T00:00:00.000',
                                            label: tag1,
                                            value: day2Value,
                                        },
                                        {
                                            dateTime: '2022-01-04T00:00:00.000',
                                            label: tag1,
                                            value: day3Value,
                                        },
                                    ],
                                },
                            ],
                            timeSeries: [
                                {
                                    dateTime: '2022-01-02T00:00:00.000',
                                    label: tag2,
                                    value:
                                        [tagL3_1, tagL3_2].length * day1Value,
                                },
                                {
                                    dateTime: '2022-01-03T00:00:00.000',
                                    label: tag2,
                                    value:
                                        [tagL3_1, tagL3_2].length * day2Value,
                                },
                                {
                                    dateTime: '2022-01-04T00:00:00.000',
                                    label: tag2,
                                    value:
                                        [tagL3_1, tagL3_2].length * day3Value,
                                },
                            ],
                        },
                        {
                            [VALUE_FIELD]:
                                [tagL3_3].length *
                                (day1Value + day2Value + day3Value),
                            [BREAKDOWN_FIELD]: tagL2_2,
                            initialCustomFieldValue: [tag3],
                            children: [
                                {
                                    [VALUE_FIELD]:
                                        day1Value + day2Value + day3Value,
                                    [BREAKDOWN_FIELD]: tagL3_3,
                                    initialCustomFieldValue: [tag3],
                                    children: [],
                                    timeSeries: [
                                        {
                                            dateTime: '2022-01-02T00:00:00.000',
                                            label: tag3,
                                            value: day1Value,
                                        },
                                        {
                                            dateTime: '2022-01-03T00:00:00.000',
                                            label: tag3,
                                            value: day2Value,
                                        },
                                        {
                                            dateTime: '2022-01-04T00:00:00.000',
                                            label: tag3,
                                            value: day3Value,
                                        },
                                    ],
                                },
                            ],
                            timeSeries: [
                                {
                                    dateTime: '2022-01-02T00:00:00.000',
                                    label: tag3,
                                    value: day1Value,
                                },
                                {
                                    dateTime: '2022-01-03T00:00:00.000',
                                    label: tag3,
                                    value: day2Value,
                                },
                                {
                                    dateTime: '2022-01-04T00:00:00.000',
                                    label: tag3,
                                    value: day3Value,
                                },
                            ],
                        },
                    ],
                    timeSeries: [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: tag3,
                            value: 6,
                        },
                        {
                            dateTime: '2022-01-03T00:00:00.000',
                            label: tag3,
                            value: 9,
                        },
                        {
                            dateTime: '2022-01-04T00:00:00.000',
                            label: tag3,
                            value: 12,
                        },
                    ],
                },
            ])
        })

        it.each([
            {
                order: {
                    column: 'label' as const,
                    direction: OrderDirection.Desc,
                },
                tagsOrder: [tagL2_1, tagL2_2].sort().reverse(),
            },
            {
                order: {
                    column: 'total' as const,
                    direction: OrderDirection.Desc,
                },
                tagsOrder: [tagL2_1, tagL2_2],
            },
            {
                order: {
                    column: 'total' as const,
                    direction: OrderDirection.Asc,
                },
                tagsOrder: [tagL2_2, tagL2_1],
            },
            {
                order: { column: 1, direction: OrderDirection.Asc },
                tagsOrder: [tagL2_2, tagL2_1],
            },
            {
                order: { column: 1, direction: OrderDirection.Desc },
                tagsOrder: [tagL2_1, tagL2_2],
            },
        ])(
            'should order results according to the ordering column and direction %order.column',
            ({
                order,
                tagsOrder,
            }: {
                order: TicketInsightsOrder
                tagsOrder: string[]
            }) => {
                const results = selectTimeSeriesWithBreakdown(
                    timeSeriesData,
                    order,
                    BREAKDOWN_FIELD,
                    VALUE_FIELD,
                )

                expect(
                    results[0].children.map((r) => r[BREAKDOWN_FIELD]),
                ).toEqual(tagsOrder)
            },
        )
    })
})
