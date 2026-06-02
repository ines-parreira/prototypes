import { useCallback, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import type { MetricConfigItem } from '@repo/reporting'
import { ConfigureMetricsModal } from '@repo/reporting'
import { useHistory } from 'react-router-dom'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, Pagination, PanelHeader, Text } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyStatusEnum, JourneyTypeEnum } from '@gorgias/convert-client'

import { CreateFlowButton, JourneysTable } from 'AIJourney/components'
import { journeyTableDataMetrics } from 'AIJourney/components/JourneysTable/constants'
import {
    actionColumns,
    journeysColumns,
    metricColumns,
} from 'AIJourney/components/JourneysTable/JourneysColumns/JourneysColumns'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import {
    DEFAULT_TABLE_METRICS,
    EMPTY_TABLE_METRICS,
    LOADING_TABLE_METRICS,
    useAIJourneyTableKpis,
} from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import type { Metrics } from 'AIJourney/hooks/useAIJourneyTableKpis/useAIJourneyTableKpis'
import { useJourneyContext } from 'AIJourney/providers'
import {
    CUSTOM_FLOWS_PAGE_SIZE,
    useFlowsList,
} from 'AIJourney/queries/useCustomFlows/useCustomFlows'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import { useSearchParam } from 'hooks/useSearchParam'

import { filterImpersonatedColumns } from '../../utils/filterImpersonatedColumns'

import css from './Flows.less'

type FlowMetrics = Metrics<number | string | undefined>
type UnconfiguredFlow = {
    type: JourneyTypeEnum
    state: JourneyStatusEnum
    store_name: string
    id: undefined
    campaign: undefined
    name?: string
}
type UnconfiguredFlowWithMetrics = UnconfiguredFlow & { metrics: FlowMetrics }
type ConfiguredFlowWithMetrics = JourneyApiDTO & {
    metrics: FlowMetrics
}
type CustomFlowWithMetrics = JourneyApiDTO & {
    name: string
    metrics: FlowMetrics
}
export type TableRow =
    | UnconfiguredFlowWithMetrics
    | ConfiguredFlowWithMetrics
    | CustomFlowWithMetrics

const availableFlows: JourneyTypeEnum[] = [
    JourneyTypeEnum.SessionAbandoned,
    JourneyTypeEnum.CartAbandoned,
    JourneyTypeEnum.PostPurchase,
    JourneyTypeEnum.Welcome,
    JourneyTypeEnum.WinBack,
]

