import { Box, Skeleton } from '@gorgias/axiom'

import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'

import { SkillsEmptyState } from '../SkillsEmptyState/SkillsEmptyState'
import { SkillsHeader } from '../SkillsHeader/SkillsHeader'

import css from './AiAgentSkills.less'

const SkillsContent = () => {
    return <Box>Skills content coming soon...</Box>
}

const SkillsLoading = () => {
    return <Skeleton height={220} />
}

export const AiAgentSkills = () => {
    const { hasLinkedSkills, isLoading } = useHasLinkedSkills()
    const noop = () => {}

    return (
        <Box flexDirection="column" width="100%">
            <SkillsHeader onViewIntents={noop} onCreateSkill={noop} />

            <Box flexDirection="column" className={css.content}>
                {isLoading ? (
                    <SkillsLoading />
                ) : !hasLinkedSkills ? (
                    <SkillsEmptyState onCreateSkill={noop} />
                ) : (
                    <SkillsContent />
                )}
            </Box>
        </Box>
    )
}
