import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Box, Skeleton } from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
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
    const { hasSkills, isLoading } = useHasLinkedSkills()
    const [isIntentsTableOpen, setIsIntentsTableOpen] = useState(false)
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const { allSkillsTemplates, availableSkillsTemplates } =
        useSkillsTemplates()
    const history = useHistory()
    const { storeConfiguration } = useAiAgentStoreConfigurationContext()
    const shopName = storeConfiguration?.storeName || ''
    const { routes } = useAiAgentNavigation({ shopName })

    const handleCreateSkillsFromTemplate = (templateId?: string) => {
        if (templateId) {
            history.push(routes.newSkillFromTemplate(templateId))
        } else {
            history.push(routes.newSkill)
        }
    }

    const handleCreateSkillFromScratch = () => {
        history.push(routes.newSkill)
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
                onCreateSkillFromScratch={handleCreateSkillFromScratch}
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
                ) : !hasSkills ? (
                    <SkillsEmptyState
                        onCreateSkillFromScratch={handleCreateSkillFromScratch}
                        onCreateSkillFromTemplate={handleOpenTemplateModal}
                    />
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
