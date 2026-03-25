import { useState } from 'react'

import { Box, Skeleton } from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { RecommendedSkillsSection } from 'pages/aiAgent/skills/components/RecommendedSkillsSection/RecommendedSkillsSection'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'

import { IntentsTable } from '../IntentsTable/IntentsTable'
import { SkillsEmptyState } from '../SkillsEmptyState/SkillsEmptyState'
import { SkillsHeader } from '../SkillsHeader/SkillsHeader'
import { SkillsTable } from '../SkillsTable/SkillsTable'

import css from './AiAgentSkills.less'

const SkillsLoading = () => {
    return <Skeleton height={220} />
}

export const AiAgentSkills = () => {
    const { hasLinkedSkills, isLoading } = useHasLinkedSkills()
    const [isIntentsTableOpen, setIsIntentsTableOpen] = useState(false)
    const noop = () => {}

    const handleViewIntents = () => {
        setIsIntentsTableOpen(true)
    }

    return (
        <Box flexDirection="column" width="100%">
            <SkillsHeader
                onViewIntents={handleViewIntents}
                onCreateSkill={noop}
            />

            <Box flexDirection="column" className={css.content}>
                {/* This section will be displayed only when there are unused templates.
                The logic related to this will be applied in the next iteration */}
                <RecommendedSkillsSection />

                {isLoading ? (
                    <SkillsLoading />
                ) : !hasLinkedSkills ? (
                    <SkillsEmptyState onCreateSkill={noop} />
                ) : (
                    <SkillsTable />
                )}
            </Box>

            <IntentsTable
                isOpen={isIntentsTableOpen}
                onOpenChange={setIsIntentsTableOpen}
            />

            <DrillDownModal isLegacy={false} />
        </Box>
    )
}
