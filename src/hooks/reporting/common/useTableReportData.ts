import {useEffect, useMemo, useState} from 'react'

import {User} from 'config/types/user'
import {useSortedChannels} from 'hooks/reporting/support-performance/useSortedChannels'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {useChannelsTableSetting} from 'hooks/reporting/useChannelsTableConfigSetting'
import {MetricFetch} from 'hooks/reporting/useMetric'
import {MetricWithDecileFetch} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {ReportingGranularity} from 'models/reporting/types'

import {StatsFilters} from 'models/stat/types'
import {ReportFetch} from 'pages/stats/custom-reports/types'
import {getEntitiesTags} from 'state/entities/tags/selectors'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getSelectedMetric} from 'state/ui/stats/busiestTimesSlice'
import {getTagsOrder} from 'state/ui/stats/tagsReportSlice'
import {
    getCustomFieldsOrder,
    getSelectedCustomField,
} from 'state/ui/stats/ticketInsightsSlice'

export type TableDataSources<T> = {
    fetchData: MetricWithDecileFetch
    title: keyof T
}[]

export type TableSummaryDataSources<T> = {
    fetchData: MetricFetch
    title: keyof T
}[]

export const useTables = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    granularity: ReportingGranularity,
    fetchTables: {title: string; fetchTable: ReportFetch}[]
) => {
    const [tableData, setTableData] = useState<{
        isFetching: boolean
        files: Record<string, string>
    }>({
        isFetching: true,
        files: {},
    })
    const {columnsOrder} = useAgentsTableConfigSetting()
    const {columnsOrder: channelColumnsOrder} = useChannelsTableSetting()

    const agents = useAppSelector<User[]>(getSortedAgents)
    const customFieldsOrder = useAppSelector(getCustomFieldsOrder)
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const {sortedChannels} = useSortedChannels()
    const selectedBTODMetric = useAppSelector(getSelectedMetric)
    const tags = useAppSelector(getEntitiesTags)
    const tagsTableOrder = useAppSelector(getTagsOrder)
    const context = useMemo(
        () => ({
            agents,
            columnsOrder,
            channels: sortedChannels,
            channelColumnsOrder,
            customFieldsOrder,
            selectedCustomFieldId:
                selectedCustomField.id !== null
                    ? String(selectedCustomField.id)
                    : null,
            selectedBTODMetric,
            tags,
            tagsTableOrder,
        }),
        [
            agents,
            columnsOrder,
            sortedChannels,
            channelColumnsOrder,
            customFieldsOrder,
            selectedCustomField.id,
            selectedBTODMetric,
            tags,
            tagsTableOrder,
        ]
    )

    useEffect(() => {
        const promises = fetchTables.map((fetchTable) =>
            fetchTable.fetchTable(
                cleanStatsFilters,
                userTimezone,
                granularity,
                context
            )
        )
        void Promise.all(promises)
            .then((results) => {
                setTableData({
                    isFetching: false,
                    files: Object.assign({}, ...results.map((r) => r.files)),
                })
            })
            .catch(() => setTableData({isFetching: false, files: {}}))
    }, [cleanStatsFilters, context, fetchTables, granularity, userTimezone])

    return tableData
}

export const useTableReportData = <Keys extends string, Format>(
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    reportDataSources: {
        fetchData: (...args: any) => Promise<Format>
        title: Keys
    }[]
) => {
    const [tableData, setTableData] = useState<{
        isFetching: boolean
        data: Record<Keys, Format> | null
    }>({
        isFetching: true,
        data: null,
    })

    useEffect(() => {
        const fetchPromises = reportDataSources.map((r) =>
            r.fetchData(cleanStatsFilters, userTimezone)
        )
        void Promise.all([...fetchPromises])
            .then((results) => {
                setTableData({
                    isFetching: false,
                    data: results.reduce(
                        (acc, r, index) => ({
                            ...acc,
                            [reportDataSources[index].title]: r,
                        }),
                        {} as Record<Keys, Format>
                    ),
                })
            })
            .catch(() => setTableData({isFetching: false, data: null}))
    }, [cleanStatsFilters, userTimezone, reportDataSources])

    return tableData
}

export const fetchTableReportData = async <Keys extends string, Format>(
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    reportDataSources: {
        fetchData: (...args: any) => Promise<Format>
        title: Keys
    }[]
) => {
    const fetchPromises = reportDataSources.map((r) =>
        r.fetchData(cleanStatsFilters, userTimezone)
    )
    return Promise.all([...fetchPromises])
        .then((results) => ({
            isFetching: false,
            isError: false,
            data: results.reduce(
                (acc, r, index) => ({
                    ...acc,
                    [reportDataSources[index].title]: r,
                }),
                {} as Record<Keys, Format>
            ),
        }))
        .catch(() => ({isFetching: false, isError: true, data: null}))
}
