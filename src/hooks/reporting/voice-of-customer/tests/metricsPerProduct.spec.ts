import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'hooks/reporting/useMetricPerDimension'
import {
    fetchReturnMentionsPerProduct,
    fetchTicketCountPerProduct,
    PRODUCT_ENRICHMENT_ENTITY_ID,
    PRODUCT_ENRICHMENT_FIELDS,
    useReturnMentionsPerProduct,
    useTicketCountPerProduct,
    useTicketCountPerProductWithEnrichment,
} from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { OrderDirection } from 'models/api/types'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { returnMentionsPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { ticketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)
const useMetricPerDimensionWithEnrichmentMock = assumeMock(
    useMetricPerDimensionWithEnrichment,
)

describe('metricsPerProduct', () => {
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
    const agentId = '2'

    describe('metricsPerProduct', () => {
        it.each([
            [
                'useTicketCountPerProduct',
                useTicketCountPerProduct,
                ticketCountPerProductQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            (_, useFn, queryFactory) => {
                renderHook(
                    () => useFn(statsFilters, timezone, sorting, agentId),
                    {},
                )

                expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    agentId,
                )
            },
        )

        it.each([
            [
                'fetchTicketCountPerProduct',
                fetchTicketCountPerProduct,
                ticketCountPerProductQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            async (_, fetchFn, queryFactory) => {
                await fetchFn(statsFilters, timezone, sorting, agentId)

                expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    agentId,
                )
            },
        )
    })

    describe('useTicketCountPerProductWithEnrichment', () => {
        it('should use metric per dimension with Product enrichment', () => {
            renderHook(() =>
                useTicketCountPerProductWithEnrichment(
                    statsFilters,
                    timezone,
                    sorting,
                ),
            )

            expect(
                useMetricPerDimensionWithEnrichmentMock,
            ).toHaveBeenCalledWith(
                ticketCountPerProductQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
                PRODUCT_ENRICHMENT_FIELDS,
                PRODUCT_ENRICHMENT_ENTITY_ID,
                undefined,
            )
        })
    })

    describe('metricsPerProductAndIntent', () => {
        const intentCustomFieldId = 1

        it.each([
            [
                'useReturnMentionsPerProduct',
                useReturnMentionsPerProduct,
                returnMentionsPerProductQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            (_, useFn, queryFactory) => {
                renderHook(
                    () =>
                        useFn(
                            statsFilters,
                            timezone,
                            intentCustomFieldId,
                            sorting,
                            agentId,
                        ),
                    {},
                )

                expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(
                        statsFilters,
                        timezone,
                        intentCustomFieldId,
                        sorting,
                    ),
                    agentId,
                )
            },
        )

        it.each([
            [
                'fetchReturnMentionsPerProduct',
                fetchReturnMentionsPerProduct,
                returnMentionsPerProductQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            async (_, fetchFn, queryFactory) => {
                await fetchFn(
                    statsFilters,
                    timezone,
                    intentCustomFieldId,
                    sorting,
                    agentId,
                )

                expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(
                        statsFilters,
                        timezone,
                        intentCustomFieldId,
                        sorting,
                    ),
                    agentId,
                )
            },
        )
    })
})
