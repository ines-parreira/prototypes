import { useMemo } from 'react'

import {
    Box,
    DataTable,
    DataTablePagination,
    DataTableSearch,
    Heading,
    Icon,
    Panel,
    PanelHeader,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { PaginationState } from '@gorgias/axiom'

import { useStatCurrentDate } from 'domains/reporting/pages/common/components/useStatCurrentDate'
import { LiveAgentMetricsProvider } from 'domains/reporting/pages/live/agents/dataTable/LiveAgentMetricsContext'
import { getLiveAgentsColumns } from 'domains/reporting/pages/live/agents/dataTable/LiveAgentsTableColumns'
import StatsFiltersContext from 'domains/reporting/pages/StatsFiltersContext'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import { AccountFeature } from 'state/currentAccount/types'

import {
    LIVE_AGENTS_DEFAULT_PAGE_SIZE,
    LIVE_AGENTS_DEFAULT_SORTING,
    useLiveAgentsTableData,
} from './hooks/useLiveAgentsTableData'

// Stable reference: the DataTable owns the page index internally; a fresh
// object each render would reset it back to page 0.
const DEFAULT_PAGINATION: PaginationState = {
    pageIndex: 0,
    pageSize: LIVE_AGENTS_DEFAULT_PAGE_SIZE,
}

function LiveAgentsDataTable() {
    const {
        rows,
        metricsByUserId,
        metricAxes,
        pageStatsFilters,
        isAgentAvailabilityEnabled,
        isLoading,
        areMetricsLoading,
        onSortingChange,
        onSearchChange,
    } = useLiveAgentsTableData()

    const { dateLabel, businessHoursLabel } = useStatCurrentDate()

    const columns = useMemo(
        () =>
            getLiveAgentsColumns({
                metricAxes,
                isAgentAvailabilityEnabled,
            }),
        [metricAxes, isAgentAvailabilityEnabled],
    )

    const metrics = useMemo(
        () => ({ byUserId: metricsByUserId, isLoading: areMetricsLoading }),
        [metricsByUserId, areMetricsLoading],
    )

    return (
        <StatsFiltersContext.Provider value={pageStatsFilters}>
            <LiveAgentMetricsProvider value={metrics}>
                <Panel h="100%" w="100%" overflow="auto">
                    <PanelHeader
                        title={
                            <Box
                                flexDirection="row"
                                alignItems="center"
                                gap="xs"
                            >
                                <Heading size="xl">Live agents</Heading>
                                <Tooltip
                                    trigger={
                                        <Icon
                                            name="info"
                                            size="sm"
                                            aria-label="About Live agents"
                                        />
                                    }
                                >
                                    <TooltipContent title="The work agents have accomplished over the day." />
                                </Tooltip>
                            </Box>
                        }
                        caption={[dateLabel, businessHoursLabel]
                            .filter(Boolean)
                            .join(' · ')}
                    />
                    <DataTable
                        data={rows}
                        columns={columns}
                        isLoading={isLoading}
                        // Semi-controlled (onChange, no `value`) so persisted
                        // sorting/search rehydrate from the URL on reload — a
                        // controlled `value` would override the restored
                        // default. The hook mirrors the value via onChange for
                        // its manual sort / search.
                        sorting={{
                            enable: true,
                            manual: true,
                            defaultValue: LIVE_AGENTS_DEFAULT_SORTING,
                            onChange: onSortingChange,
                        }}
                        search={{
                            enable: true,
                            manual: true,
                            onChange: onSearchChange,
                        }}
                        pagination={{
                            enable: true,
                            defaultValue: DEFAULT_PAGINATION,
                        }}
                        persistence={{
                            enable: true,
                            id: 'live-agents-data-table',
                        }}
                    >
                        <DataTableSearch placeholder="Search agents…" />
                        <DataTablePagination />
                    </DataTable>
                </Panel>
            </LiveAgentMetricsProvider>
        </StatsFiltersContext.Provider>
    )
}

export default withFeaturePaywall(AccountFeature.UsersLiveStatistics)(
    LiveAgentsDataTable,
)
