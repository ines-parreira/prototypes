import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import {
    Box,
    Heading,
    Icon,
    Link,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tag,
    Text,
} from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import { useGuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getTimezone } from 'state/currentUser/selectors'

import { useGuidanceReferencesTicketCounts } from './hooks/useGuidanceReferencesTicketCounts'

import css from './ActionUsageTab.less'

type Props = {
    configuration: StoreWorkflowsConfiguration
}

export const ActionUsageTab = ({ configuration }: Props) => {
    const { shopName } = useParams<{ shopName: string }>()
    const { routes } = useAiAgentNavigation({ shopName })

    const { references } = useGuidanceReferenceContext()
    const guidances = useMemo(
        () => references[configuration.id] ?? [],
        [references, configuration.id],
    )

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId ?? 0

    const { data: helpCenter, isLoading: isHelpCenterLoading } =
        useGetHelpCenter(helpCenterId, {}, { enabled: !!helpCenterId })
    const shopIntegrationId = helpCenter?.shop_integration_id ?? 0
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const guidanceSourceIds = useMemo(
        () => guidances.map((guidance) => guidance.sourceId),
        [guidances],
    )

    const { countsBySourceId, isLoading: isCountsLoading } =
        useGuidanceReferencesTicketCounts({
            guidanceSourceIds,
            resourceSourceSetId: helpCenterId,
            shopIntegrationId,
            timezone,
        })

    const isTicketCountLoading = isHelpCenterLoading || isCountsLoading

    return (
        <Box flexDirection="column" gap="md" p="lg" w="100%">
            <Box flexDirection="column" gap="xxxs">
                <Heading size="sm">Action usage</Heading>
                <Text size="sm" color="content-neutral-secondary">
                    Where this action is used across Gorgias.
                </Text>
            </Box>
            {guidances.length === 0 ? (
                <Box
                    flexDirection="column"
                    alignItems="center"
                    gap="xs"
                    p="lg"
                    className={css.emptyState}
                >
                    <Icon
                        name="book-open"
                        size="lg"
                        color="content-neutral-secondary"
                    />
                    <Heading size="sm">
                        This action is not referenced by any guidances
                    </Heading>
                    <Text size="sm" color="content-neutral-secondary">
                        Once a guidance references this action it will appear
                        here.
                    </Text>
                </Box>
            ) : (
                <Box className={css.tableContainer}>
                    <Table withBorder>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell hug>Area</TableHeaderCell>
                                <TableHeaderCell>Source</TableHeaderCell>
                                <TableHeaderCell hug>
                                    Tickets (last 28 days)
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guidances.map((guidance) => (
                                <TableRow key={guidance.id}>
                                    <TableCell hug>
                                        <Tag color="fuchsia" size="sm">
                                            AI Agent
                                        </Tag>
                                    </TableCell>
                                    <TableCell>
                                        <Box
                                            flexDirection="row"
                                            alignItems="center"
                                            gap="sm"
                                        >
                                            <Tag size="sm">Guidance</Tag>
                                            <Link
                                                href={routes.knowledgeArticle(
                                                    'guidance',
                                                    Number.parseInt(
                                                        guidance.sourceId,
                                                        10,
                                                    ),
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                trailingSlot="external-link"
                                            >
                                                {guidance.title}
                                            </Link>
                                        </Box>
                                    </TableCell>
                                    <TableCell hug>
                                        {isTicketCountLoading ? (
                                            <Skeleton width={32} height={16} />
                                        ) : (
                                            <Text size="sm">
                                                {countsBySourceId[
                                                    guidance.sourceId
                                                ] ?? 0}
                                            </Text>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </Box>
    )
}
