import { useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import type { MetricConfigItem } from '@repo/reporting'
import { ConfigureMetricsModal } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, PageHeader } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { JourneysTable } from 'AIJourney/components'
import { journeyTableDataMetrics } from 'AIJourney/components/JourneysTable/constants'
import {
    actionColumns,
    journeysColumns,
    metricColumns,
} from 'AIJourney/components/JourneysTable/JourneysColumns/JourneysColumns'
import {
    DEFAULT_TABLE_METRICS,
    EMPTY_TABLE_METRICS,
    LOADING_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import type { Metrics } from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'

import css from './Flows.less'

type FlowMetrics = Metrics<number | string | undefined>
type UnconfiguredFlow = {
    type: JourneyTypeEnum
    state: JourneyStatusEnum
    store_name: string
    id: undefined
    campaign: undefined
}
type UnconfiguredFlowWithMetrics = UnconfiguredFlow & { metrics: FlowMetrics }
type ConfiguredFlowWithMetrics = JourneyApiDTO & { metrics: FlowMetrics }
export type TableRow = UnconfiguredFlowWithMetrics | ConfiguredFlowWithMetrics

export const Flows = () => {
    const [isMetricsEditModalOpen, setIsMetricsEditModalOpen] = useState(false)

    const [flowsTableKpisConfig, setFlowsTableKpisConfig] = useLocalStorage<
        MetricConfigItem[]
    >('ai-journey-flows-table-metrics-preferences', journeyTableDataMetrics)

    const isAiJourneyWinBackEnabled = useFlag(
        FeatureFlagKey.AiJourneyWinBackEnabled,
    )
    const isAiJourneyWelcomeFlowEnabled = useFlag(
        FeatureFlagKey.AiJourneyWelcomeFlowEnabled,
    )
    const isAiJourneyPostPurchaseEnabled = useFlag(
        FeatureFlagKey.AiJourneyPostPurchaseEnabled,
    )

    const { cleanStatsFilters: statsFilters } = useStatsFilters()

    const { journeys, currentIntegration, isLoadingJourneys, shopName } =
        useJourneyContext()

    const hasFlows = journeys && journeys.length > 0

    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const filters = useMemo(() => {
        return {
            period: statsFilters.period,
        }
        // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
    }, [statsFilters.period.start_datetime, statsFilters.period.end_datetime])

    const { metrics: tableMetrics, isLoading: isMetricLoading } =
        useAIJourneyTableKpis({
            integrationId: integrationId.toString(),
            filters,
            journeyIds: journeys?.map((journey) => journey.id),
            enabled: !isLoadingJourneys && hasFlows,
        })

    const visibleColumns: ColumnDef<TableRow>[] = useMemo(() => {
        const orderedMetricColumns = flowsTableKpisConfig
            .filter((item) => item.visibility)
            .map((item) => {
                return metricColumns.find((column) => {
                    let columnId = ''
                    if ('id' in column && column.id) {
                        columnId = column.id
                    } else if ('accessorKey' in column && column.accessorKey) {
                        columnId = String(column.accessorKey)
                    }
                    return item.id === columnId.replace('metrics.', '')
                })
            })
            .filter(
                (option): option is ColumnDef<TableRow> => option !== undefined,
            )

        return [
            ...journeysColumns,
            ...orderedMetricColumns,
            ...actionColumns,
        ] as ColumnDef<TableRow>[]
    }, [flowsTableKpisConfig])

    // The source of truth of existent journeys comes from the BE
    const availableFlows = Object.values(JourneyTypeEnum).filter(
        (journeyType) => journeyType !== JourneyTypeEnum.Campaign,
    )

    // We might have existent journeys that are not enabled for the merchant
    const enabledAvailableFlows: JourneyTypeEnum[] = availableFlows?.filter(
        (flowType) => {
            switch (flowType) {
                case JourneyTypeEnum.WinBack:
                    return !!isAiJourneyWinBackEnabled
                case JourneyTypeEnum.Welcome:
                    return !!isAiJourneyWelcomeFlowEnabled
                case JourneyTypeEnum.PostPurchase:
                    return !isAiJourneyPostPurchaseEnabled
                default:
                    return true
            }
        },
    )

    // Configured flows filtering the disabled ones above (we can enable a flow for a customer but don't want to show it in the UI)
    const configuredFlows: ConfiguredFlowWithMetrics[] | undefined =
        useMemo(() => {
            const filteredJourneys = journeys?.filter((journey) =>
                enabledAvailableFlows.includes(journey.type),
            )

            return filteredJourneys?.map((journey) => ({
                ...journey,
                metrics: isMetricLoading
                    ? LOADING_TABLE_METRICS
                    : tableMetrics[journey.id] || DEFAULT_TABLE_METRICS,
            }))
        }, [journeys, enabledAvailableFlows, tableMetrics, isMetricLoading])

    // Flows that are available, enabled but hasn't been configured by an user (configured !== activated)
    const unconfiguredFlows: UnconfiguredFlowWithMetrics[] | undefined =
        useMemo(() => {
            const configuredFlowTypes =
                configuredFlows?.map((flow) => flow.type) || []

            return enabledAvailableFlows
                ?.filter((flowType) => !configuredFlowTypes.includes(flowType))
                .map((flowType) => ({
                    type: flowType,
                    state: JourneyStatusEnum.Draft,
                    store_name: shopName,
                    metrics: EMPTY_TABLE_METRICS,
                    id: undefined,
                    campaign: undefined,
                }))
        }, [configuredFlows, enabledAvailableFlows, shopName])

    const tableRows: TableRow[] = useMemo(() => {
        return [...(configuredFlows || []), ...(unconfiguredFlows || [])]
    }, [configuredFlows, unconfiguredFlows])

    return (
        <Box m="md" width="100%" flexDirection="column">
            <PageHeader title="Flows" />
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
                <JourneysTable
                    columns={visibleColumns}
                    data={tableRows || []}
                    onEditColumns={() => setIsMetricsEditModalOpen(true)}
                    isLoading={isLoadingJourneys}
                    integrationId={integrationId}
                />
            </Box>
            <ConfigureMetricsModal
                isOpen={isMetricsEditModalOpen}
                onClose={() => setIsMetricsEditModalOpen(false)}
                metrics={flowsTableKpisConfig}
                onSave={setFlowsTableKpisConfig}
                maxVisibleMetric={5}
            />
        </Box>
    )
}
