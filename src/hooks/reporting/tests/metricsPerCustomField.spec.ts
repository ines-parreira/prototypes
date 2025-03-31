import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    useCustomFieldsTicketCount,
    useCustomTicketFieldWithBreakdown,
} from 'hooks/reporting/metricsPerCustomField'
import {
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
    TicketTimeReference,
} from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock('models/reporting/queryFactories/ticket-insights/tagsTicketCount')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useCustomTicketFieldWithBreakdownMock = assumeMock(
    useMetricPerDimensionWithBreakdown,
)

describe('metricsPerAgent', () => {
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
    const customFieldId = '1'

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
