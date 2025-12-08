import { useMemo } from 'react'

import { Box, Card, Heading } from '@gorgias/axiom'

import { DigestCard } from 'AIJourney/components'
import CampaignsTable from 'AIJourney/components/CampaignsTable/CampaignsTable'
import { columns } from 'AIJourney/components/CampaignsTable/Columns'
import { useFilters } from 'AIJourney/hooks'
import {
    DEFAULT_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useCampaignsKpis } from 'AIJourney/hooks/useCampaignsKpis/useCampaignsKpis'
import { useJourneyContext } from 'AIJourney/providers'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'

import css from './Campaigns.less'

export const Campaigns = () => {
    const {
        campaigns,
        isLoadingJourneys: isLoadingCampaigns,
        currentIntegration,
        isLoadingIntegrations,
    } = useJourneyContext()

    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const filters = useFilters()

    const { metrics: tableMetrics, isLoading: isMetricLoading } =
        useAIJourneyTableKpis({
            integrationId: integrationId.toString(),
            filters,
            journeyIds: campaigns?.map((c) => c.id),
        })

    const { metrics } = useCampaignsKpis({
        integrationId: integrationId.toString(),
        filters,
        journeyIds: campaigns?.map((c) => c.id),
    })
    const isLoadingMetrics = metrics?.some((metric) => metric.isLoading)

    const campaignRows = useMemo(() => {
        return campaigns?.map((campaign) => {
            const campaignMetric =
                tableMetrics[campaign.id] || DEFAULT_TABLE_METRICS
            return {
                ...campaign,
                metrics: campaignMetric,
            }
        })
    }, [campaigns, tableMetrics])

    return (
        <Box m="md" flexDirection="column" className={css.container}>
            <DigestCard
                badgeContent="Campaigns Performance"
                metrics={metrics}
                isLoading={isLoadingCampaigns || isLoadingMetrics}
            />
            <Card gap="md">
                <Heading size="md">Campaigns</Heading>
                <CampaignsTable
                    columns={columns}
                    data={campaignRows || []}
                    isLoading={
                        isLoadingIntegrations ||
                        isLoadingCampaigns ||
                        isMetricLoading
                    }
                />
            </Card>
            <DrillDownModal />
        </Box>
    )
}
