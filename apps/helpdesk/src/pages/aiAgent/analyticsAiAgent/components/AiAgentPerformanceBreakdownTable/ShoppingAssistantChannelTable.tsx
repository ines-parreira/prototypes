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
import type { ShoppingAssistantChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics'
import { useShoppingAssistantChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics'

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

const PLACEHOLDER_DATA: ShoppingAssistantChannelMetrics[] = [
    {
        channel: 'email',
        automationRate: null,
        aiAgentInteractionsShare: null,
        automatedInteractions: null,
        handover: null,
        successRate: null,
        totalSales: null,
        ordersInfluenced: null,
        revenuePerInteraction: null,
    },
    {
        channel: 'chat',
        automationRate: null,
        aiAgentInteractionsShare: null,
        automatedInteractions: null,
        handover: null,
        successRate: null,
        totalSales: null,
        ordersInfluenced: null,
        revenuePerInteraction: null,
    },
]

export const ShoppingAssistantChannelTable = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, loadingStates } = useShoppingAssistantChannelMetrics(
        cleanStatsFilters,
        userTimezone,
    )

    const tableData: ShoppingAssistantChannelMetrics[] = useMemo(
        () => (data.length > 0 ? data : PLACEHOLDER_DATA),
        [data],
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columns: ColumnDef<ShoppingAssistantChannelMetrics>[] = useMemo(
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
                accessorKey: 'automationRate',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Automation rate</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Automation rate"
                                    caption="The percentage of conversations that were resolved without a handover to a human agent."
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
                meta: { displayName: 'Automation rate' },
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
            {
                accessorKey: 'aiAgentInteractionsShare',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>AI Agent interactions share</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="AI Agent interactions share"
                                    caption="The percentage of total AI agent automated interactions attributed to a specific segment (such as channel, skill, or intent)."
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
                meta: { displayName: 'AI Agent interactions share' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.automationRate && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-aiAgentInteractionsShare`}
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'percent-precision-1')
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
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Automated interactions"
                                    caption="The number of fully automated interactions by Shopping Assistant solved without any human agent intervention."
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
                meta: { displayName: 'Automated interactions' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.automatedInteractions && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-automatedInteractions`}
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
                accessorKey: 'handover',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Handover</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Handover"
                                    caption="The number of interactions AI Agent transferred to a human because it couldn’t confidently resolve the customer’s request or because the customer explicitly requested to speak with a human agent."
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
                meta: { displayName: 'Handover' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.handover && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-handover`}
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
                accessorKey: 'successRate',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Success rate</span>
                            <Tooltip>
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
                                            ? 'arrow-up'
                                            : 'arrow-down'
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
                    const channel = info.row.original.channel
                    if (loadingStates.automationRate && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-successRate`}
                                width="60px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'percent-precision-1')
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
                                    caption="The total revenue from orders placed within 3 days of a Shopping Assistant interaction without human help."
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
                accessorKey: 'ordersInfluenced',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Orders influenced</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Orders influenced"
                                    caption="The number of orders placed within 3 days of a Shopping Assistant conversation without a direct handover."
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
                meta: { displayName: 'Orders influenced' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.ordersInfluenced && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-ordersInfluenced`}
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
                accessorKey: 'revenuePerInteraction',
                header: (info) => {
                    const sortDirection = info.column.getIsSorted()
                    return (
                        <Box className={css.headerWithIcon}>
                            <span>Revenue per interaction</span>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Icon name="info" size="xs" />
                                </TooltipTrigger>
                                <TooltipContent
                                    title="Revenue per interaction"
                                    caption="The average revenue generated per Shopping Assistant interaction in this channel."
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
                meta: { displayName: 'Revenue per interaction' },
                cell: (info) => {
                    const value = info.getValue() as number | null
                    const channel = info.row.original.channel
                    if (loadingStates.totalSales && value === null) {
                        return (
                            <Skeleton
                                key={`${channel}-revenuePerInteraction`}
                                width="80px"
                                height="20px"
                            />
                        )
                    }
                    return formatMetricValue(value, 'currency')
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
