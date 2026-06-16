import { useCallback, useMemo, useState } from 'react'

import { useHistory } from 'react-router-dom'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import type { Row } from '@gorgias/axiom'
import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    flexRender,
    TableV1Cell as TableCell,
    TableV1Header as TableHeader,
    TableV1Row as TableRow,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Pagination,
    TableV1Root,
    TableV1Toolbar,
    Text,
    TextField,
    useTableV1,
} from '@gorgias/axiom'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
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
    const history = useHistory()
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId || 0
    const shopName = storeConfiguration?.storeName || ''
    const { routes } = useAiAgentNavigation({ shopName })

    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const shopIntegrationId = storeIntegration?.id

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const isSuccessRateEnabled = useFlag(
        FeatureFlagKey.IntentBasedKnowledgeMilestone3NewReportingLayer,
    )

    const { articles, isLoading, isMetricsLoading, metricsDateRange } =
        useSkillsArticles(helpCenterId, shopIntegrationId || 0, {
            includeSuccessRate: isSuccessRateEnabled,
        })

    const { totalCount: totalAiAgentTickets } = useTotalAiAgentTickets()

    const shopType = storeConfiguration?.shopType || ''
    const { guidanceActions } = useGetGuidancesAvailableActions(
        shopName,
        shopType,
    )

    const [searchTerm, setSearchTerm] = useState('')
    const [statsDisplayModeState, setStatsDisplayMode] =
        useState<StatsDisplayMode>('percentage')
    const statsDisplayMode: StatsDisplayMode = isSuccessRateEnabled
        ? 'numeric'
        : statsDisplayModeState

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
                availableActions: guidanceActions,
                isNewReportingLayerEnabled: isSuccessRateEnabled,
            }),
        [
            statsDisplayMode,
            metricsDateRange,
            isMetricsLoading,
            shopIntegrationId,
            outcomeCustomFieldId,
            intentCustomFieldId,
            totalAiAgentTickets,
            guidanceActions,
            isSuccessRateEnabled,
        ],
    )

    const handleRowClick = useCallback(
        (row: Row<TransformedArticle>) => {
            history.push(routes.skillDetail(row.original.id))
        },
        [history, routes],
    )

    const renderRows = (rows: Row<TransformedArticle>[]) => {
        return rows.map((row) => (
            <TableRow
                key={row.id}
                onClick={() => handleRowClick(row)}
                className={css.clickableRow}
            >
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

    const table = useTableV1<TransformedArticle>({
        data: filteredArticles,
        columns,
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 20,
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
                        leadingSlot="magnifying-glass"
                    />
                </Box>

                {!isSuccessRateEnabled && (
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
                )}
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

            <div className={css.tableRoot}>
                <TableV1Root>
                    <TableHeader>
                        <TableV1HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>
                    <TableV1BodyContent
                        isLoading={isLoading}
                        rows={table.getRowModel().rows}
                        columnCount={table.getAllColumns().length}
                        table={table}
                        renderRows={renderRows}
                    />
                </TableV1Root>
            </div>

            {table.getPageCount() > 1 && (
                <div className={css.pagination}>
                    <TableV1Toolbar<TransformedArticle>
                        table={table}
                        bottomRow={{
                            right: [
                                {
                                    key: 'pagination',
                                    content: (
                                        <TableV1Pagination
                                            table={table}
                                            pageSizeOptions={[20, 50, 100]}
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
