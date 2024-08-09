import flatMap from 'lodash/flatMap'
import map from 'lodash/map'
import groupBy from 'lodash/groupBy'
import keyBy from 'lodash/keyBy'
import mapValues from 'lodash/mapValues'

import moment, {Moment} from 'moment'
import {Scale, TooltipItem} from 'chart.js'
import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {
    AutomationBillingEventCubeWithJoins,
    AutomationBillingEventMeasure,
} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {
    AutomatedInteractionByFeatures,
    TwoDimensionalDataItem,
} from 'pages/stats/types'
import {Period, StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {SHORT_FORMAT} from 'pages/stats/common/utils'
import {Cubes} from 'models/reporting/cubes'
import {
    WorkflowDatasetDimension,
    WorkflowDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import {QueryReturnType} from 'hooks/reporting/useMetricPerDimension'
import {
    DEFAULT_WORKFLOW_ANALYTICS_DATA,
    FLOW_ENDED_WITH_TICKET_HANDOVER,
    FLOW_HANDOVER_TICKET_CREATED,
    FLOW_PROMPT_NOT_HELPFUL,
    FLOW_STARTED,
    FLOW_STEP_ENDED,
    FLOW_STEP_STARTED,
    GreyArea,
    WorkflowTrendMetrics,
} from 'hooks/reporting/automate/types'
import {
    calculateRate,
    workflowEndStepAutomatedInteractions,
    workflowEndStepDropoff,
} from 'hooks/reporting/automate/automateStatsFormulae'
import {WorkflowStep} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {MetricTrend} from '../useMetricTrend'
import {DisplayEventType} from './useAutomateStatsMeasureLabelMap'

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
    eventType: string
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
        case DisplayEventType.QUICK_RESPONSES:
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
    eventTypesToMerge: string[]
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
            data.value += interactionsDataByEventType[eventType][0][index].value
        })
        delete interactionsDataByEventType[eventType]
    }
    return {...interactionsDataByEventType, ...mergedData}
}

function getPeriodDateTimesByGranularity(
    dateRange: string[],
    granularity: ReportingGranularity
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
                .format('YYYY-MM-DDTHH:mm:ss.SSS')
        )
        currentDate = currentDate.add(1, granularity)
    }
    return dates
}

export function addNonExistingEventTypesForGraph(
    interactionsDataByEventType: Record<string, TimeSeriesDataItem[][]>,
    filter: StatsFilters,
    granularity: ReportingGranularity,
    skipList?: typeof AutomateEventType[keyof typeof AutomateEventType][]
) {
    const dateTimes = getPeriodDateTimesByGranularity(
        [filter.period.start_datetime, filter.period.end_datetime],
        granularity
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
    dataItems?: TimeSeriesDataItem[][]
): TimeSeriesDataItem[] =>
    dataItems?.find((arr) => arr.some((item) => item.label === measure)) || []

export function automateInteractionsByEventTypeToTimeSeries(
    filter: StatsFilters,
    granularity: ReportingGranularity,
    interactionsDataByEventType?: Record<string, TimeSeriesDataItem[][]>,
    sunsetQuickResponses?: boolean
): TimeSeriesDataItem[][] {
    if (!interactionsDataByEventType) return []

    const allEventTypesData = addNonExistingEventTypesForGraph(
        interactionsDataByEventType,
        filter,
        granularity,
        sunsetQuickResponses ? [AutomateEventType.QUICK_RESPONSE_STARTED] : []
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
            })
        )
    )
}

