import { useMemo } from 'react'

import { Box, Button, Heading, Icon, Size, Text } from '@gorgias/axiom'

import { SkillsTemplateCard } from 'pages/aiAgent/skills/components/SkillsTemplateCard/SkillsTemplateCard'
import type {
    EnrichedSkillWizard,
    WizardSkill,
} from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { IntentStatus, SkillWizardStatus } from 'pages/aiAgent/skills/types'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import css from './ReviewSkillsSection.less'

type Props = {
    wizard: EnrichedSkillWizard
    onCTA: () => void
}

const wizardSkillToTemplate = (skill: WizardSkill): SkillTemplate | null => {
    if (!skill.article) return null
    const { translation, help_center_id } = skill.article
    return {
        id: String(skill.skill_id),
        name: translation.title,
        guidanceId: String(skill.guidance_ids[0] ?? ''),
        intents: (translation.intents ?? []).map((name) => ({
            name,
            status: IntentStatus.NotLinked,
            help_center_id,
            articles: [],
        })),
    }
}

export const ReviewSkillsSection: React.FC<Props> = ({ wizard, onCTA }) => {
    const isInProgress = wizard.status === SkillWizardStatus.InProgress
    const { current_step, total_count } = wizard.ui_wizard_state

    const templatesWithCoverage = useMemo(
        () =>
            wizard.reviewable_skills.flatMap((skill) => {
                const template = wizardSkillToTemplate(skill)
                if (!template) return []
                return [
                    {
                        template,
                        coverage: {
                            isLoading: false,
                            hasAnyCoverage: true,
                            data: {
                                type: 'automation-rate-impact' as const,
                                impact: skill.estimated_automation_rate_impact,
                            },
                        },
                    },
                ]
            }),
        [wizard.reviewable_skills],
    )

    return (
        <Box className={css.container}>
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap={Size.Md}
                className={css.header}
            >
                <Box flex={1} flexDirection="column" gap="xxxs">
                    <Heading size="md">We created your core skills</Heading>
                    <Text size="md" color="var(--content-neutral-secondary)">
                        Built from your existing guidance and best practices
                        from top-performing merchants.
                    </Text>
                </Box>
                <Box
                    flexDirection="row"
                    alignItems="center"
                    gap={Size.Xs}
                    flexShrink={0}
                >
                    <Box flexDirection="row" alignItems="center" gap="xxxxs">
                        {isInProgress ? (
                            <Text size="sm" variant="regular">
                                {Math.max(0, current_step - 1)} of {total_count}{' '}
                                reviewed
                            </Text>
                        ) : (
                            <>
                                <Icon name="clock" size="xs" />
                                <Text size="sm" variant="regular">
                                    ~5 minutes
                                </Text>
                            </>
                        )}
                    </Box>
                    <Button
                        variant="primary"
                        onClick={onCTA}
                        trailingSlot="arrow-right"
                    >
                        {isInProgress
                            ? 'Resume skill review'
                            : 'Review your skills'}
                    </Button>
                </Box>
            </Box>
            <Box className={css.cardsRow}>
                {templatesWithCoverage.map(({ template, coverage }) => (
                    <SkillsTemplateCard
                        key={template.id}
                        skillTemplate={template}
                        coverage={coverage}
                    />
                ))}
            </Box>
            <Box className={css.footer}>
                <Text size="sm" color="var(--content-neutral-tertiary)">
                    Without skills, AI Agent may not always use the same
                    instructions for a given intent.
                </Text>
            </Box>
        </Box>
    )
}
