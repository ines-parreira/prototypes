import { useState } from 'react'

import { Box, Text, ToggleField } from '@gorgias/axiom'

import { useSkillSupportingKnowledgeFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillSupportingKnowledgeFromContext'
import { useSkillTopKnowledges } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillTopKnowledges'
import { SkillDisableKnowledgeModal } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/modals/SkillDisableKnowledgeModal'
import { SkillEditorSidePanelTopKnowledgeSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelTopKnowledgeSection'

export const SkillEditorSidePanelKnowledgeSection = () => {
    const [isDisableKnowledgeModalOpen, setIsDisableKnowledgeModalOpen] =
        useState(false)

    const {
        skillId,
        useSupportingKnowledge,
        isDiffMode,
        isViewingHistoricalVersion,
        updateUseSupportingKnowledge,
        hasPublishedVersion,
        isUpdating: isSaving,
        isAutoSaving,
    } = useSkillSupportingKnowledgeFromContext()

    const {
        topSupportingKnowledges,
        isLoading,
        dateRange,
        historicalVersionDateRange,
    } = useSkillTopKnowledges()

    const handleToggleKnowledge = (value: boolean) => {
        if (!value) {
            setIsDisableKnowledgeModalOpen(true)
        } else {
            updateUseSupportingKnowledge(value, () =>
                setIsDisableKnowledgeModalOpen(false),
            )
        }
    }

    const handleDisableKnowledge = () => {
        updateUseSupportingKnowledge(false, () =>
            setIsDisableKnowledgeModalOpen(false),
        )
    }

    return (
        <>
            <Box display="flex" flexDirection="column" gap="lg" padding="md">
                <Box display="flex" flexDirection="column" gap="xxxs">
                    <Box
                        gap="xxxs"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Text size="md" variant="bold">
                            Knowledge
                        </Text>
                        <ToggleField
                            value={useSupportingKnowledge}
                            onChange={handleToggleKnowledge}
                            isDisabled={
                                isDiffMode || isViewingHistoricalVersion
                            }
                        />
                    </Box>
                    <Text size="sm" color="content-neutral-tertiary">
                        AI Agent uses your knowledge to complement skill
                        instructions when needed.
                    </Text>
                </Box>
                {!!skillId &&
                    !!useSupportingKnowledge &&
                    !!hasPublishedVersion && (
                        <Box>
                            {isLoading || !!topSupportingKnowledges.length ? (
                                <SkillEditorSidePanelTopKnowledgeSection
                                    topKnowledges={topSupportingKnowledges}
                                    isLoading={isLoading}
                                    dateRange={dateRange}
                                    historicalVersionDateRange={
                                        historicalVersionDateRange
                                    }
                                />
                            ) : (
                                <Text
                                    size="sm"
                                    color="content-neutral-secondary"
                                    align="center"
                                >
                                    Knowledge has not been used by AI Agent yet.
                                </Text>
                            )}
                        </Box>
                    )}
            </Box>

            {isDisableKnowledgeModalOpen && (
                <SkillDisableKnowledgeModal
                    isOpen={isDisableKnowledgeModalOpen}
                    onClose={() => setIsDisableKnowledgeModalOpen(false)}
                    onDisable={handleDisableKnowledge}
                    isLoading={isSaving || isAutoSaving}
                />
            )}
        </>
    )
}
