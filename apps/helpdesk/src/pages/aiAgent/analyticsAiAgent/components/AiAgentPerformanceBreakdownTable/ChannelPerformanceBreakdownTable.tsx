import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    HeaderRowGroup,
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

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { ChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'
import { useChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'

import css from './PerformanceBreakdownTable.less'

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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, loadingStates } = useChannelPerformanceMetrics(
        cleanStatsFilters,
        userTimezone,
    )

    const tableData: ChannelMetrics[] = useMemo(
        () => (data.length > 0 ? data : PLACEHOLDER_DATA),
        [data],
    )

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
                                            ? 'arrow-up'
                                            : 'arrow-down'
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
                            <Tooltip>
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
                                            ? 'arrow-up'
                                            : 'arrow-down'
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
                    return formatMetricValue(value, 'decimal')
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
                            <Tooltip>
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
                                            ? 'arrow-up'
                                            : 'arrow-down'
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
                    return formatMetricValue(value, 'decimal')
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
                            <Tooltip>
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
                                            ? 'arrow-up'
                                            : 'arrow-down'
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
                    return formatMetricValue(value, 'currency')
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
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="% automated by Shopping assistant"
                                    caption="The percentage of AI Agent resolved interactions handled by the Shopping Assistant."
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
                                            ? 'arrow-up'
                                            : 'arrow-down'
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
                    return formatMetricValue(value, 'percent-precision-1')
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

    return (
        <Box display="flex" flexDirection="column" minWidth="0px">
            <TableToolbar
                table={table}
                bottomRow={{
                    left: ['totalCount'],
                    right: ['settings'],
                }}
            />
            <Box className={css.tableWrapper}>
                <TableRoot withBorder className={css.table}>
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
                </TableRoot>
            </Box>
        </Box>
    )
}
