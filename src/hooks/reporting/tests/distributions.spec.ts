import { UseQueryResult } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    CHANNEL_DIMENSION,
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
    selectPerChannel,
    TICKET_COUNT_MEASURE,
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import { fetchPostReporting, usePostReporting } from 'models/reporting/queries'
import { workloadPerChannelDistributionQueryFactory } from 'models/reporting/queryFactories/support-performance/workloadPerChannel'
import { StatsFilters } from 'models/stat/types'
import { humanizeChannel } from 'state/ticket/utils'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

describe('distributions', () => {
    const defaultReportingResponse = {
        isFetching: false,
        isError: false,
    } as UseQueryResult
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'UTC'
    beforeEach(() => {
        usePostReportingMock.mockReturnValue(defaultReportingResponse)
        fetchPostReportingMock.mockResolvedValue({
            data: defaultReportingResponse,
        } as any)
    })

    describe('useWorkloadPerChannelDistribution', () => {
        it('should pass a Workload query and selectPerChannel callback', () => {
            renderHook(() =>
                useWorkloadPerChannelDistribution(statsFilters, timezone),
            )

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [
                    workloadPerChannelDistributionQueryFactory(
                        statsFilters,
                        timezone,
                    ),
                ],
                { select: expect.any(Function) },
            )
            const select = usePostReportingMock.mock.calls[0][1]?.select
            expect(select).toBeTruthy()
            if (select) {
                expect(select({ data: { data: [] } } as any)).toEqual([])
            }
        })

        it('should pass the enabled query flag', () => {
            const enabled = false
            renderHook(() =>
                useWorkloadPerChannelDistribution(
                    statsFilters,
                    timezone,
                    enabled,
                ),
            )

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [
                    workloadPerChannelDistributionQueryFactory(
                        statsFilters,
                        timezone,
                    ),
                ],
                { select: expect.any(Function), enabled },
            )
        })
    })

    describe('fetchWorkloadPerChannelDistribution', () => {
        it('should pass a Workload query and selectPerChannel callback', async () => {
            const apiResponse = {
                ...defaultReportingResponse,
                data: [
                    {
                        [TICKET_COUNT_MEASURE]: '123',
                        [CHANNEL_DIMENSION]: 'api',
                    },
                ],
            }
            fetchPostReportingMock.mockResolvedValue({
                data: apiResponse,
            } as any)

            const response = await fetchWorkloadPerChannelDistribution(
                statsFilters,
                timezone,
            )

            expect(fetchPostReportingMock).toHaveBeenCalledWith([
                workloadPerChannelDistributionQueryFactory(
                    statsFilters,
                    timezone,
                ),
            ])
            expect(response).toEqual({
                data: selectPerChannel(
                    { data: apiResponse } as any,
                    CHANNEL_DIMENSION,
                    TICKET_COUNT_MEASURE,
                ),
            })
        })
    })

    describe('useWorkloadPerChannelDistributionForPreviousPeriod', () => {
        it('should pass filters with previous date', () => {
            renderHook(() =>
                useWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                ),
            )

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [
                    workloadPerChannelDistributionQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    ),
                ],
                { select: expect.any(Function) },
            )
            const select = usePostReportingMock.mock.calls[0][1]?.select
            expect(select).toBeTruthy()
            if (select) {
                expect(select({ data: { data: [] } } as any)).toEqual([])
            }
        })

        it('should pass the enabled query flag', () => {
            const enabled = true
            renderHook(() =>
                useWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                    enabled,
                ),
            )

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [
                    workloadPerChannelDistributionQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    ),
                ],
                { select: expect.any(Function), enabled },
            )
        })
    })

    describe('fetchWorkloadPerChannelDistributionForPreviousPeriod', () => {
        it('should pass a Workload query and selectPerChannel callback', async () => {
            const apiResponse = {
                ...defaultReportingResponse,
                data: [
                    {
                        [TICKET_COUNT_MEASURE]: '123',
                        [CHANNEL_DIMENSION]: 'api',
                    },
                ],
            }
            fetchPostReportingMock.mockResolvedValue({
                data: apiResponse,
            } as any)

            const response =
                await fetchWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone,
                )

            expect(fetchPostReportingMock).toHaveBeenCalledWith([
                workloadPerChannelDistributionQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            ])
            expect(response).toEqual({
                data: selectPerChannel(
                    { data: apiResponse } as any,
                    CHANNEL_DIMENSION,
                    TICKET_COUNT_MEASURE,
                ),
            })
        })
    })

    describe('selectPerChannel', () => {
        it('should humanize channel names and parse measures', () => {
            const dimension = TicketDimension.Channel
            const measure = TicketMeasure.TicketCount
            const queriedData = [
                {
                    [measure]: '123',
                    [dimension]: 'contact_form' as TicketChannel,
                },
                {
                    [measure]: '456',
                    [dimension]: 'facebook-messenger' as TicketChannel,
                },
            ]

            const selectedData = selectPerChannel(
                { data: { data: queriedData } } as any,
                dimension,
                measure,
            )

            expect(selectedData).toEqual([
                {
                    label: humanizeChannel('contact_form'),
                    value: parseFloat('123'),
                },
                {
                    label: humanizeChannel('facebook-messenger'),
                    value: parseFloat('456'),
                },
            ])
        })
    })
})
