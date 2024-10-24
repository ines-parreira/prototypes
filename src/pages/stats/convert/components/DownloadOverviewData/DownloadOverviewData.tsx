import _get from 'lodash/get'
import React, {useMemo, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {SharedDimension} from 'pages/stats/convert/clients/constants'
import {
    saveReport,
    CampaignPerformanceReportData,
} from 'pages/stats/convert/components/DownloadOverviewData/GenerateReportService'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {useGetTableStat} from 'pages/stats/convert/hooks/stats/useGetTableStat'
import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'
import {useGetNamespacedShopNameForStore} from 'pages/stats/convert/hooks/useGetNamespacedShopNameForStore'
import {getTimezone} from 'state/currentUser/selectors'

const DownloadOverviewData = () => {
    const [waitForTheReportData, setwaitForTheReportData] = useState(false)

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
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )

    const campaignIds = useMemo(() => {
        // no filter is selected, use all campaigns
        if (selectedCampaignIds !== null && !selectedCampaignIds.length) {
            return campaigns.map((campaign) => campaign.id)
        }
        return selectedCampaignIds
    }, [campaigns, selectedCampaignIds])

    const {isFetching, isError, data} = useGetTableStat({
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
            campaignIds?.includes(campaign.id)
        )

        return selectedCampaigns.map((campaign) => {
            return {
                campaign,
                metrics: _get(data, campaign.id, {}),
            }
        })
    }, [campaigns, campaignIds, data])

    const isLoading = isFetching || isError

    const onClick = async () => {
        if (isLoading) {
            return
        }

        setwaitForTheReportData(true)

        await saveReport(exportableData)

        setwaitForTheReportData(false)
    }

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={onClick}
            isLoading={waitForTheReportData}
            isDisabled={isFetching || isError}
            title={'Download Performance Overview Data'}
        >
            <ButtonIconLabel icon="file_download">
                Download Data
            </ButtonIconLabel>
        </Button>
    )
}

export default DownloadOverviewData
