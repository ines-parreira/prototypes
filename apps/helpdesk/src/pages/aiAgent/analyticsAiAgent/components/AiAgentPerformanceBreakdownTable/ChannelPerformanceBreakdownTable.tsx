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
import type { ChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'
import { useChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'

import { DownloadTableButton } from './DownloadTableButton'

import css from './PerformanceBreakdownTable.less'

const hasNonZeroMetrics = (data: ChannelMetrics[]): boolean => {
    return data.some(
        (row) =>
            (row.handoverInteractions !== null &&
                row.handoverInteractions !== 0) ||
            (row.snoozedInteractions !== null &&
                row.snoozedInteractions !== 0) ||
            (row.totalSales !== null && row.totalSales !== 0) ||
            (row.automationRate !== null && row.automationRate !== 0),
    )
}

const formatChannelName = (channel: string): string => {
    const channelNames: Record<string, string> = {
        email: 'Email',
        chat: 'Chat',
        sms: 'SMS',
        'contact-form': 'Contact Form',
        contact_form: 'Contact Form',
        'help-center': 'Help Center',
        voice: 'Voice',
    }
    return channelNames[channel] || channel
}

const PLACEHOLDER_DATA: ChannelMetrics[] = [
    {
        channel: 'email',
        handoverInteractions: null,
        snoozedInteractions: null,
        totalSales: null,
        automationRate: null,
    },
    {
        channel: 'chat',
        handoverInteractions: null,
        snoozedInteractions: null,
        totalSales: null,
        automationRate: null,
    },
]

export const ChannelPerformanceBreakdownTable = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data, loadingStates } = useChannelPerformanceMetrics(
        statsFilters,
        userTimezone,
    )
    const downloadData = useDownloadChannelPerformanceData()

    const allLoadingComplete = !Object.values(loadingStates).some(
        (state) => state === true,
    )

    const tableData: ChannelMetrics[] = useMemo(() => {
        if (data.length > 0 && hasNonZeroMetrics(data)) {
            return data
        }
        if (allLoadingComplete) {
            return []
        }
        return PLACEHOLDER_DATA
    }, [data, allLoadingComplete])

    // Keep columns stable to prevent Skeleton animation resets
    // loadingStates is intentionally omitted from deps to avoid recreating columns
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columns: ColumnDef<ChannelMetrics>[] = useMemo(
        () => [
            {
                accessorKey: 'channel',
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
                                Channel
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
                meta: { displayName: 'Channel' },
                cell: (info) => (
                    <Text size="md" variant="bold" className={css.featureName}>
                        {formatChannelName(info.getValue() as string)}
                    </Text>
                ),
                enableHiding: false,
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
                    const channel = info.row.original.channel
                    if (loadingStates.handoverInteractions && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-handoverInteractions`}
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
                    const channel = info.row.original.channel
                    if (loadingStates.snoozedInteractions && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-snoozedInteractions`}
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
                accessorKey: 'totalSales',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Total sales</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Total sales"
                                    caption="The revenue influenced by a Shopping Assistant interaction, measured from orders placed within 3 days of the interaction."
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
                meta: { displayName: 'Total sales' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.totalSales && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-totalSales`}
                                width="80px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'currency', 'USD', true)
                },
                enableHiding: true,
            },
            {
                accessorKey: 'automationRate',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>% automated by Shopping assistant</span>
                            <Tooltip delay={0}>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="% automated by Shopping assistant"
                                    caption="The percentage of AI Agent automated interactions handled by the Shopping Assistant."
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
                meta: { displayName: '% automated by Shopping assistant' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.automationRate && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-automationRate`}
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
                    tableName="ai-agent-channel-performance"
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
