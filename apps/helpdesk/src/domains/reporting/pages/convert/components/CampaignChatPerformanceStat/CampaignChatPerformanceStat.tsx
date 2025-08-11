import React, { useMemo } from 'react'

import { TooltipItem } from 'chart.js'

import { Skeleton } from '@gorgias/axiom'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { useGetCampaignsAndChatChart } from 'domains/reporting/pages/convert/hooks/stats/useGetCampaignsAndChatChart'
import { useCampaignStatsFilters } from 'domains/reporting/pages/convert/hooks/useCampaignStatsFilters'
import { useGetFirstValidIntegration } from 'domains/reporting/pages/convert/hooks/useGetFirstValidIntegration'
import { useGetNamespacedShopNameForStore } from 'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore'
import { renderTickLabelAsPercentage } from 'domains/reporting/pages/utils'
import useAppSelector from 'hooks/useAppSelector'
import { formatPercentage } from 'pages/common/utils/numbers'
import { getTimezone } from 'state/currentUser/selectors'

const title = 'Campaign versus chat performance'
const hint = `Compare the conversion rates of your chat tickets in general versus campaign conversion,
    to assess the relevance of your campaigns.
    Campaign click-through rate: Number of campaigns engagements, divided by the total number of campaigns displayed.
    Chat conversion rate: Number of tickets from chat channel converted (including tickets converted from campaigns),
    divided by the total number of tickets created from chat channel
    Campaign conversion rate: Number of orders following a campaign engagement,
    divided by the total number of campaigns engagement`

const renderTooltipLabel = (context: TooltipItem<'line'>) => {
    let label = context.dataset.label || ''
    if (context.parsed.y !== null) {
        label += `: ${formatPercentage(context.parsed.y)}`
    }
    return label
}

export const CampaignChatPerformanceStat = () => {
    const {
        selectedIntegrations,
        selectedCampaigns,
        selectedCampaignsOperator,
        selectedPeriod,
    } = useCampaignStatsFilters()
    const selectedIntegration =
        useGetFirstValidIntegration(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE,
    )

    const { isFetching, isError, data } = useGetCampaignsAndChatChart(
        namespacedShopName,
        selectedCampaigns,
        selectedCampaignsOperator,
        selectedPeriod.start_datetime,
        selectedPeriod.end_datetime,
        selectedIntegration?.id || null,
        userTimezone,
    )

    const graphData = useMemo(
        () => [
            {
                label: 'Campaign click-through rate',
                values: data?.campaignCTR || [],
            },
            {
                label: 'Campaign conversion rate',
                values: data?.campaignConversionRate || [],
            },
            {
                label: 'Chat conversion rate',
                values: data?.chatConversionRate || [],
            },
        ],
        [data],
    )

    const statsVisible = !isFetching && !isError

    return (
        <DashboardGridCell size={12}>
            {statsVisible && (
                <ChartCard title={title} hint={{ title: hint }}>
                    <LineChart
                        data={graphData}
                        hasBackground={false}
                        displayLegend
                        renderYTickLabel={renderTickLabelAsPercentage}
                        _displayLegacyTooltip
                        _renderLegacyTooltipLabel={renderTooltipLabel}
                    />
                </ChartCard>
            )}
            {!statsVisible && <Skeleton height={300} />}
        </DashboardGridCell>
    )
}
