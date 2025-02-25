import { useCallback, useEffect, useMemo, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { User } from 'config/types/user'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useSortedChannels } from 'hooks/reporting/support-performance/useSortedChannels'
import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { useChannelsTableSetting } from 'hooks/reporting/useChannelsTableConfigSetting'
import { MetricFetch } from 'hooks/reporting/useMetric'
import { MetricWithDecileFetch } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { CampaignReportContext } from 'pages/stats/convert/components/DownloadOverviewData/GenerateReportService'
import { useCampaignStatsFilters } from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import { ReportFetch } from 'pages/stats/custom-reports/types'
import { getAllAgentsJS } from 'state/agents/selectors'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import { getIntegrations } from 'state/integrations/selectors'
import { getSortedAgents } from 'state/ui/stats/agentPerformanceSlice'
import { getSortedAutoQAAgents } from 'state/ui/stats/autoQAAgentPerformanceSlice'
import { getSelectedMetric } from 'state/ui/stats/busiestTimesSlice'
import { getTagsOrder } from 'state/ui/stats/tagsReportSlice'
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
    fetchTables: { title: string; fetchTable: ReportFetch }[],
) => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined =
        useFlags()[
            FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate
        ]
    const aiAgentUserId = useAIAgentUserId()
    const [tableData, setTableData] = useState<{
        isFetching: boolean
        files: Record<string, string>
    }>({
        isFetching: true,
        files: {},
    })
    const { columnsOrder } = useAgentsTableConfigSetting()
    const { columnsOrder: channelColumnsOrder } = useChannelsTableSetting()

    const agents = useAppSelector<User[]>(getSortedAgents)
    const agentsQA = useAppSelector<User[]>(getSortedAutoQAAgents)
    const customFieldsOrder = useAppSelector(getCustomFieldsOrder)
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const { sortedChannels } = useSortedChannels()
    const selectedBTODMetric = useAppSelector(getSelectedMetric)
    const tags = useAppSelector(getEntitiesTags)
    const tagsTableOrder = useAppSelector(getTagsOrder)
    const allAgents = useAppSelector(getAllAgentsJS)
    const getAgentDetails = useCallback(
        (id: number) => allAgents.find((agent) => agent.id === id),
        [allAgents],
    )
    const integrations = useAppSelector(getIntegrations)
    const {
        campaigns,
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
    } = useCampaignStatsFilters()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const campaignsReportContext: CampaignReportContext = useMemo(
        () => ({
            campaigns,
            selectedCampaignIds,
            selectedCampaignsOperator,
            selectedPeriod,
            namespacedShopName,
        }),
        [
            campaigns,
            namespacedShopName,
            selectedCampaignIds,
            selectedCampaignsOperator,
            selectedPeriod,
        ],
    )
    const context = useMemo(
        () => ({
            agents,
            agentsQA,
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
            getAgentDetails,
            integrations,
            isAutomateNonFilteredDenominatorInAutomationRate,
            aiAgentUserId,
            campaignsReportContext,
        }),
        [
            agents,
            agentsQA,
            campaignsReportContext,
            columnsOrder,
            sortedChannels,
            channelColumnsOrder,
            customFieldsOrder,
            selectedCustomField.id,
            selectedBTODMetric,
            tags,
            tagsTableOrder,
            getAgentDetails,
            integrations,
            isAutomateNonFilteredDenominatorInAutomationRate,
            aiAgentUserId,
        ],
    )

    useEffect(() => {
        const promises = fetchTables.map((fetchTable) =>
            fetchTable.fetchTable(
                cleanStatsFilters,
                userTimezone,
                granularity,
                context,
            ),
        )
        void Promise.all(promises)
            .then((results) => {
                setTableData({
                    isFetching: false,
                    files: Object.assign({}, ...results.map((r) => r.files)),
                })
            })
            .catch(() => setTableData({ isFetching: false, files: {} }))
    }, [cleanStatsFilters, context, fetchTables, granularity, userTimezone])

    return tableData
}

export const useTableReportData = <Keys extends string, Format>(
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    reportDataSources: {
        fetchData: (...args: any) => Promise<Format>
        title: Keys
    }[],
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
            r.fetchData(cleanStatsFilters, userTimezone),
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
                        {} as Record<Keys, Format>,
                    ),
                })
            })
            .catch(() => setTableData({ isFetching: false, data: null }))
    }, [cleanStatsFilters, userTimezone, reportDataSources])

    return tableData
}

export const fetchTableReportData = async <Keys extends string, Format>(
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    reportDataSources: {
        fetchData: (...args: any) => Promise<Format>
        title: Keys
    }[],
) => {
    const fetchPromises = reportDataSources.map((r) =>
        r.fetchData(cleanStatsFilters, userTimezone),
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
                {} as Record<Keys, Format>,
            ),
        }))
        .catch(() => ({ isFetching: false, isError: true, data: null }))
}
