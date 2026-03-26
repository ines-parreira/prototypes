import { Box, Heading, Text } from '@gorgias/axiom'

import { SkillsTemplateCard } from 'pages/aiAgent/skills/components/SkillsTemplateCard/SkillsTemplateCard'
import type { SkillTemplate } from 'pages/aiAgent/skills/types'

import css from './RecommendedSkillsSection.less'

type Props = {
    skillsTemplates: SkillTemplate[]
    onCreateSkillsFromTemplate: () => void
}

export const RecommendedSkillsSection: React.FC<Props> = ({
    skillsTemplates,
    onCreateSkillsFromTemplate,
}) => {
    // Logic related to fetching stats, ordering skills template based on stat and
    // checking the availablity of skills template will be applied in the next iteration
    // (https://linear.app/gorgias/issue/COACH-2381/create-recommended-skills-section)

    return (
        <Box width="100%" className={css.container}>
            <Box flexDirection="column" gap="xxxs">
                <Heading size="md">Recommended skills</Heading>
                <Text size="md" variant="regular" className={css.description}>
                    Based on handover rate and ticket volume across your store
                </Text>
            </Box>
            {/* Full available templates display and ordering logic will be applied in the next iteration */}
            <SkillsTemplateCard
                skillTemplate={skillsTemplates[0]}
                onCreateSkillsFromTemplate={onCreateSkillsFromTemplate}
                className={css.templateCard}
                hasStats
                hasCTA
                hasActiveCTA
            />
        </Box>
    )
}
