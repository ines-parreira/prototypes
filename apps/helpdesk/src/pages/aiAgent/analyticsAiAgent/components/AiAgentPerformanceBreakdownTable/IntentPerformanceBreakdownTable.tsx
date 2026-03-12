import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

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

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import type { IntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'
import { useIntentPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'

import { DownloadTableButton } from './DownloadTableButton'

import css from './PerformanceBreakdownTable.less'

const hasNonZeroMetrics = (data: IntentMetrics[]): boolean => {
    return data.some(
        (row) =>
            (row.handoverInteractions !== null &&
                row.handoverInteractions !== 0) ||
            (row.snoozedInteractions !== null &&
                row.snoozedInteractions !== 0) ||
            (row.successRate !== null && row.successRate !== 0) ||
            (row.costSaved !== null && row.costSaved !== 0),
    )
}

const PLACEHOLDER_DATA: IntentMetrics[] = [
    {
        intentL1: 'Order',
        intentL2: 'Status',
        handoverInteractions: null,
        snoozedInteractions: null,
        successRate: null,
        costSaved: null,
    },
    {
        intentL1: 'Return',
        intentL2: 'Status',
        handoverInteractions: null,
        snoozedInteractions: null,
        successRate: null,
        costSaved: null,
    },
]

export const IntentPerformanceBreakdownTable = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data, loadingStates } = useIntentPerformanceMetrics(
        statsFilters,
        userTimezone,
    )
    const downloadData = useDownloadIntentPerformanceData()

    const allLoadingComplete = !Object.values(loadingStates).some(
        (state) => state === true,
    )

    const tableData: IntentMetrics[] = useMemo(() => {
        if (data.length > 0 && hasNonZeroMetrics(data)) {
            return data
        }
        if (allLoadingComplete) {
            return []
        }
        return PLACEHOLDER_DATA
    }, [data, allLoadingComplete])

    const columns: ColumnDef<IntentMetrics>[] = useMemo(
        () => [
            {
                accessorKey: 'intentL1',
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
                                Intent L1
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
                meta: { displayName: 'Intent L1' },
                cell: (info) => (
                    <Text size="md" variant="bold" className={css.featureName}>
                        {info.getValue() as string}
                    </Text>
                ),
                enableHiding: false,
            },
            {
                accessorKey: 'intentL2',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box display="flex" alignItems="center" gap="xxxs">
                            <Text size="sm" variant="bold">
                                Intent L2
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
                meta: { displayName: 'Intent L2' },
                cell: (info) => (
                    <Text size="md">{info.getValue() as string}</Text>
                ),
                enableHiding: true,
            },
            {
                accessorKey: 'handoverInteractions',
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
                    const intentL1 = info.row.original.intentL1
                    const intentL2 = info.row.original.intentL2
                    if (loadingStates.handoverInteractions && value === null) {
                        return (
                            <Skeleton
                                key={`${intentL1}-${intentL2}-handoverInteractions`}
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
                accessorKey: 'snoozedInteractions',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Snoozed interactions</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Snoozed interactions"
                                    caption="Total number of interactions where AI Agent has asked the customer a question and is waiting for their reply, temporarily pausing the ticket for a channel-dependent delay (24h for email, 10min for chat) before it closes and triggers the billing workflow."
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
                meta: { displayName: 'Snoozed interactions' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const intentL1 = info.row.original.intentL1
                    const intentL2 = info.row.original.intentL2
                    if (loadingStates.snoozedInteractions && value === null) {
                        return (
                            <Skeleton
                                key={`${intentL1}-${intentL2}-snoozedInteractions`}
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
                accessorKey: 'successRate',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Success rate</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Success rate"
                                    caption="The percentage of interactions handled by the AI Agent that are fully resolved without any human escalation."
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
                meta: { displayName: 'Success rate' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const intentL1 = info.row.original.intentL1
                    const intentL2 = info.row.original.intentL2
                    if (loadingStates.successRate && value === null) {
                        return (
                            <Skeleton
                                key={`${intentL1}-${intentL2}-successRate`}
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
                    const intentL1 = info.row.original.intentL1
                    const intentL2 = info.row.original.intentL2
                    if (loadingStates.costSaved && value === null) {
                        return (
                            <Skeleton
                                key={`${intentL1}-${intentL2}-costSaved`}
                                width="80px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'currency', 'USD', true)
                },
                enableHiding: true,
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [Object.values(loadingStates).find((value) => value === true)],
    )

    const table = useTable({
        data: tableData,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
            initialSorting: [{ id: 'intentL1', desc: true }],
        },
    })

    const showEmptyState =
        allLoadingComplete && (data.length === 0 || !hasNonZeroMetrics(data))

    return (
        <Box display="flex" flexDirection="column" width="100%" minWidth="0px">
            <Box display="flex" justifyContent="flex-end">
                <DownloadTableButton
                    files={downloadData.files}
                    fileName={downloadData.fileName}
                    isLoading={downloadData.isLoading}
                    tableName="ai-agent-intent-performance"
                />
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
    )
}