export const Flows = () => {
    const [isMetricsEditModalOpen, setIsMetricsEditModalOpen] = useState(false)

    const [flowsTableKpisConfig, setFlowsTableKpisConfig] = useLocalStorage<
        MetricConfigItem[]
    >('ai-journey-flows-table-metrics-preferences', journeyTableDataMetrics)

    const isAiJourneyCustomFlowEnabled = useFlag(
        FeatureFlagKey.AiJourneyCustomFlowEnabled,
    )
    const { cleanStatsFilters: statsFilters } = useStatsFilters()

    const { journeys, currentIntegration, isLoadingJourneys, shopName } =
        useJourneyContext()

    const history = useHistory()
    const handleAddCustomFlow = useCallback(() => {
        history.push(
            `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CUSTOM}/${STEPS_NAMES.SETUP}`,
        )
    }, [history, shopName])

    const isImpersonated = !!window.USER_IMPERSONATED

    const hasFlows = journeys && journeys.length > 0

    const integrationId = useMemo(() => {
        return currentIntegration?.id || 0
    }, [currentIntegration])

    const [pageParam, setPageParam] = useSearchParam('page')
    const currentPage = Math.max(1, parseInt(pageParam ?? '', 10) || 1)

    const { data: flowsListData } = useFlowsList(integrationId || undefined, {
        enabled: !!integrationId,
    })

    const allCustomFlows = useMemo(
        () => flowsListData?.custom ?? [],
        [flowsListData],
    )
    const totalCustomFlows = allCustomFlows.length
    const hasMultipleCustomPages = totalCustomFlows > CUSTOM_FLOWS_PAGE_SIZE
    const totalCustomPages = Math.ceil(
        totalCustomFlows / CUSTOM_FLOWS_PAGE_SIZE,
    )

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

        const baseColumns = filterImpersonatedColumns(
            journeysColumns,
            isImpersonated,
        )

        return [
            ...baseColumns,
            ...orderedMetricColumns,
            ...actionColumns,
        ] as ColumnDef<TableRow>[]
    }, [flowsTableKpisConfig, isImpersonated])

    const configuredFlows: ConfiguredFlowWithMetrics[] | undefined =
        useMemo(() => {
            // Custom flows come exclusively from useFlowsList -> sortedCustomFlows
            // below. Including them here as well caused each custom flow to
            // render twice in tableRows.
            const filteredJourneys = journeys?.filter((journey) =>
                availableFlows.includes(journey.type),
            )

            return filteredJourneys?.map((journey) => ({
                ...journey,
                metrics: isMetricLoading
                    ? LOADING_TABLE_METRICS
                    : tableMetrics[journey.id] || DEFAULT_TABLE_METRICS,
            }))
        }, [journeys, tableMetrics, isMetricLoading])

    // Flows that are available but hasn't been configured by an user (configured !== activated)
    const unconfiguredFlows: UnconfiguredFlowWithMetrics[] | undefined =
        useMemo(() => {
            const configuredFlowTypes =
                configuredFlows?.map((flow) => flow.type) || []

            return availableFlows
                .filter((flowType) => !configuredFlowTypes.includes(flowType))
                .map((flowType) => ({
                    type: flowType,
                    state: JourneyStatusEnum.Draft,
                    store_name: shopName,
                    metrics: EMPTY_TABLE_METRICS,
                    id: undefined,
                    campaign: undefined,
                }))
        }, [configuredFlows, shopName])

    const sortedCustomFlows: CustomFlowWithMetrics[] = useMemo(() => {
        const items = allCustomFlows as Array<JourneyApiDTO & { name?: string }>
        const sorted = [...items].sort((a, b) =>
            (a.name ?? '')
                .toLowerCase()
                .localeCompare((b.name ?? '').toLowerCase()),
        )
        const offset = (currentPage - 1) * CUSTOM_FLOWS_PAGE_SIZE
        const paged = sorted.slice(offset, offset + CUSTOM_FLOWS_PAGE_SIZE)
        return paged.map((flow) => ({
            ...flow,
            name: flow.name ?? '',
            metrics: EMPTY_TABLE_METRICS,
        }))
    }, [allCustomFlows, currentPage])

    const tableRows: TableRow[] = useMemo(() => {
        return [
            ...(configuredFlows || []),
            ...(unconfiguredFlows || []),
            ...sortedCustomFlows,
        ]
    }, [configuredFlows, unconfiguredFlows, sortedCustomFlows])

    const showCustomFlowEmptyState =
        isAiJourneyCustomFlowEnabled && totalCustomFlows === 0

    return (
        <Box width="100%" flexDirection="column">
            <PanelHeader title="Flows" trailingSlot={<CreateFlowButton />} />
            <Box className={css.filtersPanel}>
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
            </Box>
            <Box
                gap="lg"
                margin={0}
                flexDirection="column"
                className={css.container}
            >
                <JourneysTable
                    columns={visibleColumns}
                    data={tableRows || []}
                    onEditColumns={() => setIsMetricsEditModalOpen(true)}
                    onAddCustomFlow={handleAddCustomFlow}
                    showAddCustomFlow={!!isAiJourneyCustomFlowEnabled}
                    isLoading={isLoadingJourneys}
                    integrationId={integrationId}
                    initialSorting={[{ id: 'updated_datetime', desc: true }]}
                />
                {showCustomFlowEmptyState && (
                    <Text>
                        No custom flows yet. Add one to connect Klaviyo
                        webhooks.
                    </Text>
                )}
                {hasMultipleCustomPages && (
                    <nav aria-label="pagination">
                        <Pagination
                            hasNextPage={currentPage < totalCustomPages}
                            hasPreviousPage={currentPage > 1}
                            hasLinesPerPage={false}
                            onPageChange={(direction) => {
                                const nextPage =
                                    direction === 'next'
                                        ? currentPage + 1
                                        : currentPage - 1
                                setPageParam(String(nextPage))
                            }}
                        />
                    </nav>
                )}
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
