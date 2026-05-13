import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import { Box, Skeleton } from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { useGetWizard } from 'models/helpCenter/queries'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { IntroducingSkillsBanner } from 'pages/aiAgent/skills/components/IntroducingSkillsBanner/IntroducingSkillsBanner'
import { RecommendedSkillsSection } from 'pages/aiAgent/skills/components/RecommendedSkillsSection/RecommendedSkillsSection'
import { ReviewSkillsSection } from 'pages/aiAgent/skills/components/ReviewSkillsSection/ReviewSkillsSection'
import { SkillsTemplateModal } from 'pages/aiAgent/skills/components/SkillsTemplateModal/SkillsTemplateModal'
import { WizardSkillsBanner } from 'pages/aiAgent/skills/components/WizardSkillsBanner/WizardSkillsBanner'
import { useEnrichedSkillWizard } from 'pages/aiAgent/skills/hooks/useEnrichedSkillWizard'
import { useHasLinkedSkills } from 'pages/aiAgent/skills/hooks/useHasLinkedSkills'
import { useSkillsTemplates } from 'pages/aiAgent/skills/hooks/useSkillsTemplates'
import { SkillWizardStatus } from 'pages/aiAgent/skills/types'

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
    const helpCenterId = storeConfiguration?.guidanceHelpCenterId ?? 0
    const { routes } = useAiAgentNavigation({ shopName })
    const isSkillWizardEnabled = useFlag(FeatureFlagKey.SkillWizard)

    const { data: wizard } = useGetWizard(helpCenterId, {
        enabled: isSkillWizardEnabled && !!helpCenterId,
    })

    const { wizard: enrichedWizard, isLoading: isWizardLoading } =
        useEnrichedSkillWizard(wizard)

    const isWizardActive =
        isSkillWizardEnabled &&
        !!wizard &&
        wizard.status !== SkillWizardStatus.Completed

    const handleOpenSkillWizard = () => {
        if (!enrichedWizard) return
        history.push(
            routes.skillsWizardStep(
                enrichedWizard.ui_wizard_state.current_step,
            ),
        )
    }

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
                showActions={!isWizardActive}
                onViewIntents={handleViewIntents}
                onCreateSkillFromScratch={handleCreateSkillFromScratch}
                onCreateSkillFromTemplate={handleOpenTemplateModal}
            />

            {isWizardActive ? (
                <Box flexDirection="column" className={css.wizardContent}>
                    <WizardSkillsBanner />
                    {!isWizardLoading && enrichedWizard && (
                        <ReviewSkillsSection
                            wizard={enrichedWizard}
                            onCTA={handleOpenSkillWizard}
                        />
                    )}
                </Box>
            ) : (
                <Box flexDirection="column" className={css.content}>
                    <IntroducingSkillsBanner shopName={shopName} />
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
                            onCreateSkillFromScratch={
                                handleCreateSkillFromScratch
                            }
                            onCreateSkillFromTemplate={handleOpenTemplateModal}
                        />
                    ) : (
                        <SkillsTable />
                    )}
                </Box>
            )}

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
