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
    feature: string
    automationRate: string
    automatedInteractions: number
    handedOver: string
    costSaved: string
    timeSavedPerAgent: string
    decreaseInResolutionTime: string
}

const TABLE_DATA: PerformanceData[] = [
    {
        feature: 'AI Agent',
        automationRate: '18%',
        automatedInteractions: 2700,
        handedOver: '7%',
        costSaved: '$1,200',
        timeSavedPerAgent: '2h 45m',
        decreaseInResolutionTime: '20%',
    },
    {
        feature: 'Article Recommendation',
        automationRate: '4%',
        automatedInteractions: 450,
        handedOver: '5%',
        costSaved: '$450',
        timeSavedPerAgent: '1h 00m',
        decreaseInResolutionTime: '2%',
    },
    {
        feature: 'Flows',
        automationRate: '7%',
        automatedInteractions: 900,
        handedOver: '4%',
        costSaved: '$500',
        timeSavedPerAgent: '1h 15m',
        decreaseInResolutionTime: '4%',
    },
    {
        feature: 'Order Management',
        automationRate: '3%',
        automatedInteractions: 350,
        handedOver: '2%',
        costSaved: '$250',
        timeSavedPerAgent: '0h 30m',
        decreaseInResolutionTime: '2%',
    },
]

export const PerformanceBreakdownTable = () => {
    const [activeTab, setActiveTab] = useState<string>('all-features')

    const columns: ColumnDef<PerformanceData>[] = [
        {
            accessorKey: 'feature',
            header: () => (
                <Text size="sm" variant="bold" className={css.featureName}>
                    Feature
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
            accessorKey: 'automationRate',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Overall automation rate</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
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
            cell: (info) => (info.getValue() as number).toLocaleString(),
            enableHiding: true,
        },
        {
            accessorKey: 'handedOver',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Handed over</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'costSaved',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Cost saved</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'timeSavedPerAgent',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Time saved per agent</span>
                    <Icon name="info" size="xs" />
                </Box>
            ),
            enableHiding: true,
        },
        {
            accessorKey: 'decreaseInResolutionTime',
            header: () => (
                <Box className={css.headerWithIcon}>
                    <span>Decrease in resolution time</span>
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
        <Box flexDirection="column" gap="xxxs">
            <Box className={css.header}>
                <Heading size="sm" className={css.title}>
                    Performance breakdown
                </Heading>
            </Box>
            <ButtonGroup
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
            >
                <ButtonGroupItem id="all-features">
                    All features
                </ButtonGroupItem>
                <ButtonGroupItem id="article-recommendation">
                    Article Recommendation
                </ButtonGroupItem>
                <ButtonGroupItem id="flows">Flows</ButtonGroupItem>
                <ButtonGroupItem id="order-management">
                    Order Management
                </ButtonGroupItem>
            </ButtonGroup>
            <Box flexDirection="column">
                <TableToolbar
                    table={table}
                    bottomRow={{
                        left: ['totalCount'],
                        right: ['settings'],
                    }}
                />
                <TableRoot withBorder>
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
