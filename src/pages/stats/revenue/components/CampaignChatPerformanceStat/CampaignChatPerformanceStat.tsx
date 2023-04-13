import React, {useEffect, useMemo, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import {CampaignChatPerformanceData} from 'pages/stats/revenue/services/types'
import {getCampaignsAndChatPerformanceOverTime} from 'pages/stats/revenue/services/CampaignPerformanceService'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/LineChart'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'
import {useGetFirstValidIntegration} from 'pages/stats/revenue/hooks/useGetFirstValidIntegration'

type Props = {
    onError: (error: Error) => void
}

const title = 'Campaign versus chat performance'
const hint = `Compare the conversion rates of your chat tickets in general versus campaign conversion,
    to assess the relevance of your campaigns.
    Campaign click-through rate: Number of campaigns engagements, divided by the total number of campaigns displayed.
    Chat conversion rate: Number of tickets from chat channel converted (including tickets converted from campaigns),
    divided by the total number of tickets created from chat channel
    Campaign conversion rate: Number of orders following a campaign engagement,
    divided by the total number of campaigns engagement`

export const CampaignChatPerformanceStat = ({onError}: Props) => {
    const [graphData, setGraphData] =
        useState<CampaignChatPerformanceData | null>(null)
    const [error, setError] = useState<Error | null>(null)

    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const selectedIntegration =
        useGetFirstValidIntegration(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const data = useMemo(
        () => [
            {
                label: 'Campaign click-through rate',
                values: graphData?.campaignCTR || [],
            },
            {
                label: 'Campaign conversion rate',
                values: graphData?.campaignConversionRate || [],
            },
            {
                label: 'Chat conversion rate',
                values: graphData?.chatConversionRate || [],
            },
        ],
        [graphData]
    )

    const [{loading}, fetchTotals] = useAsyncFn(async () => {
        try {
            const data = await getCampaignsAndChatPerformanceOverTime(
                selectedPeriod.start_datetime,
                selectedPeriod.end_datetime,
                namespacedShopName,
                selectedCampaigns,
                selectedIntegration?.id || null
            )
            setGraphData(data)
        } catch (error) {
            setError(error)
            onError(error)
        }
    }, [
        namespacedShopName,
        selectedIntegration,
        selectedCampaigns,
        selectedPeriod,
    ])

    useEffect(() => void fetchTotals(), [fetchTotals])

    return (
        <DashboardGridCell size={12}>
            {!loading && !error && (
                <ChartCard title={title} hint={hint}>
                    <LineChart
                        data={data}
                        hasBackground={false}
                        displayLegend
                    />
                </ChartCard>
            )}
            {(loading || error) && <Skeleton height={300} />}
        </DashboardGridCell>
    )
}
