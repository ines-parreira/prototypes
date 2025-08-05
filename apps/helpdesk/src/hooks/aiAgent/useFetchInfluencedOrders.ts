import { UseQueryResult } from '@tanstack/react-query'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersFilterMember,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { usePostReporting } from 'domains/reporting/models/queries'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

import { useCanUseAiSalesAgent } from './useCanUseAiSalesAgent'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

export type InfluencedOrdersParams = {
    accountId: number | string
    integrationIds: (number | string)[]
    orderIds: (number | string)[]
    periodStart?: string | Date
    periodEnd?: string | Date
}

export type InfluencedOrderDataFromCube = {
    [AiSalesAgentOrdersDimension.OrderId]: string
    [AiSalesAgentOrdersDimension.PeriodStart]: string
    [AiSalesAgentOrdersDimension.IntegrationId]: string
    [AiSalesAgentOrdersDimension.TicketId]: string
}

export type InfluencedOrderData = {
    id: number
    integrationId: number
    ticketId: number
    createdDatetime: string
}

export const useFetchInfluencedOrders = ({
    accountId,
    integrationIds,
    periodStart,
    periodEnd,
    orderIds,
}: InfluencedOrdersParams): UseQueryResult<InfluencedOrderData[]> => {
    const canUseSalesAgent = useCanUseAiSalesAgent()
    const isShoppingAssistantEnbaled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const isInfluencedByAiEnabled =
        canUseSalesAgent && isShoppingAssistantEnbaled

    const isQueryEnabled =
        isInfluencedByAiEnabled &&
        !!periodStart &&
        !!integrationIds.length &&
        !!orderIds.length

    const query: ReportingQuery<AiSalesAgentOrdersCube> = isQueryEnabled
        ? {
              measures: [],
              dimensions: [
                  AiSalesAgentOrdersDimension.OrderId,
                  AiSalesAgentOrdersDimension.PeriodStart,
                  AiSalesAgentOrdersDimension.IntegrationId,
                  AiSalesAgentOrdersDimension.TicketId,
              ],
              filters: [
                  {
                      member: AiSalesAgentOrdersFilterMember.AccountId,
                      operator: ReportingFilterOperator.Equals,
                      values: [accountId.toString()],
                  },
                  periodStart
                      ? {
                            member: AiSalesAgentOrdersFilterMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterOrOnDate,
                            values: [formatReportingQueryDate(periodStart)],
                        }
                      : undefined,
                  periodEnd
                      ? {
                            member: AiSalesAgentOrdersFilterMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeOrOnDate,
                            values: [formatReportingQueryDate(periodEnd)],
                        }
                      : undefined,
                  {
                      member: AiSalesAgentOrdersFilterMember.IntegrationId,
                      operator: ReportingFilterOperator.Equals,
                      values: integrationIds.map((id) => String(id)),
                  },
                  {
                      member: AiSalesAgentOrdersFilterMember.OrderId,
                      operator: ReportingFilterOperator.Equals,
                      values: orderIds.map((id) => String(id)),
                  },
                  {
                      member: AiSalesAgentOrdersFilterMember.IsInfluenced,
                      operator: ReportingFilterOperator.Equals,
                      values: [Number(true).toString()],
                  },
              ].filter((value): value is NonNullable<typeof value> => !!value),
              limit: 100,
          }
        : { measures: [], dimensions: [], filters: [] }

    return usePostReporting<
        InfluencedOrderDataFromCube[],
        InfluencedOrderData[]
    >([query], {
        enabled: isQueryEnabled,
        // There is no need to refetch this data frequently
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        select: (response) =>
            response.data.data.map(serializeInfluencedOrderData),
    })
}

const serializeInfluencedOrderData = (data: InfluencedOrderDataFromCube) => {
    return {
        id: Number(data[AiSalesAgentOrdersDimension.OrderId]),
        integrationId: Number(data[AiSalesAgentOrdersDimension.IntegrationId]),
        ticketId: Number(data[AiSalesAgentOrdersDimension.TicketId]),
        createdDatetime: parseUTC(
            data[AiSalesAgentOrdersDimension.PeriodStart],
        ),
    }
}

const parseUTC = (datetime: string) => {
    const datetimeWithZ =
        datetime.includes('Z') || datetime.includes('+')
            ? datetime
            : datetime + 'Z'
    return new Date(datetimeWithZ).toISOString()
}
