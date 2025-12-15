import { useState } from 'react'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    HeaderRowGroup,
    Heading,
    Icon,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    Text,
    useTable,
} from '@gorgias/axiom'

import css from './PerformanceBreakdownTable.less'

type PerformanceData = {
    engagementFeature: string
    automatedInteractions: number
    successRate: string
    ordersInfluenced: number
    conversionRate: string
    totalSales: string
    costPerInteraction: string
}

const TABLE_DATA: PerformanceData[] = [
    {
        engagementFeature: 'Trigger on search',
        automatedInteractions: 1659,
        successRate: '25%',
        ordersInfluenced: 150,
        conversionRate: '25%',
        totalSales: '$1,203',
        costPerInteraction: '$10',
    },
    {
        engagementFeature: 'Suggested product questions',
        automatedInteractions: 1998,
        successRate: '60%',
        ordersInfluenced: 10,
        conversionRate: '60%',
        totalSales: '$993',
        costPerInteraction: '$12',
    },
    {
        engagementFeature: 'Ask anything input',
        automatedInteractions: 1499,
        successRate: '25%',
        ordersInfluenced: 123,
        conversionRate: '25%',
        totalSales: '$299',
        costPerInteraction: '$6',
    },
    {
        engagementFeature: 'Chat interaction',
        automatedInteractions: 1989,
        successRate: '67%',
        ordersInfluenced: 420,
        conversionRate: '48%',
        totalSales: '$1,902',
        costPerInteraction: '$3',
    },
    {
        engagementFeature: 'Email interaction',
        automatedInteractions: 1767,
        successRate: '74%',
        ordersInfluenced: 893,
        conversionRate: '34%',
        totalSales: '$2,989',
        costPerInteraction: '$1',
    },
]

const PerformanceTab = {
    engagementFeature: 'Engagement feature',
    channel: 'Channel',
    intent: 'Intent',
    topProductRecommended: 'Top products recommended',
}

export const ShoppingAssistantPerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<string>('engagement-features')

    const columns: ColumnDef<PerformanceData>[] = [
        {
            accessorKey: 'engagementFeature',
            header: () => (
                <Text size="sm" variant="bold" className={css.featureName}>
                    Engagement feature
                </Text>
            ),
            cell: (info) => (
                <Text size="md" variant="bold" className={css.featureName}>
                    {info.getValue() as string}
                </Text>
            ),
            enableHiding: false,
        },
        {
            accessorKey: 'automatedInteractions',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Automated interactions</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'successRate',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Success rate</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            cell: (info) => (info.getValue() as number).toLocaleString(),
            enableHiding: true,
        },
        {
            accessorKey: 'ordersInfluenced',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Orders influenced</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'conversionRate',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Conversion rate</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'totaleSales',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Total sales</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'costPerInteraction',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Cost per interaction</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
    ]

    const table = useTable({
        data: TABLE_DATA,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
    })

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
            <ButtonGroup
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
            >
                <ButtonGroupItem id="engagement-features">
                    {PerformanceTab.engagementFeature}
                </ButtonGroupItem>
                <ButtonGroupItem id="channel">
                    {PerformanceTab.channel}
                </ButtonGroupItem>
                <ButtonGroupItem id="intent">
                    {PerformanceTab.intent}
                </ButtonGroupItem>
                <ButtonGroupItem id="top-products-recommended">
                    {PerformanceTab.topProductRecommended}
                </ButtonGroupItem>
            </ButtonGroup>
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
        </Box>
    )
}
