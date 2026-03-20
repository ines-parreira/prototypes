import type { MigrationStage } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import type { AxiosResponse } from 'axios'
import moment from 'moment/moment'

import { stripEscapedQuotes } from 'domains/reporting/hooks/common/utils'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    fetchTimeSeries,
    fetchTimeSeriesPerDimension,
    selectPerDimension,
    selectTimeSeriesByMeasures,
    seriesToTwoDimensionalDataItem,
    useTimeSeries,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    BREAKDOWN_FIELD,
    TAG_SEPARATOR,
    VALUE_FIELD,
} from 'domains/reporting/hooks/withBreakdown'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import type {
    BuiltQuery,
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { MeasureName } from 'domains/reporting/models/scopes/types'
import type {
    ReportingResponse,
    ReportingTimeDimension,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

jest.mock('domains/reporting/models/queries')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const usePostReportingV2Mock = assumeMock(usePostReportingV2)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)
const getNewStatsFeatureFlagMigrationMock = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const useGetNewStatsFeatureFlagMigrationMock = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

describe('useTimeSeries', () => {
    const defaultTimeDimension = {
        dimension: TicketDimension.CreatedDatetime,
        granularity: ReportingGranularity.Hour,
    }

    const defaultQuery: TimeSeriesQuery<TicketCubeWithJoins> = {
        measures: [
            TicketMessagesMeasure.MedianFirstResponseTime,
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        ],
        dimensions: [],
        filters: [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
        ],
        metricName: METRIC_NAMES.TEST_METRIC,
        timeDimensions: [
            defaultTimeDimension as ReportingTimeDimension<unknown>,
        ],
    }
    const defaultData = [
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
        },
    ]
    const defaultResult = {
        annotation: {
            title: 'foo title',
            shortTitle: 'foo',
            type: 'array',
        },
        data: defaultData,
        query: defaultQuery,
    }

    beforeEach(() => {
        usePostReportingV2Mock.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)
        useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
            'off' as MigrationStage,
        )
    })

    const expectedTimeSeriesResult = [
        [
            {
                dateTime: '2022-01-02T00:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 65,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
                },
            },
            {
                dateTime: '2022-01-02T01:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 32,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
                },
            },
            {
                dateTime: '2022-01-02T02:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 0,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
                },
            },
            {
                dateTime: '2022-01-02T03:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 0,
            },
            {
                dateTime: '2022-01-02T04:00:00.000',
                label: TicketMessagesMeasure.MedianFirstResponseTime,
                value: 139,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
                },
            },
        ],
        [
            {
                dateTime: '2022-01-02T00:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 3.4,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
                },
            },
            {
                dateTime: '2022-01-02T01:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 0,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
                },
            },
            {
                dateTime: '2022-01-02T02:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 4.1,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
                },
            },
            {
                dateTime: '2022-01-02T03:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 0,
            },
            {
                dateTime: '2022-01-02T04:00:00.000',
                label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                value: 1.2,
                rawData: {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
                },
            },
        ],
    ]

    it('should call usePostReportingV2Mock with the query', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingV2Mock.mock.calls[0][2]?.select

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            undefined,
            expect.objectContaining({
                select,
                enabled: true,
            }),
        )
    })

    it('should pass enabled=false to usePostReportingV2', () => {
        renderHook(() => useTimeSeries(defaultQuery, undefined, false))

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            undefined,
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should fill in the missing dates', () => {
        renderHook(() => useTimeSeries(defaultQuery))
        const select = usePostReportingV2Mock.mock.calls[0][2]?.select

        expect(
            select?.({
                data: defaultResult,
            } as unknown as AxiosResponse<
                ReportingResponse<typeof defaultData>
            >),
        ).toEqual(expectedTimeSeriesResult)
    })

    it('should make Monday the beginning of the week', () => {
        renderHook(() =>
            useTimeSeries({
                ...defaultQuery,
                measures: [TicketMessagesMeasure.MedianFirstResponseTime],
                filters: [
                    {
                        member: TicketDimension.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2023-04-18T00:00:00.000'],
                    },
                    {
                        member: TicketDimension.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2023-04-20T00:00:00.000'],
                    },
                ],
                timeDimensions: [
                    {
                        ...defaultTimeDimension,
                        granularity: ReportingGranularity.Week,
                    } as ReportingTimeDimension<unknown>,
                ],
            }),
        )
        const select = usePostReportingV2Mock.mock.calls[0][2]?.select

        expect(
            select?.({
                data: {
                    ...defaultResult,
                    data: [
                        {
                            [TicketDimension.CreatedDatetime]:
                                '2023-04-17T00:00:00.000',
                            [TicketMessagesMeasure.MedianFirstResponseTime]: 3,
                        },
                    ],
                },
            } as unknown as AxiosResponse<
                ReportingResponse<typeof defaultData>
            >),
        ).toEqual([
            [
                {
                    dateTime: '2023-04-17T00:00:00.000',
                    label: TicketMessagesMeasure.MedianFirstResponseTime,
                    value: 3,
                    rawData: {
                        [TicketDimension.CreatedDatetime]:
                            '2023-04-17T00:00:00.000',
                        [TicketMessagesMeasure.MedianFirstResponseTime]: 3,
                    },
                },
            ],
        ])
    })

    describe('fetchTimeSeries', () => {
        beforeEach(() => {
            fetchPostReportingV2Mock.mockResolvedValue({
                data: { data: defaultData },
            } as any)
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
        })
        it('should use fetchPostReportingV2 and return formatted data', async () => {
            const result = await fetchTimeSeries(defaultQuery)

            expect(result).toEqual(expectedTimeSeriesResult)
        })

        it('should call fetchPostReportingV2 with V2 query when provided', async () => {
            const queryV2 = {
                metricName: METRIC_NAMES.TEST_METRIC,
                scope: 'test-scope',
                measures: ['testMeasure'],
                filters: [],
            } as any

            const result = await fetchTimeSeries(defaultQuery, queryV2)

            expect(fetchPostReportingV2Mock).toHaveBeenCalledWith(
                [defaultQuery],
                queryV2,
                {},
            )
            expect(result).toEqual(expectedTimeSeriesResult)
        })
    })

    describe('edge cases for select function', () => {
        it('should handle empty data array', () => {
            renderHook(() => useTimeSeries(defaultQuery))
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            const result = select?.({
                data: {
                    ...defaultResult,
                    data: [],
                },
            } as unknown as AxiosResponse<ReportingResponse<never[]>>)

            expect(result).toEqual([
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                ],
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                ],
            ])
        })

        it('should handle single data point with all measures populated', () => {
            renderHook(() => useTimeSeries(defaultQuery))
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            const singleDataPoint = [
                {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '42',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.5',
                    extraField: 'extraValue',
                },
            ]

            const result = select?.({
                data: {
                    ...defaultResult,
                    data: singleDataPoint,
                },
            } as unknown as AxiosResponse<
                ReportingResponse<typeof singleDataPoint>
            >)

            expect(result).toEqual([
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 42,
                        rawData: {
                            [TicketDimension.CreatedDatetime]:
                                '2022-01-02T01:00:00',
                            [TicketMessagesMeasure.MedianFirstResponseTime]:
                                '42',
                            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]:
                                '4.5',
                            extraField: 'extraValue',
                        },
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketMessagesMeasure.MedianFirstResponseTime,
                        value: 0,
                    },
                ],
                [
                    {
                        dateTime: '2022-01-02T00:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T01:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 4.5,
                        rawData: {
                            [TicketDimension.CreatedDatetime]:
                                '2022-01-02T01:00:00',
                            [TicketMessagesMeasure.MedianFirstResponseTime]:
                                '42',
                            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]:
                                '4.5',
                            extraField: 'extraValue',
                        },
                    },
                    {
                        dateTime: '2022-01-02T02:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T03:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                    {
                        dateTime: '2022-01-02T04:00:00.000',
                        label: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
                        value: 0,
                    },
                ],
            ])
        })

        it('should handle data with null and undefined measure values', () => {
            renderHook(() => useTimeSeries(defaultQuery))
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            const dataWithNulls = [
                {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: null,
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: undefined,
                },
                {
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '0',
                },
            ]

            const result = select?.({
                data: {
                    ...defaultResult,
                    data: dataWithNulls,
                },
            } as unknown as AxiosResponse<
                ReportingResponse<typeof dataWithNulls>
            >)

            // Test that rawData is preserved for both data points
            expect(result).toBeDefined()
            expect(Array.isArray(result)).toBe(true)
            if (result && Array.isArray(result) && result.length > 0) {
                expect(result[0][1]?.rawData).toEqual({
                    [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: null,
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: undefined,
                })
                expect(result[0][2]?.rawData).toEqual({
                    [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
                    [TicketMessagesMeasure.MedianFirstResponseTime]: '',
                    [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '0',
                })
            }
        })
    })

    it('should call usePostReportingV2 with V2 queries when provided', () => {
        const migrationMode: MigrationStage = 'shadow'
        useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(migrationMode)
        const queryV2 = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        renderHook(() => useTimeSeries(defaultQuery, queryV2))

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            queryV2,
            expect.objectContaining({
                select: expect.any(Function),
            }),
        )
    })

    it('should return data when using V2 queries', () => {
        const migrationMode: MigrationStage = 'complete'
        useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(migrationMode)
        const queryV2 = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        const singleDataPoint = [
            {
                [TicketDimension.CreatedDatetime]: '2023-04-17T00:00:00.000',
                [TicketMessagesMeasure.MedianFirstResponseTime]: 3,
            },
        ]

        usePostReportingV2Mock.mockReturnValueOnce({
            data: singleDataPoint,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useTimeSeries(defaultQuery, queryV2),
        )

        expect(result.current.data).toEqual(singleDataPoint)
    })
})

