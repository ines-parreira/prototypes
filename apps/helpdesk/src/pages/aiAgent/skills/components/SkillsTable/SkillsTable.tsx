import { useMemo, useState } from 'react'

import type { Row } from '@gorgias/axiom'
import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    flexRender,
    HeaderRowGroup,
    TableBodyContent,
    TableV1Cell as TableCell,
    TableV1Header as TableHeader,
    TablePagination,
    TableRoot,
    TableV1Row as TableRow,
    TableToolbar,
    Text,
    TextField,
    useTable,
} from '@gorgias/axiom'

import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'

import { useSkillsArticles } from '../../hooks/useSkillsArticles'
import { useTotalAiAgentTickets } from '../../hooks/useTotalAiAgentTickets'
import type { TransformedArticle } from '../../types'
import { getColumns } from './columns'
import type { StatsDisplayMode } from './columns'

import css from './SkillsTable.less'

export const SkillsTable = () => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId || 0
    const shopName = storeConfiguration?.storeName || ''

    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const shopIntegrationId = storeIntegration?.id

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const { articles, isLoading, isMetricsLoading, metricsDateRange } =
        useSkillsArticles(helpCenterId, shopIntegrationId || 0)

    const { totalCount: totalAiAgentTickets } = useTotalAiAgentTickets()

    const [searchTerm, setSearchTerm] = useState('')
    const [statsDisplayMode, setStatsDisplayMode] =
        useState<StatsDisplayMode>('percentage')

    const filteredArticles = useMemo(() => {
        if (!searchTerm.trim()) return articles

        const lowerSearchTerm = searchTerm.toLowerCase()
        return articles.filter((article) =>
            article.title.toLowerCase().includes(lowerSearchTerm),
        )
    }, [articles, searchTerm])

    const columns = useMemo(
        () =>
            getColumns({
                statsDisplayMode,
                metricsDateRange,
                isMetricsLoading,
                shopIntegrationId,
                outcomeCustomFieldId,
                intentCustomFieldId,
                totalAiAgentTickets,
            }),
        [
            statsDisplayMode,
            metricsDateRange,
            isMetricsLoading,
            shopIntegrationId,
            outcomeCustomFieldId,
            intentCustomFieldId,
            totalAiAgentTickets,
        ],
    )

    const renderRows = (rows: Row<TransformedArticle>[]) => {
        return rows.map((row) => (
            <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ))
    }

    const table = useTable<TransformedArticle>({
        data: filteredArticles,
        columns,
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 10,
            initialPageIndex: 0,
        },
        sortingConfig: {
            enableSorting: true,
            manualSorting: false,
            enableSortingRemoval: true,
        },
    })

    return (
        <Box flexDirection="column" className={css.container}>
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mb="xxxs"
            >
                <Box width="220px">
                    <TextField
                        placeholder="Search ..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        leadingSlot="search-magnifying-glass"
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
                    Showing {filteredArticles.length} of {articles.length}{' '}
                    skills
                </Text>
                <Text
                    size="sm"
                    variant="medium"
                    color="content-neutral-tertiary"
                >
                    Metrics from last 28 days
                </Text>
            </Box>

            <TableRoot withBorder>
                <TableHeader>
                    <HeaderRowGroup headerGroups={table.getHeaderGroups()} />
                </TableHeader>
                <TableBodyContent
                    isLoading={isLoading}
                    rows={table.getRowModel().rows}
                    columnCount={table.getAllColumns().length}
                    table={table}
                    renderRows={renderRows}
                />
            </TableRoot>

            {table.getPageCount() > 1 && (
                <div className={css.pagination}>
                    <TableToolbar<TransformedArticle>
                        table={table}
                        bottomRow={{
                            right: [
                                {
                                    key: 'pagination',
                                    content: (
                                        <TablePagination
                                            table={table}
                                            pageSizeOptions={[10, 25, 50]}
                                        />
                                    ),
                                },
                            ],
                        }}
                    />
                </div>
            )}
        </Box>
    )
}
