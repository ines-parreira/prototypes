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
    useTable,
} from '@gorgias/axiom'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDownloadSupportAgentChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData'
import type { SupportAgentChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'
import { useSupportAgentChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'

import { DownloadTableButton } from './DownloadTableButton'

import css from './PerformanceBreakdownTable.less'

const hasNonZeroMetrics = (data: SupportAgentChannelMetrics[]): boolean => {
    return data.some(
        (row) =>
            (row.handoverInteractions !== null &&
                row.handoverInteractions !== 0) ||
            (row.snoozedInteractions !== null && row.snoozedInteractions !== 0),
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

const PLACEHOLDER_DATA: SupportAgentChannelMetrics[] = [
    {
        channel: 'email',
        handoverInteractions: null,
        snoozedInteractions: null,
    },
    {
        channel: 'chat',
        handoverInteractions: null,
        snoozedInteractions: null,
    },
]

export const SupportAgentChannelPerformanceBreakdownTable = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data, loadingStates } = useSupportAgentChannelPerformanceMetrics(
        statsFilters,
        userTimezone,
    )
    const downloadData = useDownloadSupportAgentChannelPerformanceData()

    const allLoadingComplete = !Object.values(loadingStates).some(
        (state) => state === true,
    )

    const tableData: SupportAgentChannelMetrics[] = useMemo(() => {
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
    const columns: ColumnDef<SupportAgentChannelMetrics>[] = useMemo(
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
                            <Tooltip
                                delay={0}
                                trigger={<Icon name="info" size="xs" />}
                            >
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
                            <Tooltip
                                delay={0}
                                trigger={<Icon name="info" size="xs" />}
                            >
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
                    tableName="support-agent-channel-performance"
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
                            <Text size="md" color="content-neutral-secondary">
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
