import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    useCustomFieldsForProductTicketCount,
    useCustomFieldsTicketCount,
} from 'domains/reporting/hooks/metricsPerCustomField'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import {
    ticketFieldsCountPerFieldValueQueryV2Factory,
    withCustomFieldIdAndProductFilter,
} from 'domains/reporting/models/scopes/ticketFields'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    TagFilterInstanceId,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount',
)
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)

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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
                ticketFieldsCountPerFieldValueQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator([
                            customFieldId,
                        ]),
                    },
                    timezone,
                    sortDirection: sorting,
                }),
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
                ticketFieldsCountPerFieldValueQueryV2Factory({
                    filters: withCustomFieldIdAndProductFilter(
                        statsFilters,
                        TicketTimeReference.CreatedAt,
                        customFieldId,
                    ),
                    timezone,
                    sortDirection: sorting,
                }),
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    productId,
                    sorting,
                ),
                ticketFieldsCountPerFieldValueQueryV2Factory({
                    filters: withCustomFieldIdAndProductFilter(
                        statsFilters,
                        TicketTimeReference.CreatedAt,
                        customFieldId,
                        productId,
                    ),
                    timezone,
                    sortDirection: sorting,
                }),
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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                customFieldsTicketCountOnCreatedDatetimeQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting,
                ),
                ticketFieldsCountPerFieldValueQueryV2Factory({
                    filters: withCustomFieldIdAndProductFilter(
                        statsFilters,
                        TicketTimeReference.CreatedAt,
                        customFieldId,
                    ),
                    timezone,
                    sortDirection: sorting,
                }),
            )
        })
    })
})