describe('selectTimeSeriesByMeasures', () => {
    const defaultTimeDimension = {
        dimension: TicketDimension.CreatedDatetime,
        granularity: ReportingGranularity.Hour,
    } as ReportingTimeDimension<unknown>
    const defaultQuery: TimeSeriesQuery<TicketCubeWithJoins> = {
        measures: [
            TicketMessagesMeasure.MedianFirstResponseTime,
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        ],
        dimensions: [],
        filters: [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
        ],
        metricName: METRIC_NAMES.TEST_METRIC,
        timeDimensions: [defaultTimeDimension],
    }
    const defaultData = [
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '3.4',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T02:00:00',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '4.1',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T04:00:00',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '139',
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]: '1.2',
        },
    ]
    const defaultResult = {
        data: {
            data: defaultData,
        },
    }

    it('should use V1 measures when useV2 is false', () => {
        const result = selectTimeSeriesByMeasures(
            defaultResult as any,
            defaultQuery,
            undefined,
            false,
        )

        expect(result).toHaveLength(2)
        expect(result[0]).toBeDefined()
        expect(result[1]).toBeDefined()
        expect(result[0]?.[0]?.label).toBe(
            TicketMessagesMeasure.MedianFirstResponseTime,
        )
        expect(result[1]?.[0]?.label).toBe(
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        )
    })

    it('should use V1 measures when queryV2 is not provided', () => {
        const result = selectTimeSeriesByMeasures(
            defaultResult as any,
            defaultQuery,
            undefined,
            true,
        )

        expect(result).toHaveLength(2)
        expect(result[0]?.[0]?.label).toBe(
            TicketMessagesMeasure.MedianFirstResponseTime,
        )
        expect(result[1]?.[0]?.label).toBe(
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        )
    })

    it('should use V2 measures when useV2 is true and queryV2 has measures', () => {
        const queryV2 = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['v2Measure1', 'v2Measure2'],
            filters: [
                {
                    member: TicketDimension.PeriodStart,
                    operator: ReportingFilterOperator.AfterDate,
                    values: ['2022-01-02T00:00:00.000'],
                },
                {
                    member: TicketDimension.PeriodEnd,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: ['2022-01-02T05:00:00.000'],
                },
            ],
        } as any

        const v2Query: TimeSeriesQuery<TicketCubeWithJoins> = {
            ...defaultQuery,
            measures: ['v2Measure1', 'v2Measure2'] as any,
        }

        const v2Data = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                v2Measure1: '100',
                v2Measure2: '200',
            },
        ]

        const v2Result = {
            data: {
                data: v2Data,
            },
        }

        const result = selectTimeSeriesByMeasures(
            v2Result as any,
            v2Query,
            queryV2,
            true,
        )

        expect(result).toHaveLength(2)
        expect(result[0]?.[0]?.label).toBe('v2Measure1')
        expect(result[1]?.[0]?.label).toBe('v2Measure2')
    })

    it('should preserve the order of measures from the query with default value', () => {
        const result = selectTimeSeriesByMeasures(
            defaultResult as any,
            defaultQuery,
            undefined,
        )

        expect(result[0]?.[0]?.label).toBe(
            TicketMessagesMeasure.MedianFirstResponseTime,
        )
        expect(result[1]?.[0]?.label).toBe(
            TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        )
    })

    it('should handle missing measures by creating empty data for them', () => {
        const queryWithMissingMeasure: TimeSeriesQuery<TicketCubeWithJoins> = {
            ...defaultQuery,
            measures: [
                TicketMessagesMeasure.MedianFirstResponseTime,
                'nonExistentMeasure' as any,
                TicketSatisfactionSurveyMeasure.AvgSurveyScore,
            ],
        }

        const result = selectTimeSeriesByMeasures(
            defaultResult as any,
            queryWithMissingMeasure,
            undefined,
            false,
        )

        expect(result).toHaveLength(3)
        expect(result[0]).toBeDefined()
        expect(result[1]).toBeDefined()
        expect(result[1]?.[0]?.label).toBe('nonExistentMeasure')
        expect(result[1]?.[0]?.value).toBe(0)
        expect(result[2]).toBeDefined()
    })

    it('should match measures by label in data items', () => {
        const result = selectTimeSeriesByMeasures(
            defaultResult as any,
            defaultQuery,
            undefined,
            false,
        )

        expect(result[0]?.[0]?.value).toBe(65)
        expect(result[0]?.[1]?.value).toBe(32)
        expect(result[0]?.[4]?.value).toBe(139)
        expect(result[1]?.[0]?.value).toBe(3.4)
        expect(result[1]?.[2]?.value).toBe(4.1)
        expect(result[1]?.[4]?.value).toBe(1.2)
    })

    it('should use V1 measures when queryV2 measures is empty', () => {
        const queryV2 = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: [],
            filters: [],
        } as any

        const result = selectTimeSeriesByMeasures(
            defaultResult as any,
            defaultQuery,
            queryV2,
            true,
        )

        expect(result).toHaveLength(0)
    })

    it('should handle empty data array', () => {
        const emptyResult = {
            data: {
                data: [],
            },
        }

        const result = selectTimeSeriesByMeasures(
            emptyResult as any,
            defaultQuery,
            undefined,
            false,
        )

        expect(result).toHaveLength(2)
        expect(result[0]).toBeDefined()
        expect(result[1]).toBeDefined()
    })
})

