import { getIntentByLevel } from 'domains/reporting/hooks/automate/utils'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'
import type { IntentMetrics } from 'pages/aiAgent/skills/hooks/useIntentsTable'

type MetricDataRecord = Record<string, string | number | null | undefined>

const INTENT_LEVEL_1 = 1
const INTENT_LEVEL_2 = 2

type IntentCountMap = Map<string, number>

const buildIntentCountMap = (allData: MetricDataRecord[]): IntentCountMap => {
    const map: IntentCountMap = new Map()
    allData.forEach((record) => {
        const intentValue =
            record[TicketCustomFieldsDimension.TicketCustomFieldsValueString]
        const count =
            record[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]
        if (intentValue == null || count == null) return

        const numericCount =
            typeof count === 'string' ? parseFloat(count) : Number(count)

        const intentAtLevel2 = getIntentByLevel(
            String(intentValue),
            INTENT_LEVEL_2,
        ).toLowerCase()
        map.set(intentAtLevel2, (map.get(intentAtLevel2) ?? 0) + numericCount)

        const intentAtLevel1 = getIntentByLevel(
            String(intentValue),
            INTENT_LEVEL_1,
        ).toLowerCase()
        map.set(intentAtLevel1, (map.get(intentAtLevel1) ?? 0) + numericCount)
    })
    return map
}

/**
 * Aggregate intent metrics from raw query data.
 * Builds L1/L2 count maps and computes percentage metrics.
 *
 * @param totalData - Raw metric records for total ticket volume per intent
 * @param handoverData - Raw metric records for handover ticket count per intent
 * @param totalAiAgentTickets - Total covered AI agent tickets (tickets with any outcome set; denominator for ticket volume %)
 * @returns Map of intent name to metrics (ticketVolume, ticketVolumePercent, handoverCount, handoverPercent)
 */
export const aggregateIntentMetrics = (
    totalData: MetricDataRecord[] | undefined,
    handoverData: MetricDataRecord[] | undefined,
    totalAiAgentTickets: number,
): Map<string, IntentMetrics> => {
    if (!totalData || !handoverData) {
        return new Map<string, IntentMetrics>()
    }

    const totalCountMap = buildIntentCountMap(totalData)
    const handoverCountMap = buildIntentCountMap(handoverData)

    const metricsMap = new Map<string, IntentMetrics>()
    totalCountMap.forEach((ticketVolume, intentName) => {
        const handoverCount = handoverCountMap.get(intentName) ?? 0
        metricsMap.set(intentName, {
            ticketVolume,
            ticketVolumePercent: calculatePercentage(
                ticketVolume,
                totalAiAgentTickets,
                1,
            ),
            handoverCount,
            handoverPercent: calculatePercentage(
                handoverCount,
                ticketVolume,
                1,
            ),
        })
    })

    return metricsMap
}

/**
 * Drilldown query factory for intent ticket volume.
 * Delegates to the shared customFields drilldown factory without outcome filtering.
 */
export const intentTicketVolumeDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    intentFieldId?: number,
    intentFieldValues?: string[] | null,
    outcomeFieldId?: number,
    sorting?: OrderDirection,
    integrationIds?: string[],
): ReportingQuery<HelpdeskMessageCubeWithJoins> =>
    customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
        filters,
        timezone,
        intentFieldId,
        intentFieldValues,
        outcomeFieldId,
        sorting,
        integrationIds,
    )

/**
 * Drilldown query factory for intent handover tickets.
 * Delegates to the shared customFields drilldown factory with outcome filtering.
 */
export const intentHandoverDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    intentFieldId?: number,
    intentFieldValues?: string[] | null,
    outcomeFieldId?: number,
    sorting?: OrderDirection,
    integrationIds?: string[],
    outcomeFieldValues?: string[],
): ReportingQuery<HelpdeskMessageCubeWithJoins> =>
    customFieldsTicketCountPerIntentLevelPerTicketDrillDownQueryFactory(
        filters,
        timezone,
        intentFieldId,
        intentFieldValues,
        outcomeFieldId,
        sorting,
        integrationIds,
        outcomeFieldValues,
    )
