import React, {useEffect, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import {RevenueGraphDataPoint} from 'pages/stats/revenue/services/types'
import {getRevenueUpliftOverTime} from 'pages/stats/revenue/services/CampaignPerformanceService'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/LineChart'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'

type Props = {
    onError: (error: Error) => void
}

const title = 'Revenue uplift'
const hint = `Evolution rate of your total store revenue thanks to the campaigns,
    calculated as: (Campaign revenue)/(Total store revenue - Campaign Revenue)`

export const CampaignRevenueUpliftStat = ({onError}: Props) => {
    const [graphData, setGraphData] = useState<RevenueGraphDataPoint[]>([])
    const [error, setError] = useState<Error | null>(null)

    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const [{loading}, fetchTotals] = useAsyncFn(async () => {
        try {
            const data = await getRevenueUpliftOverTime(
                selectedPeriod.start_datetime,
                selectedPeriod.end_datetime,
                namespacedShopName,
                selectedCampaigns
            )
            setGraphData(data)
        } catch (error) {
            setError(error)
            onError(error)
        }
    }, [namespacedShopName, selectedCampaigns, selectedPeriod])

    useEffect(() => void fetchTotals(), [fetchTotals])

    return (
        <DashboardSection title="">
            <DashboardGridCell size={12}>
                {!loading && !error && (
                    <ChartCard title={title} hint={hint}>
                        <LineChart
                            data={[
                                {
                                    label: 'Revenue uplift',
                                    values: graphData,
                                },
                            ]}
                            hasBackground={true}
                        />
                    </ChartCard>
                )}
                {(loading || error) && <Skeleton height={300} />}
            </DashboardGridCell>
        </DashboardSection>
    )
}
