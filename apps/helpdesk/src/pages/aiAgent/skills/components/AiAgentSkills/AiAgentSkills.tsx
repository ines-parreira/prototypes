import { useState } from 'react'

import { Box, Skeleton } from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { RecommendedSkillsSection } from 'pages/aiAgent/skills/components/RecommendedSkillsSection/RecommendedSkillsSection'
import { SkillsTemplateModal } from 'pages/aiAgent/skills/components/SkillsTemplateModal/SkillsTemplateModal'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'

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
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const { allSkillsTemplates, availableSkillsTemplates } =
        useSkillsTemplates()
    const noop = () => {}

    const handleCreateSkillsFromTemplate = () => {
        // Logic on creating a Skill from template will be applied in the future iteration
        // oxlint-disable-next-line no-console
        console.log('Create skill from template')
    }

    const handleOpenTemplateModal = () => {
        setIsTemplateModalOpen(true)
    }

    const handleViewIntents = () => {
        setIsIntentsTableOpen(true)
    }

    return (
        <Box flexDirection="column" width="100%">
            <SkillsHeader
                onViewIntents={handleViewIntents}
                onCreateSkillFromScratch={noop}
                onCreateSkillFromTemplate={handleOpenTemplateModal}
            />

            <Box flexDirection="column" className={css.content}>
                {availableSkillsTemplates.length > 0 && (
                    <RecommendedSkillsSection
                        skillsTemplates={availableSkillsTemplates}
                        onCreateSkillsFromTemplate={
                            handleCreateSkillsFromTemplate
                        }
                    />
                )}

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
            <SkillsTemplateModal
                skillsTemplates={allSkillsTemplates}
                isOpen={isTemplateModalOpen}
                onOpenChange={setIsTemplateModalOpen}
                onCreateSkillsFromTemplate={handleCreateSkillsFromTemplate}
            />
        </Box>
    )
}
