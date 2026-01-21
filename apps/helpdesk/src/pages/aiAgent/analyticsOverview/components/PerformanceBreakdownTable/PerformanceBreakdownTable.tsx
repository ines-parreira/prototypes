import { useMemo } from 'react'

import { formatMetricValue, NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    HeaderRowGroup,
    Heading,
    Icon,
    Skeleton,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    useTable,
} from '@gorgias/axiom'

import { usePerformanceMetricsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'
import type { FeatureMetrics } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

import { DownloadPerformanceBreakdownButton } from './DownloadPerformanceBreakdownButton'

import css from './PerformanceBreakdownTable.less'

const PLACEHOLDER_DATA: FeatureMetrics[] = [
    {
        feature: 'AI Agent',
        automationRate: null,
        automatedInteractions: null,
        handoverCount: null,
        costSaved: null,
        timeSaved: null,
    },
    {
        feature: 'Flows',
        automationRate: null,
        automatedInteractions: null,
        handoverCount: null,
        costSaved: null,
        timeSaved: null,
    },
    {
        feature: 'Article Recommendation',
        automationRate: null,
        automatedInteractions: null,
        handoverCount: null,
        costSaved: null,
        timeSaved: null,
    },
    {
        feature: 'Order Management',
        automationRate: null,
        automatedInteractions: null,
        handoverCount: null,
        costSaved: null,
        timeSaved: null,
    },
]

export const PerformanceBreakdownTable = () => {
    const { data: metricsData, loadingStates } =
        usePerformanceMetricsPerFeature()

    const allLoadingComplete = !Object.values(loadingStates).some(
        (state) => state === true,
    )

    const tableData: FeatureMetrics[] = useMemo(() => {
        if (metricsData && metricsData.length > 0) {
            return metricsData
        }
        if (allLoadingComplete) {
            return []
        }
        return PLACEHOLDER_DATA
    }, [metricsData, allLoadingComplete])

    // Keep columns stable to prevent Skeleton animation resets
    // loadingStates is intentionally omitted from deps to avoid recreating columns
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columns: ColumnDef<FeatureMetrics>[] = useMemo(
        () => [
            {
                accessorKey: 'feature',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="xxxs"
                            className={css.featureName}
                        >
                            <Text size="sm" variant="bold">
                                Feature
                            </Text>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Feature' },
                cell: (info) => (
                    <Text size="md" variant="bold" className={css.featureName}>
                        {info.getValue() as string}
                    </Text>
                ),
                enableHiding: false,
            },
            {
                accessorKey: 'automationRate',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Overall automation rate</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Overall automation rate"
                                    caption="The number of interactions automated by all automation features as a % of total customer interactions."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Overall automation rate' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const feature = info.row.original.feature
                    if (loadingStates.automationRate && value === null) {
                        return (
                            <Skeleton
                                key={`${feature}-automationRate`}
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(
                        value,
                        'percent-precision-1',
                        'USD',
                        true,
                    )
                },
                enableHiding: true,
            },
            {
                accessorKey: 'automatedInteractions',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Automated interactions</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Automated interactions"
                                    caption="The number of fully automated interactions solved without any human agent intervention."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Automated interactions' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const feature = info.row.original.feature
                    if (loadingStates.automatedInteractions && value === null) {
                        return (
                            <Skeleton
                                key={`${feature}-automatedInteractions`}
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'decimal', 'USD', true)
                },
                enableHiding: true,
            },
            {
                accessorKey: 'handoverCount',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Handover interactions</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Handover interactions"
                                    caption="The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Handover interactions' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const feature = info.row.original.feature

                    // Article Recommendation and Order Management don't have handovers
                    if (
                        feature === 'Article Recommendation' ||
                        feature === 'Order Management'
                    ) {
                        return '-'
                    }

                    if (loadingStates.handovers && value === null) {
                        return (
                            <Skeleton
                                key={`${feature}-handoverCount`}
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'decimal', 'USD', true)
                },
                enableHiding: true,
            },
            {
                accessorKey: 'costSaved',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Cost saved</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Cost saved"
                                    caption="The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Cost saved' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const feature = info.row.original.feature

                    if (loadingStates.costSaved && value === null) {
                        return (
                            <Skeleton
                                key={`${feature}-costSaved`}
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    if (value !== null && isNaN(value)) {
                        return NOT_AVAILABLE_PLACEHOLDER
                    }
                    return formatMetricValue(
                        value,
                        'currency-precision-1',
                        'USD',
                        true,
                    )
                },
                enableHiding: true,
            },
            {
                accessorKey: 'timeSaved',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Time saved by agents</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Time saved by agents"
                                    caption="The time agent would have spent resolving customer inquiries without all automation features."
                                />
                            </Tooltip>
                            <span
                                style={{
                                    visibility: sortDirection
                                        ? 'visible'
                                        : 'hidden',
                                }}
                            >
                                <Icon
                                    name={
                                        sortDirection === 'asc'
                                            ? 'arrow-down'
                                            : 'arrow-up'
                                    }
                                    size="xs"
                                />
                            </span>
                        </Box>
                    )
                },
                meta: { displayName: 'Time saved by agents' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const feature = info.row.original.feature
                    if (
                        (loadingStates.automatedInteractions ||
                            loadingStates.timeSaved) &&
                        value === null
                    ) {
                        return (
                            <Skeleton
                                key={`${feature}-timeSaved`}
                                width="80px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'duration', 'USD', true)
                },
                enableHiding: true,
            },
        ],
        // oxlint-disable-next-line exhaustive-deps
        [Object.values(loadingStates).find((value) => value === true)],
    )

    const table = useTable({
        data: tableData,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
    })

    const allDataLoaded =
        !loadingStates.automationRate &&
        !loadingStates.automatedInteractions &&
        !loadingStates.handovers &&
        !loadingStates.timeSaved

    const showEmptyState =
        allDataLoaded && (!metricsData || metricsData.length === 0)

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            <Box className={css.header}>
                <Heading size="sm" className={css.title}>
                    Performance breakdown
                </Heading>
            </Box>
            <Box
                className={css.tableContainer}
                display="flex"
                flexDirection="column"
                minWidth="0px"
            >
                <Box display="flex" justifyContent="flex-end">
                    <DownloadPerformanceBreakdownButton />
                </Box>
                <TableToolbar
                    table={table}
                    bottomRow={{
                        left: ['totalCount'],
                        right: ['settings'],
                    }}
                />
                <Box className={css.tableWrapper}>
                    <TableRoot withBorder className={css.table}>
                        {showEmptyState ? (
                            <Box
                                width="100%"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                padding="xxxl"
                                gap="xs"
                            >
                                <Heading size="sm">No data found</Heading>
                                <Text size="md" color="secondary">
                                    Try to adjust your report filters.
                                </Text>
                            </Box>
                        ) : (
                            <>
                                <TableHeader>
                                    <HeaderRowGroup
                                        headerGroups={table.getHeaderGroups()}
                                    />
                                </TableHeader>
                                <TableBodyContent
                                    rows={table.getRowModel().rows}
                                    columnCount={table.getAllColumns().length}
                                    table={table}
                                />
                            </>
                        )}
                    </TableRoot>
                </Box>
            </Box>
        </Box>
    )
}
