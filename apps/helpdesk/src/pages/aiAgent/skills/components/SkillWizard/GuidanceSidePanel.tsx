import classNames from 'classnames'

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
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import type { GuidanceDisableEntry } from './skillRecap.utils'

import css from './GuidanceSidePanel.less'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    entries: GuidanceDisableEntry[]
    getGuidanceTitle: (guidanceId: number) => string
    onToggleGuidance: (guidanceId: number, isMarkedForDisable: boolean) => void
}

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
                    <Table withBorder>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Guidance</TableHeaderCell>
                                <TableHeaderCell hug>
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
                                                className={classNames({
                                                    [css.dimmed]:
                                                        entry.isMarkedForDisable,
                                                })}
                                            >
                                                <Text
                                                    color="var(--content-accent-default)"
                                                    className={css.guidanceLink}
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
                                                    {title}
                                                </Text>
                                                <Text
                                                    size="sm"
                                                    color="content-neutral-secondary"
                                                >
                                                    Covered by {coveredBy}
                                                </Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell hug verticalAlign="middle">
                                            <div className={css.checkboxCell}>
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
                                            </div>
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