describe('selectPerDimension', () => {
    const defaultTimeDimension = {
        dimension: TicketDimension.CreatedDatetime,
        granularity: ReportingGranularity.Hour,
    } as ReportingTimeDimension<unknown>
    const defaultQuery: TimeSeriesQuery<TicketCubeWithJoins> = {
        measures: [TicketMessagesMeasure.MedianFirstResponseTime],
        dimensions: [TicketDimension.Channel],
        filters: [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
        ],
        metricName: METRIC_NAMES.TEST_METRIC,
        timeDimensions: [defaultTimeDimension],
    }
    const testScopeMeta = {
        scope: 'test-scope' as any,
        filters: ['periodStart', 'periodEnd'] as const,
        measures: ['medianFirstResponseTime'] as const,
        dimensions: ['agentId'] as const,
        timeDimensions: ['createdDatetime'] as const,
    } as const satisfies ScopeMeta
    const defaultQueryV2: BuiltQuery<typeof testScopeMeta> = {
        metricName: METRIC_NAMES.TEST_METRIC,
        measures: testScopeMeta.measures,
        time_dimensions: [defaultTimeDimension] as any,
        dimensions: testScopeMeta.dimensions,
        filters: [
            {
                member: 'periodStart',
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: 'periodEnd',
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
        ] as ScopeFilters<typeof testScopeMeta>,
        scope: testScopeMeta.scope,
    }

    const defaultData = [
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketDimension.Channel]: 'email',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
            [TicketDimension.Channel]: 'email',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
        },
        {
            [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
            [TicketDimension.Channel]: 'chat',
            [TicketMessagesMeasure.MedianFirstResponseTime]: '45',
        },
    ]

    it('should select dimensions from V1 query when isV2 is false', () => {
        const result = selectPerDimension(
            defaultQuery,
            undefined,
            false,
        )(defaultData)

        expect(result.email).toBeDefined()
        expect(result.chat).toBeDefined()
        expect(result.email[0]).toHaveLength(5)
        expect(result.chat[0]).toHaveLength(5)
    })

    it('should select dimensions from V2 query when isV2 is true', () => {
        const v2Data = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent1',
                medianFirstResponseTime: '65',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                agentId: 'agent1',
                medianFirstResponseTime: '32',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                agentId: 'agent2',
                medianFirstResponseTime: '45',
            },
        ] as any

        const result = selectPerDimension(
            defaultQuery,
            defaultQueryV2,
            true,
        )(v2Data)

        expect(result.agent1).toBeDefined()
        expect(result.agent2).toBeDefined()
        expect(result.agent1[0]).toHaveLength(5)
        expect(result.agent2[0]).toHaveLength(5)
    })

    it('should strip escaped quotes from BREAKDOWN_FIELD dimension values', () => {
        const escapedField = '\"customTag::subTag\"'
        const unEscapedField = 'customTag::subTag'
        const breakdownData = [
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T00:00:00',
                [BREAKDOWN_FIELD]: escapedField,
                [TicketMessagesMeasure.MedianFirstResponseTime]: '65',
            },
            {
                [TicketDimension.CreatedDatetime]: '2022-01-02T01:00:00',
                [BREAKDOWN_FIELD]: escapedField,
                [TicketMessagesMeasure.MedianFirstResponseTime]: '32',
            },
        ] as any

        const breakdownQuery: TimeSeriesQuery<TicketCubeWithJoins> = {
            ...defaultQuery,
            dimensions: [BREAKDOWN_FIELD],
        }

        const result = selectPerDimension(
            breakdownQuery,
            undefined,
        )(breakdownData)

        expect(result).toHaveProperty(unEscapedField)
        expect(result).not.toHaveProperty(escapedField)
        expect(result[unEscapedField]).toBeDefined()
    })
})

