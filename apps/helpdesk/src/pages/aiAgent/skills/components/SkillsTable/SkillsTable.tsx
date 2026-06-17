import { useMemo, useState } from 'react'

import { useSkillReportingEnabled } from '../../hooks/useSkillReportingEnabled'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    DataTable,
    DataTableHeader,
    DataTableItemCount,
    DataTablePagination,
    Panel,
    Text,
    TextField,
    useDataTable,
} from '@gorgias/axiom'
import type { PaginationState } from '@gorgias/axiom'

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

const DEFAULT_PAGINATION: PaginationState = {
    pageIndex: 0,
    pageSize: 20,
}

// Bounds the panel to the viewport so only the table body scrolls while the
// toolbar and column headers stay pinned (matching the DataTable sticky-toolbar
// story), instead of the panel growing to its full content height.
const FULL_PAGE_HEIGHT = 'calc(100vh - 220px)'

const SkillsItemCount = ({ total }: { total: number }) => {
    const table = useDataTable<TransformedArticle>()
    const { pageIndex, pageSize } = table.getState().pagination
    const start = total === 0 ? 0 : pageIndex * pageSize + 1
    const end = Math.min((pageIndex + 1) * pageSize, total)

    return (
        <Text size="sm" variant="medium" color="content-neutral-tertiary">
            Showing {start}-{end} of {total} items
        </Text>
    )
}

export const SkillsTable = () => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId || 0
    const shopName = storeConfiguration?.storeName || ''
    const { routes } = useAiAgentNavigation({ shopName })

    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const shopIntegrationId = storeIntegration?.id

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const isSuccessRateEnabled = useSkillReportingEnabled()

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

    return (
        <Panel
            className={css.panel}
            w="100%"
            h={FULL_PAGE_HEIGHT}
            overflow="auto"
            withoutBorder
        >
            <DataTable<TransformedArticle>
                data={filteredArticles}
                columns={columns}
                isLoading={isLoading}
                stickyToolbar
                withBorder
                overflow="scroll"
                sorting={{ enable: true }}
                pagination={{ enable: true, defaultValue: DEFAULT_PAGINATION }}
                getRowHref={(skill) => routes.skillDetail(skill.id)}
            >
                <DataTableHeader>
                    <Box flexDirection="column" gap="xs" flex={1} width="100%">
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                        >
                            <Box width="240px">
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
                                        setStatsDisplayMode(
                                            id as StatsDisplayMode,
                                        )
                                    }
                                >
                                    <ButtonGroupItem
                                        icon="percent"
                                        id="percentage"
                                    >
                                        Percentage
                                    </ButtonGroupItem>
                                    <ButtonGroupItem
                                        icon="hashtag"
                                        id="numeric"
                                    >
                                        Numeric
                                    </ButtonGroupItem>
                                </ButtonGroup>
                            )}
                        </Box>
                        <Box
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                            width="100%"
                        >
                            <SkillsItemCount total={filteredArticles.length} />
                            <Text
                                size="sm"
                                variant="medium"
                                color="content-neutral-tertiary"
                            >
                                Metrics from last 28 days
                            </Text>
                        </Box>
                    </Box>
                </DataTableHeader>
                <DataTableItemCount>{() => null}</DataTableItemCount>
                <DataTablePagination pageSizeOptions={[20, 50, 100]} />
            </DataTable>
        </Panel>
    )
}
