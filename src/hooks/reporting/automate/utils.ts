import { Scale, TooltipItem } from 'chart.js'
import difference from 'lodash/difference'
import flatMap from 'lodash/flatMap'
import groupBy from 'lodash/groupBy'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
import mapValues from 'lodash/mapValues'
import orderBy from 'lodash/orderBy'
import moment, { Moment } from 'moment'

import { OrderDirection } from '@gorgias/api-queries'
import colors from '@gorgias/design-tokens/dist/tokens/colors.json'

import {
    calculateRate,
    workflowEndStepAutomatedInteractions,
    workflowEndStepDropoff,
} from 'hooks/reporting/automate/automateStatsFormulae'
import { DisplayEventType } from 'hooks/reporting/automate/automateStatsMeasureLabelMap'
import {
    BREAKDOWN_FIELD,
    CUSTOM_FIELD_COUNT,
    DEFAULT_WORKFLOW_ANALYTICS_DATA,
    EnrichedTicketCustomFieldsWithSuccessRate,
    EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity,
    FLOW_ENDED_WITH_TICKET_HANDOVER,
    FLOW_HANDOVER_TICKET_CREATED,
    FLOW_PROMPT_NOT_HELPFUL,
    FLOW_STARTED,
    FLOW_STEP_ENDED,
    FLOW_STEP_STARTED,
    GreyArea,
    TICKET_COUNT,
    WorkflowTrendMetrics,
} from 'hooks/reporting/automate/types'
import {
    MetricWithDecile,
    QueryReturnType,
} from 'hooks/reporting/useMetricPerDimension'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { Cubes } from 'models/reporting/cubes'
import {
    AutomationBillingEventCubeWithJoins,
    AutomationBillingEventMeasure,
} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {
    RecommendedResourcesDimension,
    RecommendedResourcesMeasure,
} from 'models/reporting/cubes/automate_v2/RecommendedResourcesCube'
import {
    WorkflowDatasetDimension,
    WorkflowDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsCube,
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { ReportingGranularity } from 'models/reporting/types'
import { Period, StatsFilters } from 'models/stat/types'
import { IntentTableColumn } from 'pages/aiAgent/insights/IntentTableWidget/types'
import { INTENT_LEVEL } from 'pages/aiAgent/insights/OptimizeContainer/OptimizeContainer'
import { WorkflowStep } from 'pages/automate/workflows/models/workflowConfiguration.types'
import { SHORT_FORMAT } from 'pages/stats/common/utils'
import {
    AutomatedInteractionByFeatures,
    TwoDimensionalDataItem,
} from 'pages/stats/types'

export type WorkflowMetrics = {
    workflowStarted: number
    automatedInteractions: number
    automationRate: number
    dropoff: number
    ticketsCreated: number
}

export type WorkflowStepMetrics = {
    views: number
    viewRate: number
    dropoff: number
    dropoffRate: number
    automatedInteractions: number
    automatedInteractionsRate: number
    ticketsCreated: number
    ticketsCreatedRate: number
}

export type WorkflowStats = {
    workflowMetrics: Record<WorkflowTrendMetrics, MetricTrend>
    workflowStepMetrics: WorkflowStepMetricsMap
    previousPeriod: Period
    isFetching: boolean
    isError: boolean
}

export type WorkflowStepMetricsMap = {
    [flowStepId: string]: WorkflowStepMetrics
}

export const AutomateEventType = {
    TRACK_ORDER: 'track_order',
    QUICK_RESPONSE_STARTED: 'quick_response_started',
    LOOP_RETURNS_STARTED: 'loop_returns_started',
    ARTICLE_RECOMMENDATION_STARTED: 'article_recommendation_started',
    AUTOMATED_RESPONSE_STARTED: 'automated_response_started',
    FLOW_PROMPT_STARTED: 'flow_prompt_started',
    FLOW_STARTED: 'flow_started',
    FLOW_ENDED_WITHOUT_ACTION: 'flow_ended_without_action',
    TICKET_MESSAGE_CREATED_FROM_AUTORESPONDER:
        'ticket_message_created_from_autoresponder',
    AI_AGENT_TICKET_RESOLVED: 'ai_agent_ticket_resolved',
}

function getAutomateStatsEventTypeMap(
    eventType: string,
): AutomationBillingEventCubeWithJoins['measures'] | 'Others' {
    switch (eventType) {
        case AutomateEventType.TRACK_ORDER:
            return AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder
        case AutomateEventType.LOOP_RETURNS_STARTED:
            return AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns
        case AutomateEventType.QUICK_RESPONSE_STARTED:
            return AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse
        case AutomateEventType.ARTICLE_RECOMMENDATION_STARTED:
            return AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation
        case AutomateEventType.AUTOMATED_RESPONSE_STARTED:
            return AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse
        case AutomateEventType.FLOW_PROMPT_STARTED:
        case AutomateEventType.FLOW_STARTED:
        case AutomateEventType.FLOW_ENDED_WITHOUT_ACTION:
            return AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows
        case AutomateEventType.TICKET_MESSAGE_CREATED_FROM_AUTORESPONDER:
            return AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders
        case AutomateEventType.AI_AGENT_TICKET_RESOLVED:
            return AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent
    }
    return 'Others'
}

export function getAutomateColorsForEventType(eventType: string): string {
    const classicColors = colors['📺 Classic']
    switch (eventType) {
        case DisplayEventType.AI_AGENT:
            return classicColors.Accessory.Navy_text.value
        case DisplayEventType.WORKFLOWS:
            return classicColors.Main.Variations.Primary_3.value
        case DisplayEventType.QUICK_RESPONSES_DEPRECATED:
            return classicColors.Feedback.Variations.Warning_3.value
        case DisplayEventType.ARTICLE_RECOMMENDATION:
            return classicColors.Accessory.Purple_text.value
        case DisplayEventType.TRACK_ORDER:
            return classicColors.Accessory.Green_text.value
        case DisplayEventType.RETURN_ORDER:
            return classicColors.Feedback.Variations.Error_3.value
        case DisplayEventType.REPORT_ORDER_ISSUE:
            return classicColors.Neutral.Grey_5.value
        case DisplayEventType.AUTORESPONDERS:
            return classicColors.Accessory.Yellow_text.value
        default:
            return colors['📺 Classic'].Neutral.Grey_5.value
    }
}

export function mergeAutomateDataByEventType(
    interactionsDataByEventType: Record<string, TimeSeriesDataItem[][]>,
    eventTypesToMerge: string[],
) {
    let toEventType = ''
    const mergedData: Record<string, TimeSeriesDataItem[][]> = {}
    for (const eventType of eventTypesToMerge) {
        if (!interactionsDataByEventType[eventType]?.length) continue
        if (!toEventType) {
            toEventType = eventType
            mergedData[eventType] = interactionsDataByEventType[eventType]
            continue
        }
        mergedData[toEventType][0].forEach((data, index) => {
            const valueToAdd =
                interactionsDataByEventType[eventType][0][index]?.value
            data.value += valueToAdd ?? 0
        })
        delete interactionsDataByEventType[eventType]
    }
    return { ...interactionsDataByEventType, ...mergedData }
}

function getPeriodDateTimesByGranularity(
    dateRange: string[],
    granularity: ReportingGranularity,
): string[] {
    const momentGranularity =
        granularity === ReportingGranularity.Week ? 'isoWeek' : granularity
    const dates = []
    const end = moment(dateRange[1])
    let currentDate = moment(dateRange[0])
    while (currentDate.isBefore(end)) {
        dates.push(
            currentDate
                .startOf(momentGranularity)
                .format('YYYY-MM-DDTHH:mm:ss.SSS'),
        )
        currentDate = currentDate.add(1, granularity)
    }
    return dates
}

export function addNonExistingEventTypesForGraph(
    interactionsDataByEventType: Record<string, TimeSeriesDataItem[][]>,
    filter: StatsFilters,
    granularity: ReportingGranularity,
    skipList?: (typeof AutomateEventType)[keyof typeof AutomateEventType][],
) {
    const dateTimes = getPeriodDateTimesByGranularity(
        [filter.period.start_datetime, filter.period.end_datetime],
        granularity,
    )

    for (const eventType of Object.values(AutomateEventType)) {
        if (
            !interactionsDataByEventType[eventType] &&
            !skipList?.includes(eventType)
        ) {
            interactionsDataByEventType[eventType] = [
                dateTimes.map((dateTime) => {
                    return {
                        dateTime,
                        value: 0,
                        label: eventType,
                    }
                }),
            ]
        }
    }
    return interactionsDataByEventType
}

export const getAutomateStatsByMeasure = (
    measure: string,
    dataItems?: TimeSeriesDataItem[][],
): TimeSeriesDataItem[] =>
    dataItems?.find((arr) => arr.some((item) => item.label === measure)) || []

export function automateInteractionsByEventTypeToTimeSeries(
    filter: StatsFilters,
    granularity: ReportingGranularity,
    interactionsDataByEventType?: Record<string, TimeSeriesDataItem[][]>,
): TimeSeriesDataItem[][] {
    if (!interactionsDataByEventType) return []

    const allEventTypesData = addNonExistingEventTypesForGraph(
        interactionsDataByEventType,
        filter,
        granularity,
    )

    const mergedData = mergeAutomateDataByEventType(allEventTypesData, [
        AutomateEventType.FLOW_STARTED,
        AutomateEventType.FLOW_PROMPT_STARTED,
        AutomateEventType.FLOW_ENDED_WITHOUT_ACTION,
    ])

    return flatMap(mergedData, (value, key) =>
        map(value, (obj) =>
            map(obj, (item) => {
                return {
                    ...item,
                    label: getAutomateStatsEventTypeMap(key),
                }
            }),
        ),
    )
}

export function sortByAutomateFeatureLabels(
    automateStatsLabelMap: Record<AutomatedInteractionByFeatures, string>,
) {
    return (a: { label: string }, b: { label: string }) => {
        const eventTypeChartLabels = Object.values(automateStatsLabelMap)
        return (
            eventTypeChartLabels.indexOf(a.label) -
            eventTypeChartLabels.indexOf(b.label)
        )
    }
}

const getGreyAreaDates = (showGreyArea: GreyArea) => {
    const currentDate = showGreyArea.from.clone()

    const dates: Moment[] = []

    while (!currentDate.isAfter(showGreyArea.to)) {
        dates.push(moment(currentDate, SHORT_FORMAT))

        currentDate.add(1, 'days')
    }

    return dates
}

export function addZeroValueTimeSeriesForGreyArea(
    showGreyArea: GreyArea | null,
    timeSeries: TwoDimensionalDataItem[],
) {
    if (!showGreyArea) return timeSeries

    const greyAreaDates = getGreyAreaDates(showGreyArea)

    for (const dateTime of greyAreaDates) {
        const timeSeriesData = {
            x: dateTime.format(SHORT_FORMAT),
            y: 0,
        }
        for (const series of timeSeries) {
            let i = series.values.length
            while (i > 0) {
                i--
                const v = series.values[i]
                if (
                    moment(v.x, SHORT_FORMAT).isBefore(
                        moment(timeSeriesData.x, SHORT_FORMAT),
                    )
                ) {
                    series.values.splice(i + 1, 0, timeSeriesData)
                    break
                } else if (v.x === timeSeriesData.x) {
                    break
                }
            }
        }
    }
    return timeSeries
}

export function renderAutomateXTickLabel(
    this: Scale,
    value: string | number,
    index: number,
) {
    const labelDate = moment(this.getLabelForValue(index), SHORT_FORMAT)
    if (labelDate.isValid())
        return moment(this.getLabelForValue(index), SHORT_FORMAT).format(
            'MMM D',
        )
    return this.getLabelForValue(index)
}

export function automatePercentLabel(value: number | string) {
    return typeof value === 'number'
        ? `${parseFloat((value * 100).toFixed(2))}%`
        : value
}

export function renderAutomateTooltipLabel(isPercentage = false) {
    return ({ raw, dataset }: TooltipItem<'line'>) => {
        return `${dataset?.label || ''}:  ${
            isPercentage ? automatePercentLabel(raw as number) : (raw as number)
        }`
    }
}

export function calculateGreyArea(
    filtersStartDatetime: Moment,
    filtersEndDatetime: Moment,
): GreyArea | null {
    const endDateTime = filtersEndDatetime.clone()
    const startDateTime = filtersStartDatetime.clone()
    const threeDaysAgo = moment().subtract(3, 'days')

    if (endDateTime.isAfter(threeDaysAgo, 'date')) {
        if (startDateTime.isAfter(threeDaysAgo)) {
            return { from: startDateTime, to: endDateTime }
        }

        return { from: threeDaysAgo, to: endDateTime }
    }

    return null
}

export const getGreyAreaAndChartParam = (period: Period) => {
    const greyArea = calculateGreyArea(
        moment(period.start_datetime),
        moment(period.end_datetime),
    )
    return {
        greyArea,
        greyAreaChartParam: greyArea
            ? {
                  start: greyArea.from.format(SHORT_FORMAT),
                  end: greyArea.to.format(SHORT_FORMAT),
              }
            : undefined,
    }
}

export function getCountEventsByEventType(
    data: QueryReturnType<Cubes> | undefined,
    eventType: string,
): number {
    if (!data) return 0
    const count = data?.find(
        (item) => item[WorkflowDatasetDimension.EventType] === eventType,
    )?.[WorkflowDatasetMeasure.CountEvents]
    return Number(count) || 0
}

export function computeWorkflowMetrics(
    data: QueryReturnType<Cubes> | undefined,
    dropoff: number,
    automatedInteractions: number,
): WorkflowMetrics {
    const workflowTicketsCreated = getCountEventsByEventType(
        data,
        FLOW_HANDOVER_TICKET_CREATED,
    )
    const workflowStarted =
        automatedInteractions + dropoff + workflowTicketsCreated

    const automationRate = calculateRate(automatedInteractions, workflowStarted)

    return {
        workflowStarted,
        automatedInteractions,
        automationRate,
        dropoff,
        ticketsCreated: workflowTicketsCreated,
    }
}

export function computeWorkflowStepsMetrics(
    eventsData: QueryReturnType<Cubes> | undefined,
    dropoffData: QueryReturnType<Cubes> | undefined,
    steps: WorkflowStep[],
): WorkflowStepMetricsMap {
    const eventsGrouped = groupBy(
        eventsData,
        WorkflowDatasetDimension.FlowStepId,
    )
    const dropoffMap = keyBy(dropoffData, WorkflowDatasetDimension.FlowStepId)
    const stepsMap = keyBy(steps, 'id')
    const workflowStarted = getCountEventsByEventType(eventsData, FLOW_STARTED)

    const groupedDataByWorkflowsStep = mapValues(
        eventsGrouped,
        (events, flowStepId) => {
            const workflowAnalyticsData = { ...DEFAULT_WORKFLOW_ANALYTICS_DATA }

            const workflowStepStarted = getCountEventsByEventType(
                events,
                FLOW_STEP_STARTED,
            )
            const workflowStepEnded = getCountEventsByEventType(
                events,
                FLOW_STEP_ENDED,
            )
            const workflowStepPromptNotHelpful = getCountEventsByEventType(
                events,
                FLOW_PROMPT_NOT_HELPFUL,
            )
            const workflowStepTicktesCreated = getCountEventsByEventType(
                events,
                FLOW_HANDOVER_TICKET_CREATED,
            )
            const workflowStepWithTicketHandover = getCountEventsByEventType(
                events,
                FLOW_ENDED_WITH_TICKET_HANDOVER,
            )

            switch (stepsMap[flowStepId]?.kind) {
                case 'end':
                    workflowAnalyticsData.automatedInteractions =
                        workflowStepStarted
                    workflowAnalyticsData.dropoff = 0
                    break
                case 'handover':
                    workflowAnalyticsData.automatedInteractions = 0
                    workflowAnalyticsData.dropoff =
                        workflowStepWithTicketHandover -
                        workflowStepTicktesCreated
                    break
                case 'helpful-prompt': {
                    const dropoff = Number(
                        dropoffMap[flowStepId]?.[
                            WorkflowDatasetMeasure.FlowStepDropoff
                        ],
                    )
                    workflowAnalyticsData.dropoff = workflowEndStepDropoff(
                        dropoff,
                        workflowStepPromptNotHelpful,
                        workflowStepTicktesCreated,
                    )
                    workflowAnalyticsData.automatedInteractions =
                        workflowEndStepAutomatedInteractions(
                            workflowStepEnded,
                            workflowStepPromptNotHelpful,
                        )
                    break
                }
                default:
                    workflowAnalyticsData.dropoff = Number(
                        dropoffMap[flowStepId]?.[
                            WorkflowDatasetMeasure.FlowStepDropoff
                        ],
                    )
                    break
            }

            workflowAnalyticsData.views = workflowStepStarted
            workflowAnalyticsData.viewRate = calculateRate(
                workflowStepStarted,
                workflowStarted,
            )

            workflowAnalyticsData.dropoffRate = calculateRate(
                workflowAnalyticsData.dropoff,
                workflowStepStarted,
            )

            workflowAnalyticsData.automatedInteractionsRate = calculateRate(
                workflowAnalyticsData.automatedInteractions,
                workflowStepStarted,
            )

            workflowAnalyticsData.ticketsCreated = workflowStepTicktesCreated
            workflowAnalyticsData.ticketsCreatedRate = calculateRate(
                workflowStepTicktesCreated,
                workflowStepStarted,
            )

            return workflowAnalyticsData
        },
    )

    return groupedDataByWorkflowsStep
}

export const sortAllData = <
    T extends
        | EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity
        | EnrichedTicketCustomFieldsWithSuccessRate,
>(
    allData: T[],
    sortingField: keyof T,
    sorting: OrderDirection,
): T[] => {
    const nonNullValues = allData.filter((item) => item[sortingField] !== null)

    const sortedArray = orderBy(nonNullValues, (v) => Number(v[sortingField]), [
        sorting,
    ])

    return sortedArray.concat(difference(allData, nonNullValues))
}

export const enrichWithSuccessRateUpliftOpportunity = (
    metric: MetricWithDecile<TicketCustomFieldsCube>,
    totalTicketCount: string,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
    sorting: OrderDirection = OrderDirection.Desc,
): EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity[] => {
    const allData = metric?.data?.allData

    if (!allData || !totalTicketCount) {
        return []
    }

    const enrichedData: EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity[] =
        allData.map((item) => ({
            [BREAKDOWN_FIELD]: item[BREAKDOWN_FIELD],
            [TICKET_COUNT]: totalTicketCount,
            [CUSTOM_FIELD_COUNT]: item[valueField],
            successRateUpliftOpportunity: calculateRate(
                Number(item[valueField]),
                Number(totalTicketCount),
            ),
        }))

    return sortAllData(enrichedData, 'successRateUpliftOpportunity', sorting)
}

export const enrichWithSuccessRate = (
    filteredMetric: MetricWithDecile<TicketCustomFieldsCube>,
    totalMetrics: MetricWithDecile<TicketCustomFieldsCube>,
    valueField: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
    sorting: OrderDirection = OrderDirection.Asc,
): EnrichedTicketCustomFieldsWithSuccessRate[] => {
    const filteredData = filteredMetric?.data?.allData
    const allData = totalMetrics?.data?.allData

    if (!allData || !filteredData) {
        return []
    }

    const filteredMetricsMap = keyBy(
        filteredData,
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    )

    const enrichedData = allData.map((item) => {
        const customFieldLabel =
            item[TicketCustomFieldsDimension.TicketCustomFieldsValueString]
        const ticketCountTotal = Number(item[valueField])
        const filteredItem = filteredMetricsMap[customFieldLabel!]

        const ticketCountFiltered = Number(filteredItem?.[valueField])
        const successRate = calculateRate(ticketCountFiltered, ticketCountTotal)

        return {
            [BREAKDOWN_FIELD]: customFieldLabel,
            [TICKET_COUNT]: String(ticketCountTotal),
            [CUSTOM_FIELD_COUNT]: filteredItem
                ? String(ticketCountFiltered)
                : null,
            successRate,
        }
    })
    return sortAllData(enrichedData, 'successRate', sorting)
}

/**
 * Transform intent name from aaa::bbb to aaa/bbb format. If the intent level is the L3, return the last level only.
 * @example transformIntentName('aaa::bbb::ccc', 1) // 'aaa/bbb/ccc'
 * @example transformIntentName('aaa::bbb', 2) // 'aaa/bbb'
 * @example transformIntentName('aaa::bbb::ccc', 3) // 'ccc'
 */
export const transformIntentName = (name: string, intentLevel?: number) =>
    INTENT_LEVEL && intentLevel === INTENT_LEVEL + 1
        ? name.split('::').pop()
        : name.replace(/::/g, '/')
/**
 * Calculates the number of AI agent knowledge resource per intent.
 *
 * @param {QueryReturnType<Cubes>} aiAgentTicketsWithIntentData - Array of ticket data with intents.
 * @param {QueryReturnType<Cubes>} resourcePerTicketIdData - Array of resource data per ticket ID.
 * @returns {Array} - An array of objects mapping intents to number of resource used in tickets.
 */
export const calculateAiAgentKnowledgeResourcePerIntent = (
    aiAgentTicketsWithIntentData: QueryReturnType<Cubes>,
    resourcePerTicketIdData: QueryReturnType<Cubes>,
): {
    'TicketEnriched.customField': string
    resources: number
}[] => {
    const aiAgentKnowledgeResourcePerIntent: Record<string, number> = {}
    const aiAgentCountedResourcesPerIntent: Record<string, Set<string>> = {}

    // Get the intent and all ticket ids with that intent
    const ticketIdsPerIntent = groupBy(
        aiAgentTicketsWithIntentData,
        TicketDimension.CustomField,
    )

    if (!ticketIdsPerIntent || ticketIdsPerIntent['null']) {
        return []
    }
    // Loop through each intent and get the resources used in each ticket
    Object.entries(ticketIdsPerIntent).forEach(([intent, tickets]) => {
        const ticketIds = tickets.map(
            (ticket) => ticket[TicketDimension.TicketId],
        )

        // Get all resources used in the tickets
        const resources = resourcePerTicketIdData.filter((item) =>
            ticketIds.includes(item[RecommendedResourcesDimension.TicketId]),
        )

        if (!intent) {
            return
        }

        if (!aiAgentKnowledgeResourcePerIntent[intent]) {
            aiAgentKnowledgeResourcePerIntent[intent] = 0
            aiAgentCountedResourcesPerIntent[intent] = new Set()
        }

        if (resources && resources?.length > 0) {
            resources.forEach((resource) => {
                if (
                    !resource ||
                    !resource[
                        RecommendedResourcesDimension.RecommendedResourceId
                    ]
                ) {
                    return
                }

                if (
                    !aiAgentCountedResourcesPerIntent[intent].has(
                        resource[
                            RecommendedResourcesDimension.RecommendedResourceId
                        ],
                    )
                ) {
                    aiAgentCountedResourcesPerIntent[intent].add(
                        resource[
                            RecommendedResourcesDimension.RecommendedResourceId
                        ],
                    )
                    aiAgentKnowledgeResourcePerIntent[intent] += Number(
                        resource[
                            RecommendedResourcesMeasure.NumRecommendedResources
                        ],
                    )
                }
            })
        }
    })

    return Object.entries(aiAgentKnowledgeResourcePerIntent).map(
        ([intent, resources]) => ({
            [TicketDimension.CustomField]: intent,
            resources,
        }),
    )
}

/**
 * Get intent by level
 * @param {string} intent - intent name in format L1::L2::L3
 * @param {number }level - level of intent
 * @returns {string} - intent name by level
 * @example
 * getIntentByLevel('L1::L2::L3', 1) // 'L1'
 * getIntentByLevel('L1::L2::L3', 2) // 'L1::L2'
 * getIntentByLevel('L1::L2::L3', 3) // 'L1::L2::L3'
 */
export const getIntentByLevel = (intent: string, level: number): string => {
    const INTENT_SEPARATOR = '::'
    const levels = intent.split(INTENT_SEPARATOR)
    return levels.slice(0, level).join(INTENT_SEPARATOR)
}

// Filter metric data by intent level
export const filterMetricDataByIntentLevel = ({
    metricData,
    level,
    intentKey,
    valueKey,
    totalKey,
    resultKey,
    metricFor,
}: {
    metricData: Record<string, unknown>[]
    level: number
    intentKey: string
    valueKey: string
    totalKey?: string
    resultKey: string
    metricFor: IntentTableColumn
}) => {
    const adjustedData: Record<string, { sum: number; length: number }> = {}
    metricData.forEach((item) => {
        const intent = getIntentByLevel(String(item[intentKey]), level)
        if (!adjustedData[intent]) {
            adjustedData[intent] = {
                sum: 0,
                length: 0,
            }
        }

        const total = (totalKey && Number(item[totalKey])) || 0
        const value = (valueKey && Number(item[valueKey])) || 0

        switch (metricFor) {
            case IntentTableColumn.SuccessRateUpliftOpportunity:
                adjustedData[intent].length = total
                adjustedData[intent].sum += value
                break
            case IntentTableColumn.Tickets:
            // case IntentTableColumn.Resources:
            //     adjustedData[intent].sum += value
            //     break
            case IntentTableColumn.SuccessRate:
                adjustedData[intent].length += total
                adjustedData[intent].sum += value
                break
            case IntentTableColumn.AvgCustomerSatisfaction:
                adjustedData[intent].length += total
                adjustedData[intent].sum += value * total
                break
        }
    })

    // Calculate average for intents
    return Object.keys(adjustedData)
        .map((intent) => {
            switch (metricFor) {
                case IntentTableColumn.SuccessRateUpliftOpportunity:
                case IntentTableColumn.SuccessRate:
                case IntentTableColumn.AvgCustomerSatisfaction:
                    return {
                        [intentKey]: intent,
                        [resultKey]:
                            adjustedData[intent].length > 0
                                ? adjustedData[intent].sum /
                                  adjustedData[intent].length
                                : null,
                    }
                case IntentTableColumn.Tickets:
                    // case IntentTableColumn.Resources:
                    return {
                        [intentKey]: intent,
                        [resultKey]: adjustedData[intent].sum,
                    }
            }
        })
        .filter(
            (item): item is Record<string, string | number | null> =>
                item !== undefined,
        )
}

const addHoursToDate = (hours: number, date: string) => {
    const momentDate = moment(date)
    return momentDate.add(hours, 'hours').format()
}

export const adjustPeriodForAutomatedInteractions = (
    hours: number,
    period: Period,
) => {
    const adjustedPeriod = {
        start_datetime: period.start_datetime,
        end_datetime: addHoursToDate(hours, period.end_datetime),
    }
    return adjustedPeriod
}