describe('TimeSeriesPerDimension', () => {
    const customFieldId = '1'
    const ticketField = 'customTag'
    const ticketFieldL2_1 = 'subTag'
    const ticketFieldL2_2 = 'subTag2'
    const unEscapedField = '\"anotherCustomTag::subTag\"'
    const defaultTimeDimension = {
        dimension:
            TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
        granularity: ReportingGranularity.Hour,
    } as ReportingTimeDimension<unknown>

    const defaultQuery: TimeSeriesQuery<HelpdeskMessageCubeWithJoins> = {
        measures: [VALUE_FIELD],
        dimensions: [BREAKDOWN_FIELD],
        filters: [
            {
                member: TicketDimension.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: ['2022-01-02T00:00:00.000'],
            },
            {
                member: TicketDimension.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: ['2022-01-02T05:00:00.000'],
            },
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [customFieldId],
            },
        ],
        metricName: METRIC_NAMES.TEST_METRIC,
        timeDimensions: [defaultTimeDimension],
    }
    const defaultQueryV2: BuiltQuery<ScopeMeta> = {
        metricName: METRIC_NAMES.TEST_METRIC,
        measures: [VALUE_FIELD] as unknown as readonly MeasureName[],
        time_dimensions: [defaultTimeDimension] as any,
        dimensions: ['agentId'],
        filters: [
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [customFieldId],
            },
        ] as any,
        scope: 'test-scope' as any,
    }
    const defaultData = [
        {
            [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                '2022-01-02T00:00:00',
            [VALUE_FIELD]: '65',
            [BREAKDOWN_FIELD]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
        },
        {
            [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                '2022-01-02T04:00:00',
            [VALUE_FIELD]: '139',
            [BREAKDOWN_FIELD]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
        },
        {
            [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                '2022-01-02T04:00:00',
            [VALUE_FIELD]: '55',
            [BREAKDOWN_FIELD]: unEscapedField,
        },
    ]
    const defaultResult = {
        annotation: {
            title: 'foo title',
            shortTitle: 'foo',
            type: 'array',
        },
        data: defaultData,
        query: defaultQuery,
    }

    describe('useTimeSeriesPerDimension', () => {
        beforeEach(() => {
            useGetNewStatsFeatureFlagMigrationMock.mockReturnValue(
                'off' as MigrationStage,
            )
        })

        it('should return separate time series per escaped dimension value', () => {
            renderHook(() =>
                useTimeSeriesPerDimension(
                    {
                        ...defaultQuery,
                    },
                    defaultQueryV2,
                ),
            )
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            expect(
                select?.({
                    data: defaultResult,
                } as unknown as AxiosResponse<
                    ReportingResponse<typeof defaultData>
                >),
            ).toEqual({
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 65,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T00:00:00',
                                [VALUE_FIELD]: '65',
                            },
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                    ],
                ],
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 139,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '139',
                            },
                        },
                    ],
                ],
                [`${stripEscapedQuotes(unEscapedField)}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 55,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${stripEscapedQuotes(unEscapedField)}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '55',
                            },
                        },
                    ],
                ],
            })
        })

        it('should return separate time series per dimension value', () => {
            const query: TimeSeriesQuery<HelpdeskMessageCubeWithJoins> = {
                measures: [VALUE_FIELD],
                dimensions: [
                    TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                ],
                filters: [
                    {
                        member: TicketDimension.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: ['2022-01-02T00:00:00.000'],
                    },
                    {
                        member: TicketDimension.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: ['2022-01-02T05:00:00.000'],
                    },
                    {
                        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                        operator: ReportingFilterOperator.Equals,
                        values: [customFieldId],
                    },
                ],
                metricName: METRIC_NAMES.TEST_METRIC,
                timeDimensions: [defaultTimeDimension],
            }
            const data = [
                {
                    [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                        '2022-01-02T00:00:00',
                    [VALUE_FIELD]: '65',
                    [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                },
                {
                    [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                        '2022-01-02T04:00:00',
                    [VALUE_FIELD]: '139',
                    [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                },
            ]
            const result = {
                annotation: {
                    title: 'foo title',
                    shortTitle: 'foo',
                    type: 'array',
                },
                data: data,
                query: query,
            }

            renderHook(() =>
                useTimeSeriesPerDimension(
                    {
                        ...query,
                    },
                    defaultQueryV2,
                ),
            )
            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            expect(
                select?.({
                    data: result,
                } as unknown as AxiosResponse<ReportingResponse<typeof data>>),
            ).toEqual({
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 65,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T00:00:00',
                                [VALUE_FIELD]: '65',
                            },
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                    ],
                ],
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 139,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValueString]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '139',
                            },
                        },
                    ],
                ],
            })
        })
    })

    describe('fetchTimeSeriesPerDimension', () => {
        beforeEach(() => {
            getNewStatsFeatureFlagMigrationMock.mockResolvedValue('off')
        })

        it('should return separate time series per dimension value', async () => {
            fetchPostReportingV2Mock.mockResolvedValue({
                data: defaultResult,
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchTimeSeriesPerDimension({
                ...defaultQuery,
            })

            expect(result).toEqual({
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 65,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_1}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T00:00:00',
                                [VALUE_FIELD]: '65',
                            },
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                    ],
                ],
                [`${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 139,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${ticketField}${TAG_SEPARATOR}${ticketFieldL2_2}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '139',
                            },
                        },
                    ],
                ],
                [`${stripEscapedQuotes(unEscapedField)}`]: [
                    [
                        {
                            dateTime: '2022-01-02T00:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T01:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T02:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T03:00:00.000',
                            label: VALUE_FIELD,
                            value: 0,
                        },
                        {
                            dateTime: '2022-01-02T04:00:00.000',
                            label: VALUE_FIELD,
                            value: 55,
                            rawData: {
                                [TicketCustomFieldsDimension.TicketCustomFieldsValue]: `${stripEscapedQuotes(unEscapedField)}`,
                                [TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime]:
                                    '2022-01-02T04:00:00',
                                [VALUE_FIELD]: '55',
                            },
                        },
                    ],
                ],
            })
        })

        it('should call fetchPostReportingV2 with V2 query when provided', async () => {
            const queryV2 = {
                metricName: METRIC_NAMES.TEST_METRIC,
                scope: 'test-scope',
                measures: ['testMeasure'],
                filters: [],
            } as any

            fetchPostReportingV2Mock.mockResolvedValue({
                data: defaultResult,
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchTimeSeriesPerDimension(
                {
                    ...defaultQuery,
                },
                queryV2,
            )

            expect(fetchPostReportingV2Mock).toHaveBeenCalledWith(
                [
                    {
                        ...defaultQuery,
                    },
                ],
                queryV2,
                {},
            )
            expect(result).toBeDefined()
        })
    })
})

