import {
    Box,
    CheckBoxField,
    Heading,
    OverlayContent,
    OverlayHeader,
    SidePanel,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Text,
} from '@gorgias/axiom'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import type { GuidanceDisableEntry } from './skillRecap.utils'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    entries: GuidanceDisableEntry[]
    getGuidanceTitle: (guidanceId: number) => string
    onToggleGuidance: (guidanceId: number, isMarkedForDisable: boolean) => void
}

const CHECKBOX_COLUMN_WIDTH = '110px'

export const GuidanceSidePanel = ({
    isOpen,
    onOpenChange,
    entries,
    getGuidanceTitle,
    onToggleGuidance,
}: Props) => {
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const { routes } = useAiAgentNavigation({
        shopName: storeConfiguration?.storeName ?? '',
    })

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <OverlayHeader
                title={
                    <Heading>Guidance covered by your selected skills</Heading>
                }
                description={
                    <Text color="var(--content-neutral-secondary)">
                        The guidance below are covered by the skills you&apos;re
                        enabling. Disabling them avoids conflicting
                        instructions. They won&apos;t be deleted and can be
                        re-enabled from the Knowledge page at any time.
                    </Text>
                }
            />
            <OverlayContent>
                <Box width="100%" height="fit-content">
                    <Table withBorder layout="fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Guidance</TableHeaderCell>
                                <TableHeaderCell width={CHECKBOX_COLUMN_WIDTH}>
                                    To disable
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.map((entry) => {
                                const title = getGuidanceTitle(entry.guidanceId)
                                const coveredBy =
                                    entry.coveringSkillTitles.join(', ')
                                return (
                                    <TableRow key={entry.guidanceId}>
                                        <TableCell>
                                            <Box
                                                flexDirection="column"
                                                gap="xxxs"
                                                style={
                                                    entry.isMarkedForDisable
                                                        ? { opacity: 0.65 }
                                                        : undefined
                                                }
                                            >
                                                <Box
                                                    flex={1}
                                                    minWidth={0}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: 'var(--content-accent-default)',
                                                    }}
                                                    onClick={() =>
                                                        window.open(
                                                            routes.knowledgeArticle(
                                                                'guidance',
                                                                entry.guidanceId,
                                                            ),
                                                            '_blank',
                                                            'noreferrer',
                                                        )
                                                    }
                                                >
                                                    <TruncatedTextWithTooltip
                                                        tooltipContent={title}
                                                    >
                                                        <Text color="var(--content-accent-default)">
                                                            {title}
                                                        </Text>
                                                    </TruncatedTextWithTooltip>
                                                </Box>
                                                <Text
                                                    size="sm"
                                                    color="content-neutral-secondary"
                                                >
                                                    Covered by {coveredBy}
                                                </Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell
                                            width={CHECKBOX_COLUMN_WIDTH}
                                            verticalAlign="middle"
                                        >
                                            <Box justifyContent="center">
                                                <CheckBoxField
                                                    value={
                                                        entry.isMarkedForDisable
                                                    }
                                                    onChange={(next) =>
                                                        onToggleGuidance(
                                                            entry.guidanceId,
                                                            !!next,
                                                        )
                                                    }
                                                />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}
