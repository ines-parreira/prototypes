import {
    Box,
    Heading,
    Icon,
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
    ToggleField,
} from '@gorgias/axiom'

import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import type { SkillToggleState } from './skillRecap.utils'

type Props = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    skillStates: SkillToggleState[]
    onToggleSkill: (skillId: number, isEnabled: boolean) => void
}

const TOGGLE_COLUMN_WIDTH = '130px'

export const SkillsSidePanel = ({
    isOpen,
    onOpenChange,
    skillStates,
    onToggleSkill,
}: Props) => {
    const hasAnyDisabledActions = skillStates.some(
        (s) => s.disabledActionIds.length > 0,
    )

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <OverlayHeader
                title={<Heading size="lg">Skills</Heading>}
                description={
                    <Text color="var(--content-neutral-secondary)">
                        Review the skills that will be enabled for your AI Agent
                        when you apply all changes. Skills that still need work
                        will be saved as drafts.
                    </Text>
                }
            />
            <OverlayContent>
                <Box
                    flexDirection="column"
                    gap="md"
                    height="fit-content"
                    width="100%"
                >
                    {hasAnyDisabledActions && (
                        <Box alignItems="center" gap="xxxs">
                            <Icon
                                name="warning-triangle"
                                size="sm"
                                color="content-warning-default"
                            />
                            <Text color="content-warning-default">
                                Some skills include actions that will activate
                                when you apply changes
                            </Text>
                        </Box>
                    )}
                    <Table withBorder layout="fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell>Skills</TableHeaderCell>
                                <TableHeaderCell width={TOGGLE_COLUMN_WIDTH}>
                                    Ready to enable
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {skillStates.map(
                                ({ skill, isEnabled, disabledActionIds }) => {
                                    const title =
                                        skill.article?.translation.title ??
                                        `Skill ${skill.skill_id}`
                                    const hasDisabledActions =
                                        disabledActionIds.length > 0
                                    return (
                                        <TableRow key={skill.skill_id}>
                                            <TableCell>
                                                <Box
                                                    alignItems="center"
                                                    gap="xs"
                                                >
                                                    {hasDisabledActions && (
                                                        <Icon
                                                            name="warning-triangle"
                                                            size="sm"
                                                            color="content-warning-default"
                                                            alt={`${title} has actions that need to be enabled`}
                                                        />
                                                    )}
                                                    <Box flex={1} minWidth={0}>
                                                        <TruncatedTextWithTooltip
                                                            tooltipContent={
                                                                title
                                                            }
                                                        >
                                                            <Text>{title}</Text>
                                                        </TruncatedTextWithTooltip>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell
                                                width={TOGGLE_COLUMN_WIDTH}
                                                verticalAlign="middle"
                                            >
                                                <Box justifyContent="flex-end">
                                                    <ToggleField
                                                        value={isEnabled}
                                                        onChange={(next) =>
                                                            onToggleSkill(
                                                                skill.skill_id,
                                                                next,
                                                            )
                                                        }
                                                    />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                },
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}
