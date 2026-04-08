import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router-dom'
import { POSITIONS } from 'reapop'

import type { Row } from '@gorgias/axiom'
import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    flexRender,
    Heading,
    OverlayContent,
    OverlayHeader,
    SearchField,
    SidePanel,
    TableV1Cell as TableCell,
    TableV1Header as TableHeader,
    TableV1Row as TableRow,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
    Text,
    useTableV1,
} from '@gorgias/axiom'

import { useGetTicketChannelsStoreIntegrations } from 'hooks/integrations/useGetTicketChannelsStoreIntegrations'
import useAppDispatch from 'hooks/useAppDispatch'
import { helpCenterKeys } from 'models/helpCenter/queries'
import type { LocaleCode } from 'models/helpCenter/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { useUpdateIntentStatus } from 'pages/aiAgent/skills/hooks/useUpdateIntentStatus'
import type { UpdateGuidanceArticle } from 'pages/aiAgent/types'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { TransformedIntent } from '../../hooks/useIntentsTable'
import { useIntentsTable } from '../../hooks/useIntentsTable'
import { useSkillsArticles } from '../../hooks/useSkillsArticles'
import { IntentStatus } from '../../types'
import type { TransformedArticle } from '../../types'
import { getColumns } from './columns'
import type { StatsDisplayMode } from './columns'
import { DisableIntentModal } from './DisableIntentModal'
import { LinkToSkillModal } from './LinkToSkillModal'

import css from './IntentsTable.less'

