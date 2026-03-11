import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { User } from 'config/types/user'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useSortedChannels } from 'domains/reporting/hooks/support-performance/useSortedChannels'
import { useTagResultsSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import type { MetricWithDecileFetch } from 'domains/reporting/hooks/types'
import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import type { MetricFetch } from 'domains/reporting/hooks/useMetric'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import type { CampaignReportContext } from 'domains/reporting/pages/convert/components/DownloadOverviewData/GenerateReportService'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import type { ReportFetch } from 'domains/reporting/pages/dashboards/types'
import { getSortedAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { getSortedAutoQAAgents } from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import { getSelectedMetric } from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import { getTagsOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import {
    getCustomFieldsOrder,
    getSelectedCustomField,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { getAllAgentsJS } from 'state/agents/selectors'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import { getIntegrations } from 'state/integrations/selectors'

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
    granularity: AggregationWindow,
    fetchTables: { title: string; fetchTable: ReportFetch }[],
) => {
    const isReportingFilteringAndCalculationsTagsReportEnabled = useFlag(
        FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport,
    )

    const [tagTicketTimeReference] = useTicketTimeReference(Entity.Tag)
    const [ticketFieldsTicketTimeReference] = useTicketTimeReference(
        Entity.TicketField,
    )

    const aiAgentUserId = useAIAgentUserId()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    const [tableData, setTableData] = useState<{
        isFetching: boolean
        files: Record<string, string>
    }>({
        isFetching: true,
        files: {},
    })
    const { columnsOrder, rowsOrder } = useAgentsTableConfigSetting()
    const { columnsOrder: channelColumnsOrder } = useChannelsTableSetting()
    const [tagResultsSelection] = useTagResultsSelection()

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
            rowsOrder,
            channels: sortedChannels,
            channelColumnsOrder,
            customFieldsOrder,
            selectedCustomFieldId:
                selectedCustomField.id !== null ? selectedCustomField.id : null,
            selectedBTODMetric,
            tags,
            tagsTableOrder,
            isExtendedReportingEnabled:
                isReportingFilteringAndCalculationsTagsReportEnabled,
            tagTicketTimeReference,
            ticketFieldsTicketTimeReference,
            getAgentDetails,
            integrations,
            aiAgentUserId,
            costSavedPerInteraction,
            campaignsReportContext,
            tagResultsSelection,
        }),
        [
            agents,
            agentsQA,
            campaignsReportContext,
            columnsOrder,
            rowsOrder,
            sortedChannels,
            channelColumnsOrder,
            customFieldsOrder,
            selectedCustomField.id,
            selectedBTODMetric,
            tags,
            tagsTableOrder,
            tagTicketTimeReference,
            ticketFieldsTicketTimeReference,
            isReportingFilteringAndCalculationsTagsReportEnabled,
            getAgentDetails,
            integrations,
            aiAgentUserId,
            costSavedPerInteraction,
            tagResultsSelection,
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
        void Promise.all(fetchPromises)
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
    return Promise.all(fetchPromises)
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
