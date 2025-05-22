import { UseQueryResult } from '@tanstack/react-query'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersFilterMember,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { usePostReporting } from 'models/reporting/queries'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'

import { useCanUseAiSalesAgent } from './useCanUseAiSalesAgent'

export type InfluencedOrdersParams = {
    accountId: number | string
    customerIds?: number[]
}

export type InfluencedOrderDataFromCube = {
    [AiSalesAgentOrdersDimension.OrderId]: string
    [AiSalesAgentOrdersDimension.PeriodStart]: string
    [AiSalesAgentOrdersDimension.IntegrationId]: string
}

export type InfluencedOrderData = {
    id: number
    integrationId: number
    createdDatetime: string
}

export const useFetchInfluencedOrders = ({
    accountId,
    customerIds,
}: InfluencedOrdersParams): UseQueryResult<InfluencedOrderData[]> => {
    const canUseSalesAgent = useCanUseAiSalesAgent()
    const isShoppingAssistantEnbaled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )
    const isInfluencedByAiEnabled =
        canUseSalesAgent && isShoppingAssistantEnbaled

    const isQueryEnabled = !!(
        isInfluencedByAiEnabled &&
        accountId &&
        customerIds
    )

    const query: ReportingQuery<AiSalesAgentOrdersCube> = isQueryEnabled
        ? {
              measures: [],
              dimensions: [
                  AiSalesAgentOrdersDimension.OrderId,
                  AiSalesAgentOrdersDimension.PeriodStart,
                  AiSalesAgentOrdersDimension.IntegrationId,
              ],
              filters: [
                  {
                      member: AiSalesAgentOrdersFilterMember.AccountId,
                      operator: ReportingFilterOperator.Equals,
                      values: [accountId.toString()],
                  },
                  {
                      member: AiSalesAgentOrdersDimension.CustomerId,
                      operator: ReportingFilterOperator.Equals,
                      values: customerIds.map((id) => id.toString()),
                  },
                  {
                      member: AiSalesAgentOrdersDimension.IsInfluenced,
                      operator: ReportingFilterOperator.Equals,
                      values: [Number(true).toString()],
                  },
              ].filter((x) => x !== undefined),
              limit: 100,
          }
        : { measures: [], dimensions: [], filters: [] }

    return usePostReporting<
        InfluencedOrderDataFromCube[],
        InfluencedOrderData[]
    >([query], {
        enabled: isQueryEnabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (response) =>
            response.data.data.map(serializeInfluencedOrderData),
    })
}

const serializeInfluencedOrderData = (data: InfluencedOrderDataFromCube) => {
    return {
        id: Number(data[AiSalesAgentOrdersDimension.OrderId]),
        integrationId: Number(data[AiSalesAgentOrdersDimension.IntegrationId]),
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
