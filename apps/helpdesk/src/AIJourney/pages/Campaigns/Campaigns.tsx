import { useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { ConfigureMetricsModal, type MetricConfigItem } from '@repo/reporting'

import { Box, Card, type ColumnDef, Heading } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { DigestCard } from 'AIJourney/components'
import CampaignsTable from 'AIJourney/components/CampaignsTable/CampaignsTable'
import {
    actionColumns,
    columns,
    metricColumns,
} from 'AIJourney/components/CampaignsTable/Columns'
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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const customizableMetrics: MetricConfigItem[] = [
        { id: 'recipients', label: 'Recipients', visibility: true },
        { id: 'revenue', label: 'Revenue', visibility: true },
        { id: 'totalOrders', label: 'Orders', visibility: false },
        {
            id: 'revenuePerRecipient',
            label: 'Revenue per Recipient',
            visibility: false,
        },
        { id: 'averageOrderValue', label: 'AOV', visibility: false },
        { id: 'messagesSent', label: 'Messages Sent', visibility: false },
        { id: 'ctr', label: 'CTR', visibility: true },
        { id: 'replyRate', label: 'Reply rate', visibility: true },
        { id: 'optOutRate', label: 'Opt Out rate', visibility: false },
        { id: 'conversionRate', label: 'Conversion rate', visibility: false },
    ]

    const [keyKpisConfig, setKeyKpisConfig] = useLocalStorage<
        MetricConfigItem[]
    >('ai-journey-campaign-columns', customizableMetrics)

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

    const visibleColumns: ColumnDef<JourneyApiDTO>[] = useMemo(() => {
        const orderedMetricColumns = keyKpisConfig
            .filter((item) => item.visibility)
            .map((item) => {
                return metricColumns.find((column) => {
                    //@ts-ignore
                    const columnId = column.id || column.accessorKey || ''
                    return item.id === columnId.replace('metrics.', '')
                })
            })
            .filter(
                (option): option is ColumnDef<JourneyApiDTO> =>
                    option !== undefined,
            )

        return [...columns, ...orderedMetricColumns, ...actionColumns]
    }, [keyKpisConfig])

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
                    columns={visibleColumns}
                    data={campaignRows || []}
                    onEditColumns={() => setIsEditModalOpen(true)}
                    isLoading={
                        isLoadingIntegrations ||
                        isLoadingCampaigns ||
                        isMetricLoading
                    }
                />
            </Card>
            <DrillDownModal />
            <ConfigureMetricsModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                metrics={keyKpisConfig}
                onSave={setKeyKpisConfig}
                maxVisibleMetric={6}
            />
        </Box>
    )
}
