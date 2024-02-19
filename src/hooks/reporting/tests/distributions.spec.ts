import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import LD from 'launchdarkly-react-client-sdk'
import moment from 'moment/moment'
import {TicketChannel} from 'business/types/ticket'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    selectPerChannel,
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {usePostReporting} from 'models/reporting/queries'
import {workloadPerChannelDistributionQueryFactory} from 'models/reporting/queryFactories/support-performance/workloadPerChannel'
import {StatsFilters} from 'models/stat/types'
import {humanizeChannel} from 'state/ticket/utils'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

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
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AnalyticsNewCubes]: false,
        }))
        usePostReportingMock.mockReturnValue(defaultReportingResponse)
    })

    describe('useWorkloadPerChannelDistribution', () => {
        it('should pass a Workload query and selectPerChannel callback', () => {
            renderHook(() =>
                useWorkloadPerChannelDistribution(statsFilters, timezone)
            )

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [
                    workloadPerChannelDistributionQueryFactory(
                        statsFilters,
                        timezone
                    ),
                ],
                {select: expect.any(Function)}
            )
        })
    })

    describe('useWorkloadPerChannelDistributionForPreviousPeriod', () => {
        it('should pass filters with previous date', () => {
            renderHook(() =>
                useWorkloadPerChannelDistributionForPreviousPeriod(
                    statsFilters,
                    timezone
                )
            )

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [
                    workloadPerChannelDistributionQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone
                    ),
                ],
                {select: expect.any(Function)}
            )
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
                {data: {data: queriedData}} as any,
                dimension,
                measure
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
