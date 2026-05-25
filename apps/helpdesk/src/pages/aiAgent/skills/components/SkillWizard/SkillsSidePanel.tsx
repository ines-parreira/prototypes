import {
    Banner,
    Box,
    Button,
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
    actionsUrl: string
}

const TOGGLE_COLUMN_WIDTH = '130px'

export const SkillsSidePanel = ({
    isOpen,
    onOpenChange,
    skillStates,
    onToggleSkill,
    actionsUrl,
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
                        <Banner
                            intent="warning"
                            icon="warning-triangle"
                            isClosable={false}
                            size="sm"
                            title="Review new actions and their conditions before applying all changes"
                            description={
                                <Text size="sm" wrap="wrap">
                                    Some skills you&apos;re about to enable
                                    include new actions that will be enabled
                                    when you apply all changes. Review them to
                                    ensure AI Agent will perform them correctly.
                                </Text>
                            }
                        >
                            <Button
                                as="a"
                                href={actionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                trailingSlot="external-link"
                            >
                                Review actions
                            </Button>
                        </Banner>
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
