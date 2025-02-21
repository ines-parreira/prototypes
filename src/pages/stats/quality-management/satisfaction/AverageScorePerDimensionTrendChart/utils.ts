import _fromPairs from 'lodash/fromPairs'
import _sortBy from 'lodash/sortBy'

import {User} from 'config/types/user'

import {
    TimeSeriesDataItem,
    TimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {Integration} from 'models/integration/types'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesDimension} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {NOT_AVAILABLE_TEXT} from 'pages/stats/common/utils'

const DATASET_VISIBILITY_ITEMS = 3
const TOP_AMOUNT = 10

const getAverageCSATScorePerDimension = (data?: TimeSeriesPerDimension) => {
    if (!data) return {}
    return Object.entries(data).reduce<Record<string, number>>(
        (acc, [key, value]) => {
            const measureIndices = getMeasureIndices(value)
            const scoredSurveysCountIndex =
                measureIndices[
                    TicketSatisfactionSurveyMeasure.ScoredSurveysCount
                ]

            if (scoredSurveysCountIndex === undefined) return acc

            acc[key] = value[scoredSurveysCountIndex]
                .map((item) => item.value)
                .reduce(
                    (prevValue, currentValue) => prevValue + currentValue,
                    0
                )
            return acc
        },
        {}
    )
}

export const getAverageCSATLabels = ({
    initialLabels,
    getAgentDetails,
    dimension,
    initialTooltips,
    integrations,
}: {
    initialLabels: string[]
    initialTooltips: string[]
    dimension: string
    getAgentDetails?: (id: number) => User | undefined
    integrations?: Array<Integration>
}) => {
    let labels = initialLabels
    let tooltips = initialTooltips
    if (dimension === TicketDimension.AssigneeUserId) {
        labels = initialLabels.map((label) => {
            if (label === 'null') return 'No Agent'
            const agent = getAgentDetails?.(parseInt(label))
            return agent ? String(agent.name) : label
        })
        tooltips = [...labels]
    } else if (dimension === TicketMessagesDimension.Integration) {
        labels = initialLabels.map((label) => {
            if (label === 'null') return 'No Integration'
            const integration = integrations?.find(
                (integration) => integration.id === parseInt(label)
            )
            return integration ? integration.name : label
        })
        tooltips = [...labels]
    }
    return {labels, tooltips}
}

export const getSortedData = (
    topAmount: number,
    defaultData?: TimeSeriesPerDimension,
    averageTimeseries?: TimeSeriesDataItem[][]
) => {
    const data = {
        ...defaultData,
        ...(averageTimeseries ? {Average: averageTimeseries} : {}),
    }

    const averageCSATScore = getAverageCSATScorePerDimension(defaultData)
    averageCSATScore.Average = Infinity
    const sortedData = _sortBy(Object.entries(data), ([key]) => {
        return -averageCSATScore[key]
    })
    const topData = sortedData.slice(0, topAmount)

    const dataToRender = topData.map(([__, data]) => data[0])
    const labels = topData.map(([dim, __]) => dim)
    const tooltips = topData.map(([dim, __]) => dim)

    const initialVisibility = _fromPairs(
        topData.map((_, index) => [index, index < DATASET_VISIBILITY_ITEMS])
    )

    return {dataToRender, labels, tooltips, initialVisibility}
}

export const computeAverageCSAT = (data?: TimeSeriesPerDimension) => {
    if (!data) return
    const averageCSATSeries: TimeSeriesDataItem[][] = [[], []]
    const dataValues = Object.values(data)
    if (!data || dataValues.length === 0) return
    const timeseriesData = dataValues[0]
    const measureIndices = getMeasureIndices(timeseriesData)
    const avgSurveyScoreIndex =
        measureIndices[TicketSatisfactionSurveyMeasure.AvgSurveyScore]
    const scoredSurveysCountIndex =
        measureIndices[TicketSatisfactionSurveyMeasure.ScoredSurveysCount]

    if (
        !timeseriesData?.[0] ||
        avgSurveyScoreIndex === undefined ||
        scoredSurveysCountIndex === undefined
    )
        return

    for (let i = 0; i < timeseriesData[0].length; i++) {
        let sum = 0
        let count = 0
        dataValues.forEach((dataValue) => {
            sum +=
                dataValue[avgSurveyScoreIndex][i].value *
                dataValue[scoredSurveysCountIndex][i].value
            count += dataValue[scoredSurveysCountIndex][i].value
        })
        averageCSATSeries[avgSurveyScoreIndex].push({
            ...timeseriesData[avgSurveyScoreIndex][i],
            value: sum / (count || 1),
        })
        averageCSATSeries[scoredSurveysCountIndex].push({
            ...timeseriesData[scoredSurveysCountIndex][i],
            value: count,
        })
    }
    return averageCSATSeries
}

export const getFormattedInfo = ({
    dimension,
    data,
    integrations,
    getAgentDetails,
}: {
    dimension: string
    getAgentDetails?: (id: number) => User | undefined
    integrations?: Array<Integration>
    data?: TimeSeriesPerDimension
}) => {
    const averageTimeseries = computeAverageCSAT(data)
    const {
        dataToRender,
        labels: initialLabels,
        tooltips: initialTooltips,
        initialVisibility,
    } = getSortedData(TOP_AMOUNT, data, averageTimeseries)

    const {labels, tooltips} = getAverageCSATLabels({
        initialLabels,
        initialTooltips,
        integrations,
        getAgentDetails,
        dimension,
    })

    if (!data) return {}

    return {labels, tooltips, dataToRender, initialVisibility}
}

export const transformToTimeSeriesData = (result: {
    dataToRender: TimeSeriesDataItem[][]
    labels: string[]
}) => {
    if (result.dataToRender.length === 0) return []
    const dates = result.dataToRender[0].map((item) => item.dateTime)
    const values: (string | number)[][] = [['Date', ...result.labels]]
    for (let i = 0; i < dates.length; i++) {
        values.push([
            dates[i],
            ...result.dataToRender.map(
                (value) => value[values.length - 1].value
            ),
        ])
    }
    return values
}

export const formatZeroToNALabel = (value: number | string) => {
    const stringValue = value.toString()
    return stringValue === '0' ? NOT_AVAILABLE_TEXT : stringValue
}

export const getMeasureIndices = (data: TimeSeriesDataItem[][]) => {
    const measureIndices: Record<string, number> = {}
    for (let i = 0; i < data.length; i++) {
        if (data[i].length === 0) continue
        measureIndices[data[i][0].label || 'no-label'] = i
    }
    return measureIndices
}
