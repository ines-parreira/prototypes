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

const DATASET_VISIBILITY_ITEMS = 3
const TOP_AMOUNT = 10

const getAverageCSATScorePerDimension = (data?: TimeSeriesPerDimension) => {
    if (!data) return {}
    return Object.entries(data).reduce<Record<string, number>>(
        (acc, [key, value]) => {
            acc[key] = value
                .map((item) => item[1].value)
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
    if (!timeseriesData[0]) return
    for (let i = 0; i < timeseriesData[0].length; i++) {
        let sum = 0
        let count = 0
        dataValues.forEach((dataValue) => {
            sum += dataValue[0][i].value * dataValue[1][i].value
            count += dataValue[1][i].value
        })
        averageCSATSeries[0].push({
            ...timeseriesData[0][i],
            value: sum / (count || 1),
        })
        averageCSATSeries[1].push({...timeseriesData[1][i], value: count})
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
