import { useCallback, useMemo, useState } from 'react'

import { Box, Text, ToggleField, Tooltip, TooltipContent } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import { useSkillSupportingKnowledgeFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillSupportingKnowledgeFromContext'
import { useSkillTopKnowledges } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillTopKnowledges'
import { SkillDisableKnowledgeModal } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/modals/SkillDisableKnowledgeModal'
import { SkillEditorSidePanelTopKnowledgeSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelTopKnowledgeSection'

import css from './SkillEditorSidePanelKnowledgeSection.less'

const TOOLTIP_MESSAGES = {
    KNOWLEDGE_PUBLISHED_WITH_DRAFT_TOOLTIP:
        'A draft of this skill exists. Switch to the draft to change knowledge settings.',
    DIFF_MODE_TOOLTIP:
        'You are comparing versions. Switch to the draft to change knowledge settings.',
    KNOWLEDGE_HISTORICAL_VERSION_TOOLTIP:
        'You are viewing a past version. Switch to the current version to change knowledge settings.',
    READ_MODE_IN_PREVIEW_TOOLTIP:
        'This skill is in read-only mode. Switch to edit mode to change knowledge settings.',
}

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelKnowledgeSection = ({ sectionId }: Props) => {
    const [isDisableKnowledgeModalOpen, setIsDisableKnowledgeModalOpen] =
        useState(false)

    const {
        skillId,
        useSupportingKnowledge,
        isDiffMode,
        isViewingHistoricalVersion,
        isViewingPublishedWithDraft,
        isReadInPreview,
        updateUseSupportingKnowledge,
        hasPublishedVersion,
        isUpdating: isSaving,
        isAutoSaving,
        isPreview,
    } = useSkillSupportingKnowledgeFromContext()

    const {
        topSupportingKnowledges,
        isLoading,
        dateRange,
        historicalVersionDateRange,
    } = useSkillTopKnowledges()

    const handleToggleKnowledge = useCallback(
        (value: boolean) => {
            if (!value) {
                setIsDisableKnowledgeModalOpen(true)
            } else {
                updateUseSupportingKnowledge(value, () =>
                    setIsDisableKnowledgeModalOpen(false),
                )
            }
        },
        [updateUseSupportingKnowledge],
    )

    const handleDisableKnowledge = () => {
        updateUseSupportingKnowledge(false, () =>
            setIsDisableKnowledgeModalOpen(false),
        )
    }

    const isDisabled =
        isDiffMode ||
        isViewingHistoricalVersion ||
        isReadInPreview ||
        isViewingPublishedWithDraft

    const toggle = useMemo(
        () => (
            <ToggleField
                value={useSupportingKnowledge}
                onChange={handleToggleKnowledge}
                isDisabled={isDisabled}
            />
        ),
        [isDisabled, useSupportingKnowledge, handleToggleKnowledge],
    )

    const displayedToggle = useMemo(() => {
        if (!isDisabled) return toggle

        const tooltipMessage = isDiffMode
            ? TOOLTIP_MESSAGES.DIFF_MODE_TOOLTIP
            : isViewingHistoricalVersion
              ? TOOLTIP_MESSAGES.KNOWLEDGE_HISTORICAL_VERSION_TOOLTIP
              : isViewingPublishedWithDraft
                ? TOOLTIP_MESSAGES.KNOWLEDGE_PUBLISHED_WITH_DRAFT_TOOLTIP
                : TOOLTIP_MESSAGES.READ_MODE_IN_PREVIEW_TOOLTIP

        return (
            <Tooltip trigger={toggle}>
                <TooltipContent caption={tooltipMessage} />
            </Tooltip>
        )
    }, [
        toggle,
        isDiffMode,
        isViewingHistoricalVersion,
        isViewingPublishedWithDraft,
        isDisabled,
    ])

    return (
        <>
            <KnowledgeEditorSidePanelSection
                header={{
                    title: (
                        <Box gap="xs" alignItems="center">
                            {displayedToggle}
                            <Text size="md" variant="bold">
                                Knowledge
                            </Text>
                        </Box>
                    ),
                    subtitle: (
                        <Text size="sm" color="content-neutral-tertiary">
                            AI Agent uses your knowledge to complement skill
                            instructions when needed.
                        </Text>
                    ),
                }}
                sectionId={sectionId}
                alwaysExpanded={!isPreview}
                withBorderBottom={!!isPreview}
            >
                {!!skillId &&
                    !!useSupportingKnowledge &&
                    !!hasPublishedVersion && (
                        <Box paddingTop="sm">
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
                                <Box
                                    width="100%"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Text
                                        size="sm"
                                        color="content-neutral-secondary"
                                        align="center"
                                        className={css.knowledgeContent}
                                    >
                                        Knowledge has not been used by AI Agent
                                        yet.
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    )}
            </KnowledgeEditorSidePanelSection>

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