export function sortByAutomateFeatureLabels(
    automateStatsLabelMap: Record<AutomatedInteractionByFeatures, string>
) {
    return (a: {label: string}, b: {label: string}) => {
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
    timeSeries: TwoDimensionalDataItem[]
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
                        moment(timeSeriesData.x, SHORT_FORMAT)
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
    index: number
) {
    const labelDate = moment(this.getLabelForValue(index), SHORT_FORMAT)
    if (labelDate.isValid())
        return moment(this.getLabelForValue(index), SHORT_FORMAT).format(
            'MMM D'
        )
    return this.getLabelForValue(index)
}
export function automatePercentLabel(value: number | string) {
    return typeof value === 'number'
        ? `${parseFloat((value * 100).toFixed(2))}%`
        : value
}

export function renderAutomateTooltipLabel(isPercentage = false) {
    return ({raw, dataset}: TooltipItem<'line'>) => {
        return `${dataset?.label || ''}:  ${
            isPercentage ? automatePercentLabel(raw as number) : (raw as number)
        }`
    }
}

export function calculateGreyArea(
    filtersStartDatetime: Moment,
    filtersEndDatetime: Moment
): GreyArea | null {
    const endDateTime = filtersEndDatetime.clone()
    const startDateTime = filtersStartDatetime.clone()
    const threeDaysAgo = moment().subtract(3, 'days')

    if (endDateTime.isAfter(threeDaysAgo, 'date')) {
        if (startDateTime.isAfter(threeDaysAgo)) {
            return {from: startDateTime, to: endDateTime}
        }

        return {from: threeDaysAgo, to: endDateTime}
    }

    return null
}

export function getCountEventsByEventType(
    data: QueryReturnType<Cubes> | undefined,
    eventType: string
): number {
    if (!data) return 0
    const count = data?.find(
        (item) => item[WorkflowDatasetDimension.EventType] === eventType
    )?.[WorkflowDatasetMeasure.CountEvents]
    return Number(count) || 0
}

export function computeWorkflowMetrics(
    data: QueryReturnType<Cubes> | undefined,
    dropoff: number,
    automatedInteractions: number
): WorkflowMetrics {
    const workflowTicketsCreated = getCountEventsByEventType(
        data,
        FLOW_HANDOVER_TICKET_CREATED
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
    steps: WorkflowStep[]
): WorkflowStepMetricsMap {
    const eventsGrouped = groupBy(
        eventsData,
        WorkflowDatasetDimension.FlowStepId
    )
    const dropoffMap = keyBy(dropoffData, WorkflowDatasetDimension.FlowStepId)
    const stepsMap = keyBy(steps, 'id')
    const workflowStarted = getCountEventsByEventType(eventsData, FLOW_STARTED)

    const groupedDataByWorkflowsStep = mapValues(
        eventsGrouped,
        (events, flowStepId) => {
            const workflowAnalyticsData = {...DEFAULT_WORKFLOW_ANALYTICS_DATA}

            const workflowStepStarted = getCountEventsByEventType(
                events,
                FLOW_STEP_STARTED
            )
            const workflowStepEnded = getCountEventsByEventType(
                events,
                FLOW_STEP_ENDED
            )
            const workflowStepPromptNotHelpful = getCountEventsByEventType(
                events,
                FLOW_PROMPT_NOT_HELPFUL
            )
            const workflowStepTicktesCreated = getCountEventsByEventType(
                events,
                FLOW_HANDOVER_TICKET_CREATED
            )
            const workflowStepWithTicketHandover = getCountEventsByEventType(
                events,
                FLOW_ENDED_WITH_TICKET_HANDOVER
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
                        ]
                    )
                    workflowAnalyticsData.dropoff = workflowEndStepDropoff(
                        dropoff,
                        workflowStepPromptNotHelpful,
                        workflowStepTicktesCreated
                    )
                    workflowAnalyticsData.automatedInteractions =
                        workflowEndStepAutomatedInteractions(
                            workflowStepEnded,
                            workflowStepPromptNotHelpful
                        )
                    break
                }
                default:
                    workflowAnalyticsData.dropoff = Number(
                        dropoffMap[flowStepId]?.[
                            WorkflowDatasetMeasure.FlowStepDropoff
                        ]
                    )
                    break
            }

            workflowAnalyticsData.views = workflowStepStarted
            workflowAnalyticsData.viewRate = calculateRate(
                workflowStepStarted,
                workflowStarted
            )

            workflowAnalyticsData.dropoffRate = calculateRate(
                workflowAnalyticsData.dropoff,
                workflowStepStarted
            )

            workflowAnalyticsData.automatedInteractionsRate = calculateRate(
                workflowAnalyticsData.automatedInteractions,
                workflowStepStarted
            )

            workflowAnalyticsData.ticketsCreated = workflowStepTicktesCreated
            workflowAnalyticsData.ticketsCreatedRate = calculateRate(
                workflowStepTicktesCreated,
                workflowStepStarted
            )

            return workflowAnalyticsData
        }
    )

    return groupedDataByWorkflowsStep
}
