import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
    useCustomTicketFieldWithBreakdown,
} from 'domains/reporting/hooks/metricsPerCustomField'
import {
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount',
)
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useCustomTicketFieldWithBreakdownMock = assumeMock(
    useMetricPerDimensionWithBreakdown,
)

describe('metricsPerCustomField', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc
    const customFieldId = 1

    describe('useCustomFieldsTicketCount', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomFieldsTicketCount(
                        statsFilters,
                        timezone,
                        customFieldId,
                        sorting,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
            )
        })
        it('should pass the query to useMetricPerDimension hook when time reference is created at', () => {
            renderHook(
                () =>
                    useCustomFieldsTicketCount(
                        statsFilters,
                        timezone,
                        customFieldId,
                        sorting,
                        TicketTimeReference.CreatedAt,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
            )
        })
    })

    describe('useCustomFieldsForProductTicketCount', () => {
        const productId = 'some-product-id'

        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomFieldsForProductTicketCount(
                        statsFilters,
                        timezone,
                        customFieldId,
                        productId,
                        sorting,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    productId,
                    sorting,
                ),
            )
        })
        it('should pass the query to useMetricPerDimension hook when time reference is created at', () => {
            renderHook(
                () =>
                    useCustomFieldsTicketCount(
                        statsFilters,
                        timezone,
                        customFieldId,
                        sorting,
                        TicketTimeReference.CreatedAt,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
            )
        })
    })

    describe('useCustomFieldsTicketCountWithBreakdown', () => {
        it('should pass the query to useCustomTicketFieldWithBreakdown hook', () => {
            renderHook(
                () =>
                    useCustomTicketFieldWithBreakdown(
                        statsFilters,
                        timezone,
                        customFieldId,
                        sorting,
                    ),
                {},
            )

            expect(useCustomTicketFieldWithBreakdownMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
            )
        })
    })
})
