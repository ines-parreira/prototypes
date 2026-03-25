import { useMemo, useState } from 'react'

import type { Row } from '@gorgias/axiom'
import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    flexRender,
    HeaderRowGroup,
    Heading,
    OverlayContent,
    OverlayHeader,
    SearchField,
    SidePanel,
    TableBodyContent,
    TableV1Cell as TableCell,
    TableV1Header as TableHeader,
    TableRoot,
    TableV1Row as TableRow,
    Text,
    useTable,
} from '@gorgias/axiom'

import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { getColumns } from './columns'
import type { StatsDisplayMode } from './columns'
import type { TransformedIntent } from './useIntentsTable'
import { useIntentsTable } from './useIntentsTable'

import css from './IntentsTable.less'

interface IntentsTableProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export const IntentsTable = ({ isOpen, onOpenChange }: IntentsTableProps) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId || 0

    const { intents, isLoading } = useIntentsTable(helpCenterId)

    const [searchTerm, setSearchTerm] = useState('')
    const [statsDisplayMode, setStatsDisplayMode] =
        useState<StatsDisplayMode>('percentage')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const filteredIntents = useMemo(() => {
        if (!searchTerm.trim()) return intents

        const lowerSearchTerm = searchTerm.toLowerCase()
        return intents.filter((intent) => {
            const matchesParent = intent.formattedName
                .toLowerCase()
                .includes(lowerSearchTerm)
            const matchesChild = intent.children?.some((child) =>
                child.formattedName.toLowerCase().includes(lowerSearchTerm),
            )
            return matchesParent || matchesChild
        })
    }, [intents, searchTerm])

    const flattenedIntents = useMemo(() => {
        const flattened: TransformedIntent[] = []
        filteredIntents.forEach((intent) => {
            flattened.push(intent)
            if (expandedRows.has(intent.id) && intent.children) {
                flattened.push(...intent.children)
            }
        })
        return flattened
    }, [filteredIntents, expandedRows])

    const totalCount = intents.length
    const filteredCount = filteredIntents.length

    const handleToggleExpanded = (rowId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev)
            if (next.has(rowId)) {
                next.delete(rowId)
            } else {
                next.add(rowId)
            }
            return next
        })
    }

    const handleToggleEnabled = (intentId: string, enabled: boolean) => {
        // eslint-disable-next-line no-console
        console.log('Toggle enabled:', intentId, enabled)
    }

    const handleLinkToSkill = (intentId: string) => {
        // eslint-disable-next-line no-console
        console.log('Link to skill:', intentId)
    }

    const columns = useMemo(
        () =>
            getColumns({
                statsDisplayMode,
                isMetricsLoading: false,
                onToggleEnabled: handleToggleEnabled,
                onLinkToSkill: handleLinkToSkill,
                expandedRows,
                onToggleExpanded: handleToggleExpanded,
            }),
        [statsDisplayMode, expandedRows],
    )

    const renderRows = (rows: Row<TransformedIntent>[]) => {
        return rows.map((row) => {
            const isChildRow = !!row.original.parentId
            return (
                <TableRow key={row.id} data-child-row={isChildRow}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                            )}
                        </TableCell>
                    ))}
                </TableRow>
            )
        })
    }

    const table = useTable<TransformedIntent>({
        data: flattenedIntents,
        columns,
        sortingConfig: {
            enableSorting: true,
            manualSorting: false,
            enableSortingRemoval: true,
        },
    })

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <OverlayHeader
                title={<Heading size="lg">Intents</Heading>}
                description={
                    <Text size="md" color="var(--content-neutral-secondary)">
                        Link intents to skills. Once linked, AI Agent will
                        follow the skill&apos;s instructions every time it
                        detects a matching conversation.
                    </Text>
                }
            />
            <OverlayContent>
                <Box flexDirection="column" className={css.container}>
                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb="xxxs"
                    >
                        <Box width="220px">
                            <SearchField
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </Box>

                        <ButtonGroup
                            defaultSelectedKey="percentage"
                            onSelectionChange={(id) =>
                                setStatsDisplayMode(id as StatsDisplayMode)
                            }
                        >
                            <ButtonGroupItem icon="percent" id="percentage">
                                Percentage
                            </ButtonGroupItem>
                            <ButtonGroupItem icon="hashtag" id="numeric">
                                Numeric
                            </ButtonGroupItem>
                        </ButtonGroup>
                    </Box>

                    <Box
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mt="xs"
                        mb="24px"
                    >
                        <Text
                            size="sm"
                            variant="medium"
                            color="content-neutral-tertiary"
                        >
                            Showing {filteredCount} of {totalCount} items
                        </Text>
                        <Text
                            size="sm"
                            variant="medium"
                            color="content-neutral-tertiary"
                        >
                            Metrics from last 28 days
                        </Text>
                    </Box>

                    <div
                        className={
                            expandedRows.size > 0
                                ? css.tableWithExpandedRows
                                : css.tableWithoutExpandedRows
                        }
                    >
                        <TableRoot withBorder>
                            <TableHeader>
                                <HeaderRowGroup
                                    headerGroups={table.getHeaderGroups()}
                                />
                            </TableHeader>
                            <TableBodyContent
                                isLoading={isLoading}
                                rows={table.getRowModel().rows}
                                columnCount={table.getAllColumns().length}
                                table={table}
                                renderRows={renderRows}
                            />
                        </TableRoot>
                    </div>
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}
