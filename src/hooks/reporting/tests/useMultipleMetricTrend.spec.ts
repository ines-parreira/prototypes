import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {
    AutomationDatasetCube,
    AutomationDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'

import {useMultipleMetricsTrends} from '../useMultipleMetricsTrend'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useMultipleMetricTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const defaultQuery: ReportingQuery<AutomationDatasetCube> = {
        measures: [
            AutomationDatasetMeasure.AutomatedInteractions,
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
        ],
        dimensions: [],
        filters: [],
    }

    beforeEach(() => {
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries are fetching', () => {
        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=false when no queries errored', () => {
        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.isError).toBe(false)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return empty data when the queries does not have data', () => {
        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.data).toEqual({
            [AutomationDatasetMeasure.AutomatedInteractions]: {
                prevValue: null,
                value: null,
            },
            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: {
                prevValue: null,
                value: null,
            },
        })
    })

    it('should return data value', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: {
                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
            },
        } as UseQueryResult)
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: null,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.data).toEqual({
            [AutomationDatasetMeasure.AutomatedInteractions]: {
                prevValue: null,
                value: 10,
            },
            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: {
                prevValue: null,
                value: 11,
            },
        })
    })
    it('should return data value and prevValue', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: {
                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
            },
        } as UseQueryResult)
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: {
                [AutomationDatasetMeasure.AutomatedInteractions]: 20,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 21,
            },
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, defaultQuery)
        )

        expect(result.current.data).toEqual({
            [AutomationDatasetMeasure.AutomatedInteractions]: {
                prevValue: 20,
                value: 10,
            },
            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: {
                prevValue: 21,
                value: 11,
            },
        })
    })

    it('should call usePostReporting with the query', () => {
        const data = {
            data: {
                data: [
                    {
                        [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
                    },
                ],
            },
        } as any

        const prevPeriodQuery = {
            ...defaultQuery,
            measures: [
                AutomationDatasetMeasure.AutomatedInteractions,
                AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            ],
        }
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: {
                [AutomationDatasetMeasure.AutomatedInteractions]: 10,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
            },
        } as UseQueryResult)
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: {
                [AutomationDatasetMeasure.AutomatedInteractions]: 20,
                [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 21,
            },
        } as UseQueryResult)

        renderHook(() =>
            useMultipleMetricsTrends(defaultQuery, prevPeriodQuery)
        )

        const defaultSelect = usePostReportingMock.mock.calls[0][1]?.select
        const previousSelect = usePostReportingMock.mock.calls[1][1]?.select

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [defaultQuery],
            expect.objectContaining({
                select: defaultSelect,
            })
        )
        expect(defaultSelect?.(data)).toEqual({
            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
        })

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [prevPeriodQuery],
            expect.objectContaining({
                select: usePostReportingMock.mock.calls[1][1]?.select,
            })
        )
        expect(previousSelect?.(data)).toEqual({
            [AutomationDatasetMeasure.AutomatedInteractions]: 10,
            [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]: 11,
        })
    })
})
