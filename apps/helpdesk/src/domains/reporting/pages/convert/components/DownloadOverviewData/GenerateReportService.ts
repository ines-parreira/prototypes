import { useMemo } from 'react'

import { createCsv } from '@repo/utils'
import _get from 'lodash/get'
import moment from 'moment'

import type { Period, StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { SharedDimension } from 'domains/reporting/pages/convert/clients/constants'
import { CAMPAIGN_TABLE_CELLS } from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import {
    fetchGetTableStat,
    useGetTableStat,
} from 'domains/reporting/pages/convert/hooks/stats/useGetTableStat'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import type { CampaignsPerformanceDataset } from 'domains/reporting/pages/convert/services/types'
import { CampaignTableKeys } from 'domains/reporting/pages/convert/types/enums/CampaignTableKeys.enum'
import { CampaignTableValueFormat } from 'domains/reporting/pages/convert/types/enums/CampaignTableValueFormat.enum'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import useAppSelector from 'hooks/useAppSelector'
import type { CampaignPreview } from 'models/convert/campaign/types'
import { formatPercentage } from 'pages/common/utils/numbers'
import { getTimezone } from 'state/currentUser/selectors'

export interface CampaignPerformanceReportData {
    campaign: CampaignPreview
    metrics: Record<string, string | number>
}

export const formatReport = (data: CampaignPerformanceReportData[]) => {
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const cellsWithoutCampaignName = [...CAMPAIGN_TABLE_CELLS].splice(1)

    const exportableData = [
        CAMPAIGN_TABLE_CELLS.map((cell) => cell.title),
        ...data.map((row) => [
            row.campaign.name,
            ...cellsWithoutCampaignName.map((cell) => {
                // Special cases Table Keys
                if (cell.key === CampaignTableKeys.CampaignCurrentStatus) {
                    return row.campaign.status
                }

                if (cell.format === CampaignTableValueFormat.Percentage) {
                    return formatPercentage(
                        (row.metrics[cell.key] as number) ?? 0,
                    )
                }

                return row.metrics[cell.key] ?? 0
            }),
        ]),
    ]

    return {
        files: {
            [`performance-${export_datetime}.csv`]: createCsv(exportableData),
        },
        fileName: `campaign-performance-${export_datetime}`,
    }
}

export const useCampaignReportData = () => {
    const {
        campaigns,
        selectedIntegrations,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
    } = useCampaignStatsFilters()

    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const campaignIds = useMemo(() => {
        // no filter is selected, use all campaigns
        if (selectedCampaignIds !== null && !selectedCampaignIds.length) {
            return campaigns.map((campaign) => campaign.id)
        }
        return selectedCampaignIds
    }, [campaigns, selectedCampaignIds])

    const { isFetching, isError, data } = useGetTableStat({
        groupDimension: SharedDimension.campaignId,
        namespacedShopName,
        campaignIds,
        campaignsOperator: selectedCampaignsOperator,
        startDate: selectedPeriod.start_datetime,
        endDate: selectedPeriod.end_datetime,
        timezone: userTimezone,
    })

    const exportableData = useMemo<CampaignPerformanceReportData[]>(() => {
        const selectedCampaigns = campaigns.filter((campaign) =>
            campaignIds?.includes(campaign.id),
        )

        return selectedCampaigns.map((campaign) => {
            return {
                campaign,
                metrics: _get(data, campaign.id, {}),
            }
        })
    }, [campaigns, campaignIds, data])

    const isLoading = isFetching || isError

    const report = formatReport(exportableData)

    return {
        files: report.files,
        fileName: report.fileName,
        isLoading,
    }
}

const getCampaignIds = (
    selectedCampaignIds: string[] | null,
    campaigns: CampaignPreview[],
) => {
    // no filter is selected, use all campaigns
    if (selectedCampaignIds !== null && !selectedCampaignIds.length) {
        return campaigns.map((campaign) => campaign.id)
    }
    return selectedCampaignIds
}

const getExportableData = (
    campaigns: CampaignPreview[],
    campaignIds: string[] | null,
    data: CampaignsPerformanceDataset | undefined,
) => {
    const selectedCampaigns = campaigns.filter((campaign) =>
        campaignIds?.includes(campaign.id),
    )

    return selectedCampaigns.map((campaign) => {
        return {
            campaign,
            metrics: _get(data, campaign.id, {}),
        }
    })
}

export type CampaignReportContext = {
    campaigns: CampaignPreview[]
    selectedCampaignIds: string[] | null
    selectedCampaignsOperator: LogicalOperatorEnum
    selectedPeriod: Period
    namespacedShopName: string
}

export const fetchCampaignReportData = async (
    _cleanStatsFilters: StatsFilters,
    userTimezone: string,
    _granularity: ReportingGranularity,
    {
        campaignsReportContext,
    }: { campaignsReportContext: CampaignReportContext },
) => {
    const {
        campaigns,
        selectedCampaignIds,
        selectedCampaignsOperator,
        selectedPeriod,
        namespacedShopName,
    } = campaignsReportContext
    const campaignIds = getCampaignIds(selectedCampaignIds, campaigns)

    return fetchGetTableStat({
        groupDimension: SharedDimension.campaignId,
        namespacedShopName,
        campaignIds,
        campaignsOperator: selectedCampaignsOperator,
        startDate: selectedPeriod.start_datetime,
        endDate: selectedPeriod.end_datetime,
        timezone: userTimezone,
    }).then((result) => {
        const exportableData = getExportableData(
            campaigns,
            campaignIds,
            result.data,
        )

        const report = formatReport(exportableData)

        return {
            files: report.files,
            fileName: report.fileName,
            isLoading: false,
        }
    })
}
