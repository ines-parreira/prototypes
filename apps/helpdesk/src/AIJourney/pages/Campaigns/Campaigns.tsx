import { useMemo, useState } from 'react'

import { useLocalStorage } from '@repo/hooks'
import { ConfigureMetricsModal } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'
import { useHistory } from 'react-router-dom'

import { Box, Button, PageHeader } from '@gorgias/axiom'
import type { ColumnDef } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import CampaignsTable from 'AIJourney/components/CampaignsTable/CampaignsTable'
import {
    actionColumns,
    columns,
    metricColumns,
} from 'AIJourney/components/CampaignsTable/Columns'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import {
    DEFAULT_TABLE_METRICS,
    LOADING_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import type { Metrics } from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'

import { getCampaignStateLabelAndColor } from '../../utils'

import css from './Campaigns.less'

type JourneyMetrics = Metrics<number | string | undefined>
export type JourneyWithMetrics = JourneyApiDTO & { metrics: JourneyMetrics }
export type TableRow = JourneyWithMetrics

export const Campaigns = () => {
    const {
        campaigns,
        isLoadingJourneys: isLoadingCampaigns,
        currentIntegration,
        shopName,
    } = useJourneyContext()

    const history = useHistory()

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

    const { cleanStatsFilters: statsFilters } = useStatsFilters()

    const filters = useMemo(() => {
        return {
            period: statsFilters.period,
        }
        // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
    }, [statsFilters.period.start_datetime, statsFilters.period.end_datetime])

    const hasCampaigns = campaigns && campaigns.length > 0

    const { metrics: tableMetrics, isLoading: isMetricLoading } =
        useAIJourneyTableKpis({
            integrationId: integrationId.toString(),
            filters,
            journeyIds: campaigns?.map((c) => c.id),
            enabled: !isLoadingCampaigns && hasCampaigns,
        })

    const campaignRows = useMemo(() => {
        return campaigns?.map((campaign) => {
            const campaignMetric = isMetricLoading
                ? LOADING_TABLE_METRICS
                : tableMetrics[campaign.id] || DEFAULT_TABLE_METRICS

            const { label: stateLabel } = getCampaignStateLabelAndColor(
                campaign.campaign?.state,
            )
            return {
                ...campaign,
                stateLabel: stateLabel,
                metrics: campaignMetric,
            }
        })
    }, [campaigns, tableMetrics, isMetricLoading])

    const visibleColumns: ColumnDef<TableRow>[] = useMemo(() => {
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
                (option): option is ColumnDef<TableRow> => option !== undefined,
            )

        return [...columns, ...orderedMetricColumns, ...actionColumns]
    }, [keyKpisConfig])

    return (
        <Box m="md" width="100%" flexDirection="column">
            <PageHeader title="Campaigns">
                <Button
                    onClick={() =>
                        history.push(
                            `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
                        )
                    }
                >
                    Create campaign
                </Button>
            </PageHeader>

            <Box
                m="md"
                padding="xs"
                gap="lg"
                margin={0}
                flexDirection="column"
                className={css.container}
            >
                <FiltersPanelWrapper
                    persistentFilters={[FilterKey.Period]}
                    withSavedFilters={false}
                    filterSettingsOverrides={{
                        [FilterKey.Period]: {
                            initialSettings: {
                                maxSpan: 365,
                            },
                        },
                    }}
                />
                <CampaignsTable
                    columns={visibleColumns}
                    data={campaignRows || []}
                    onEditColumns={() => setIsEditModalOpen(true)}
                    isLoading={isLoadingCampaigns}
                />
                <DrillDownModal />
                <ConfigureMetricsModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    metrics={keyKpisConfig}
                    onSave={setKeyKpisConfig}
                    maxVisibleMetric={6}
                />
            </Box>
        </Box>
    )
}