describe('seriesToTwoDimensionalDataItem', () => {
    it('should return empty array when no series', () => {
        expect(seriesToTwoDimensionalDataItem(undefined)).toEqual([])
    })

    it('should group item without label under "default" label', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 10,
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series)

        expect(result).toEqual([
            {
                label: 'default',
                values: [
                    {
                        x: '2022-01-01T00:00:00.000',
                        y: 10,
                    },
                ],
            },
        ])
    })

    it('should use provided label for item with label', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 20,
                label: 'test-label',
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series)

        expect(result).toEqual([
            {
                label: 'test-label',
                values: [
                    {
                        x: '2022-01-01T00:00:00.000',
                        y: 20,
                    },
                ],
            },
        ])
    })

    it('should create separate groups for items with different labels', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 30,
                label: 'label-1',
            },
            {
                dateTime: '2022-01-01T01:00:00.000',
                value: 40,
                label: 'label-2',
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series)

        expect(result).toEqual([
            {
                label: 'label-1',
                values: [
                    {
                        x: '2022-01-01T00:00:00.000',
                        y: 30,
                    },
                ],
            },
            {
                label: 'label-2',
                values: [
                    {
                        x: '2022-01-01T01:00:00.000',
                        y: 40,
                    },
                ],
            },
        ])
    })

    it('should override the label based on option', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 20,
                label: 'test-label',
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series, {
            label: 'Custom label',
        })

        expect(result).toEqual([
            {
                label: 'Custom label',
                values: [
                    {
                        x: '2022-01-01T00:00:00.000',
                        y: 20,
                    },
                ],
            },
        ])
    })

    it('should format the date based on option', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 20,
                label: 'test-label',
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series, {
            dateFormatter: (date) => moment(date).format('YYYY-MM-DD'),
        })

        expect(result).toEqual([
            {
                label: 'test-label',
                values: [
                    {
                        x: '2022-01-01',
                        y: 20,
                    },
                ],
            },
        ])
    })

    it('should include end period in date', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 20,
                label: 'test-label',
            },
            {
                dateTime: '2022-01-08T00:00:00.000',
                value: 30,
                label: 'test-label',
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series, {
            dateFormatter: (date) => moment(date).format('YYYY-MM-DD'),
            withEndPeriod: {
                include: true,
                endDate: '2022-01-10T00:00:00.000',
            },
        })

        expect(result).toEqual([
            {
                label: 'test-label',
                values: [
                    {
                        x: '2022-01-01 - 2022-01-07',
                        y: 20,
                    },
                    {
                        x: '2022-01-08 - 2022-01-10',
                        y: 30,
                    },
                ],
            },
        ])
    })

    it('should include end period in date without duplicated end date', () => {
        const series = [
            {
                dateTime: '2022-01-01T00:00:00.000',
                value: 20,
                label: 'test-label',
            },
            {
                dateTime: '2022-01-08T00:00:00.000',
                value: 30,
                label: 'test-label',
            },
        ]

        const result = seriesToTwoDimensionalDataItem(series, {
            dateFormatter: (date) => moment(date).format('YYYY-MM-DD'),
            withEndPeriod: {
                include: true,
                endDate: '2022-01-08T00:00:00.000',
            },
        })

        expect(result).toEqual([
            {
                label: 'test-label',
                values: [
                    {
                        x: '2022-01-01 - 2022-01-07',
                        y: 20,
                    },
                    {
                        x: '2022-01-08',
                        y: 30,
                    },
                ],
            },
        ])
    })
})