interface IntentsTableProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export const IntentsTable = ({ isOpen, onOpenChange }: IntentsTableProps) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId || 0
    const shopName = storeConfiguration?.storeName || ''

    const {
        intents,
        findIntent,
        isLoading,
        isMetricsLoading,
        metricsDateRange,
    } = useIntentsTable(helpCenterId)

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

    const integrationIds = useGetTicketChannelsStoreIntegrations(shopName)
    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const { articles } = useSkillsArticles(
        helpCenterId,
        storeIntegration?.id || 0,
    )
    const hasExistingSkills = articles.length > 0
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const { updateIntentStatus, isLoading: isUpdating } =
        useUpdateIntentStatus(helpCenterId)
    const { updateGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({ guidanceHelpCenterId: helpCenterId })

    const [searchTerm, setSearchTerm] = useState('')
    const [statsDisplayMode, setStatsDisplayMode] =
        useState<StatsDisplayMode>('percentage')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [pendingDisableIntent, setPendingDisableIntent] =
        useState<TransformedIntent | null>(null)
    const [pendingLinkIntentId, setPendingLinkIntentId] = useState<
        string | null
    >(null)

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

    const flattenedIntents = useMemo(
        () =>
            filteredIntents.flatMap((intent) =>
                expandedRows.has(intent.id) && intent.children
                    ? [intent, ...intent.children]
                    : [intent],
            ),
        [filteredIntents, expandedRows],
    )

    const totalCount = intents.length
    const filteredCount = filteredIntents.length

    const handleToggleExpanded = useCallback((rowId: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev)
            if (next.has(rowId)) {
                next.delete(rowId)
            } else {
                next.add(rowId)
            }
            return next
        })
    }, [])

    const notifySuccess = useCallback(
        (message: string) =>
            dispatch(
                notify({
                    message,
                    status: NotificationStatus.Success,
                    position: POSITIONS.bottomRight,
                }),
            ),
        [dispatch],
    )

    const notifyError = useCallback(
        (message: string) =>
            dispatch(
                notify({
                    message,
                    status: NotificationStatus.Error,
                    position: POSITIONS.bottomRight,
                }),
            ),
        [dispatch],
    )

    const handleToggleEnabled = useCallback(
        (intentId: string, enabled: boolean) => {
            if (!enabled) {
                const intent = findIntent(intentId)
                if (intent) {
                    setPendingDisableIntent(intent)
                }
                return
            }

            updateIntentStatus(intentId, IntentStatus.NotLinked)
                .then(() => notifySuccess('Intent successfully enabled'))
                .catch(() =>
                    notifyError('An error occurred while enabling the intent'),
                )
        },
        [findIntent, updateIntentStatus, notifySuccess, notifyError],
    )

    const handleDisableConfirm = useCallback(() => {
        if (!pendingDisableIntent) return

        updateIntentStatus(pendingDisableIntent.id, IntentStatus.Handover)
            .then(() => {
                setPendingDisableIntent(null)
                notifySuccess('Intent successfully disabled')
            })
            .catch(() =>
                notifyError('An error occurred while disabling the intent'),
            )
    }, [pendingDisableIntent, updateIntentStatus, notifySuccess, notifyError])

    const handleLinkToExistingSkill = useCallback((intentId: string) => {
        setPendingLinkIntentId(intentId)
    }, [])

    const handleOpenSkill = useCallback(
        (skillId: number) => {
            history.push(routes.skillDetail(skillId))
        },
        [history, routes],
    )

    const handleCreateNewSkill = useCallback(
        (intentName: string, intentTitle?: string) => {
            history.push(routes.newSkill, {
                title: intentTitle,
                intents: [intentName],
            })
        },
        [history, routes.newSkill],
    )

    const handleDisableClose = useCallback(
        () => setPendingDisableIntent(null),
        [],
    )

    const handleLinkToSkillClose = useCallback(
        () => setPendingLinkIntentId(null),
        [],
    )

    const handleLinkToSkillConfirm = useCallback(
        (intentId: string, article: TransformedArticle) => {
            const locale =
                article.publishedVersion?.locale ?? article.draftVersion?.locale
            if (!locale) return

            const newIntents = [
                ...article.intents.map((i) => i.name),
                intentId,
            ] as UpdateGuidanceArticle['intents']

            updateGuidanceArticle(
                { intents: newIntents, isCurrent: false },
                { articleId: article.id, locale: locale as LocaleCode },
            )
                .then(() => {
                    queryClient.invalidateQueries({
                        queryKey: helpCenterKeys.intents(helpCenterId),
                    })
                    setPendingLinkIntentId(null)
                    notifySuccess('Intent successfully linked to skill')
                    history.push(routes.skillDetail(article.id))
                })
                .catch(() =>
                    notifyError('An error occurred while linking the intent'),
                )
        },
        [
            updateGuidanceArticle,
            queryClient,
            helpCenterId,
            notifySuccess,
            notifyError,
            history,
            routes,
        ],
    )

    const columns = useMemo(
        () =>
            getColumns({
                statsDisplayMode,
                isMetricsLoading,
                onToggleEnabled: handleToggleEnabled,
                onLinkToExistingSkill: handleLinkToExistingSkill,
                onCreateNewSkill: handleCreateNewSkill,
                onOpenSkill: handleOpenSkill,
                hasExistingSkills,
                expandedRows,
                onToggleExpanded: handleToggleExpanded,
                outcomeCustomFieldId,
                intentCustomFieldId,
                integrationIds,
                metricsDateRange,
            }),
        [
            statsDisplayMode,
            isMetricsLoading,
            handleToggleEnabled,
            handleLinkToExistingSkill,
            handleCreateNewSkill,
            handleOpenSkill,
            hasExistingSkills,
            expandedRows,
            handleToggleExpanded,
            outcomeCustomFieldId,
            intentCustomFieldId,
            integrationIds,
            metricsDateRange,
        ],
    )

    const renderRows = useCallback((rows: Row<TransformedIntent>[]) => {
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
    }, [])

    const table = useTableV1<TransformedIntent>({
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
                        <TableV1Root withBorder>
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
                </Box>
            </OverlayContent>
            <DisableIntentModal
                isOpen={!!pendingDisableIntent}
                trafficPercent={
                    pendingDisableIntent?.metrics?.ticketVolumePercent
                }
                isLoading={isUpdating}
                onClose={handleDisableClose}
                onConfirm={handleDisableConfirm}
            />
            <LinkToSkillModal
                isOpen={!!pendingLinkIntentId}
                intentId={pendingLinkIntentId}
                helpCenterId={helpCenterId}
                shopName={shopName}
                isLoading={isGuidanceArticleUpdating}
                onClose={handleLinkToSkillClose}
                onConfirm={handleLinkToSkillConfirm}
            />
        </SidePanel>
    )
}
