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
    intentL1: string
    intentL2: string
    interactionsShare: string
    automatedInteractions: number
    handoverInteractions: number
    snoozedInteractions: number
    successRate: string
}

const TABLE_DATA: PerformanceData[] = [
    {
        intentL1: 'Order',
        intentL2: 'Status',
        interactionsShare: '10%',
        automatedInteractions: 600,
        handoverInteractions: 100,
        snoozedInteractions: 10,
        successRate: '25%',
    },
    {
        intentL1: 'Product',
        intentL2: 'Details',
        interactionsShare: '2%',
        automatedInteractions: 450,
        handoverInteractions: 30,
        snoozedInteractions: 3,
        successRate: '60%',
    },
    {
        intentL1: 'Product',
        intentL2: 'Issues',
        interactionsShare: '10%',
        automatedInteractions: 299,
        handoverInteractions: 10,
        snoozedInteractions: 10,
        successRate: '20%',
    },
    {
        intentL1: 'Return',
        intentL2: 'Status',
        interactionsShare: '5%',
        automatedInteractions: 150,
        handoverInteractions: 5,
        snoozedInteractions: 2,
        successRate: '10%',
    },
    {
        intentL1: 'Shipping',
        intentL2: 'Information',
        interactionsShare: '1%',
        automatedInteractions: 100,
        handoverInteractions: 3,
        snoozedInteractions: 4,
        successRate: '5%',
    },
    {
        intentL1: 'Warranty',
        intentL2: 'Claim',
        interactionsShare: '4%',
        automatedInteractions: 40,
        handoverInteractions: 2,
        snoozedInteractions: 1,
        successRate: '2%',
    },
]

const PerformanceTab = {
    channel: 'Channel',
    intent: 'Intent',
    skill: 'Skill',
}

export const AllAgentsPerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<string>('channel')

    const columns: ColumnDef<PerformanceData>[] = [
        {
            accessorKey: 'intentL1',
            header: () => (
                <Text size="sm" variant="bold" className={css.featureName}>
                    Intent L1
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
            accessorKey: 'intentL2',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Intent L2</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'interactionsShare',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>AI Agent interactions share</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            cell: (info) => (info.getValue() as number).toLocaleString(),
            enableHiding: true,
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
            accessorKey: 'handoverInteractions',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Handover interactions</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'snoozedInteractions',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Snoozed interactions</span>
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
                <ButtonGroupItem id="channel">
                    {PerformanceTab.channel}
                </ButtonGroupItem>
                <ButtonGroupItem id="intent">
                    {PerformanceTab.intent}
                </ButtonGroupItem>
                <ButtonGroupItem id="skill">
                    {PerformanceTab.skill}
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
