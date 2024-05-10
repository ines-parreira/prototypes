import flatMap from 'lodash/flatMap'
import map from 'lodash/map'
import moment, {Moment} from 'moment'
import {Scale, TooltipItem} from 'chart.js'
import {
    AutomationBillingEventCubeWithJoins,
    AutomationBillingEventMeasure,
} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {
    FLOWS,
    QUICK_RESPONSES,
    ARTICLE_RECOMMENDATION,
} from 'pages/automate/common/components/constants'
import {
    AutomatedInteractionByFeatures,
    TwoDimensionalDataItem,
} from 'pages/stats/types'
import {StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'
import {
    TimeSeriesDataItem,
    getPeriodDateTimes,
} from 'hooks/reporting/useTimeSeries'
import {SHORT_FORMAT} from 'pages/stats/common/utils'

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

export const AUTOMATE_STATS_MEASURE_LABEL_MAP: Record<
    AutomatedInteractionByFeatures,
    string
> = {
    [AutomationBillingEventMeasure.AutomatedInteractionsByAIAgent]: 'AI Agent',
    [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponseFlows]:
        FLOWS,
    [AutomationBillingEventMeasure.AutomatedInteractionsByQuickResponse]:
        QUICK_RESPONSES,
    [AutomationBillingEventMeasure.AutomatedInteractionsByArticleRecommendation]:
        ARTICLE_RECOMMENDATION,
    [AutomationBillingEventMeasure.AutomatedInteractionsByTrackOrder]:
        'Track order',
    [AutomationBillingEventMeasure.AutomatedInteractionsByLoopReturns]:
        'Return order',
    [AutomationBillingEventMeasure.AutomatedInteractionsByAutomatedResponse]:
        'Report order issue',
    [AutomationBillingEventMeasure.AutomatedInteractionsByAutoResponders]:
        'Autoresponders',
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

export function addNonExistingEventTypesForGraph(
    interactionsDataByEventType: Record<string, TimeSeriesDataItem[][]>,
    filter: StatsFilters,
    granularity: ReportingGranularity
) {
    const dateTimes = getPeriodDateTimes(
        [filter.period.start_datetime, filter.period.end_datetime],
        granularity
    )

    for (const eventType of Object.values(AutomateEventType)) {
        if (!interactionsDataByEventType[eventType]) {
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
    interactionsDataByEventType?: Record<string, TimeSeriesDataItem[][]>
): TimeSeriesDataItem[][] {
    if (!interactionsDataByEventType) return []
    const allEventTypesData = addNonExistingEventTypesForGraph(
        interactionsDataByEventType,
        filter,
        granularity
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
    a: {label: string},
    b: {label: string}
) {
    const eventTypeChartLabels = Object.values(AUTOMATE_STATS_MEASURE_LABEL_MAP)
    return (
        eventTypeChartLabels.indexOf(a.label) -
        eventTypeChartLabels.indexOf(b.label)
    )
}

export function addZeroValueTimeSeriesForGreyArea(
    showGreyArea: Moment[],
    timeSeries: TwoDimensionalDataItem[]
) {
    for (const dateTime of showGreyArea) {
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
