import React, { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { TableWithNestedRowsCell } from 'pages/stats/common/components/Table/TableWithNestedRowsCell'
import { AIInsightsMetrics } from 'state/ui/stats/drillDownSlice'
import { AIInsightsMetric } from 'state/ui/stats/types'

import { useGetCustomTicketsFieldsDefinitionData } from './hooks/useGetCustomTicketsFieldsDefinitionData'
import {
    IntentAvgCsatCellContent,
    IntentDefaultCellContent,
    IntentNameCellContent,
    IntentSuccessRateUpliftOpportunitiesCellContent,
} from './IntentTableCells'
import { TableColumnsOrder } from './IntentTableConfig'
import { Intent, IntentTableColumn } from './types'

import css from './IntentTable.less'

export interface IntentTableExpandedRowContentProps {
    intent: Intent
    allIntents: Intent[]
    intentLevel?: number
    isTableScrolled: boolean
    hasChildren?: boolean
    onClick?: () => void
    level?: number
}

export const IntentTableExpandedRowContent: React.FC<
    IntentTableExpandedRowContentProps
> = ({
    intent,
    allIntents,
    intentLevel,
    isTableScrolled,
    hasChildren = true,
    onClick,
    level = 0,
}) => {
    const { intentCustomFieldId, outcomeCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const aiAgentUserId = useAIAgentUserId()

    const { shopName } = useParams<{
        shopName: string
    }>()

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)

    const isAiAgentOptimize1PageLayoutEnabled =
        useFlags()[FeatureFlagKey.AiAgentOptimize1PageLayout]

    const getTableCellComponent = (column: IntentTableColumn) => {
        switch (column) {
            case IntentTableColumn.IntentName:
                return IntentNameCellContent
            case IntentTableColumn.SuccessRateUpliftOpportunity:
                return IntentSuccessRateUpliftOpportunitiesCellContent
            case IntentTableColumn.AvgCustomerSatisfaction:
                return IntentAvgCsatCellContent
            default:
                return IntentDefaultCellContent
        }
    }

    const getDrillDownMetricData = ({
        column,
        intent,
    }: {
        column: IntentTableColumn
        intent: Intent
    }): AIInsightsMetrics | null => {
        const intentName = intent[IntentTableColumn.IntentName]
        switch (column) {
            case IntentTableColumn.Tickets:
                return {
                    metricName: AIInsightsMetric.TicketCustomFieldsTicketCount,
                    title: intentName,
                    intentFieldValues: [intent.id],
                    intentFieldId: intentCustomFieldId ?? null,
                    outcomeFieldId: outcomeCustomFieldId ?? null,
                    integrationIds: integrationIds,
                    customFieldId: null,
                    customFieldValue: null,
                }
            case IntentTableColumn.AvgCustomerSatisfaction:
                if (
                    !aiAgentUserId ||
                    !intentCustomFieldId ||
                    !outcomeCustomFieldId
                ) {
                    return null
                }

                return {
                    metricName:
                        AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                    title: intentName,
                    perAgentId: aiAgentUserId,
                    intentFieldId: intentCustomFieldId,
                    outcomeFieldId: outcomeCustomFieldId,
                    intentFieldValues: [intent.id],
                    integrationIds: integrationIds,
                }
            default:
                return null
        }
    }

    const tableColumns = useMemo(() => {
        return isAiAgentOptimize1PageLayoutEnabled
            ? TableColumnsOrder.slice(1)
            : TableColumnsOrder
    }, [isAiAgentOptimize1PageLayoutEnabled])

    return (
        <>
            {isAiAgentOptimize1PageLayoutEnabled && (
                <TableWithNestedRowsCell
                    isLeadColumn={false}
                    isTableScrolled={isTableScrolled}
                    hasChildren={hasChildren}
                    onClick={onClick}
                    level={level}
                    className={css.leadColumn}
                >
                    {intent[IntentTableColumn.IntentName]}
                </TableWithNestedRowsCell>
            )}

            {tableColumns.map((column) => {
                const CellComponent = getTableCellComponent(column)

                return (
                    <React.Fragment key={column}>
                        {React.createElement(CellComponent, {
                            intent,
                            column,
                            allIntents,
                            drillDownMetricData: getDrillDownMetricData({
                                column,
                                intent,
                            }),
                            intentLevel,
                        })}
                    </React.Fragment>
                )
            })}
        </>
    )
}
