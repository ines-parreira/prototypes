import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useHistory } from 'react-router-dom'

import { Tag } from '@gorgias/axiom'

import { useGuidanceDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'
import { KnowledgeEditorSidePanelConvertToSkill } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelConvertToSkill'
import { KnowledgeEditorSidePanelSectionConvertToSkillModal } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/modals/KnowledgeEditorSidePanelSectionConvertToSkillModal'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldStatus,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'
import { KnowledgeEditorSidePanelGuidanceVisibilityConflictModal } from './modals/KnowledgeEditorSidePanelGuidanceVisibilityConflictModal'

import css from '../KnowledgeEditorSidePanelCommonFields.less'

export type Props = {
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionGuidanceDetails = ({
    sectionId,
}: Props) => {
    const {
        guidanceId,
        shopName,
        aiAgentStatus,
        createdDatetime,
        lastUpdatedDatetime,
        isUpdating,
        isDraft,
        isViewingHistoricalVersion,
        mode,
        visibilityConflict,
        closeVisibilityConflictModal,
        rebaseAndEnableVisibility,
    } = useGuidanceDetailsFromContext()
    const [isTogglingAIAgentStatus, setIsTogglingAIAgentStatus] =
        useState(false)
    const [isConvertToSkillModalOpen, setIsConvertToSkillModalOpen] =
        useState(false)

    const isKnowledgeIntentManagementSystemEnabled = useFlag(
        FeatureFlagKey.KnowledgeIntentManagementSystem,
    )

    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const handleConvertToSkill = () => {
        if (guidanceId) {
            history.push(routes.skillDetail(guidanceId))
        } else {
            history.push(routes.newSkill)
        }
        setIsConvertToSkillModalOpen(false)
    }

    const handleAIAgentStatusChange = async () => {
        setIsTogglingAIAgentStatus(true)
        try {
            await aiAgentStatus.onChange()
        } finally {
            setIsTogglingAIAgentStatus(false)
        }
    }

    const handleConvert = () => {
        setIsConvertToSkillModalOpen(true)
    }

    const columns = [
        {
            left: 'Type',
            right: (
                <KnowledgeEditorSidePanelFieldKnowledgeType
                    key="type"
                    type="guidance"
                />
            ),
        },
        {
            left: 'Status',
            right: isViewingHistoricalVersion ? (
                <Tag key="status">Previous version</Tag>
            ) : (
                <KnowledgeEditorSidePanelFieldStatus
                    key="status"
                    isDraft={isDraft}
                    mode={mode}
                />
            ),
        },
        {
            left: 'In use by AI Agent',
            right: (
                <KnowledgeEditorSidePanelFieldAIAgentStatus
                    key="ai-agent-status"
                    checked={aiAgentStatus.value}
                    className={css.extraLeftMargin}
                    onChange={handleAIAgentStatusChange}
                    isDisabled={isUpdating || isTogglingAIAgentStatus}
                    tooltip={aiAgentStatus.tooltip}
                />
            ),
        },
        {
            left: 'Created',
            right: (
                <KnowledgeEditorSidePanelFieldDateField
                    date={createdDatetime}
                    key="created"
                />
            ),
        },
        {
            left: 'Last updated',
            right: (
                <KnowledgeEditorSidePanelFieldDateField
                    date={lastUpdatedDatetime}
                    key="last-updated"
                />
            ),
        },
    ]

    return (
        <>
            <KnowledgeEditorSidePanelSection
                header={{ title: 'Details' }}
                sectionId={sectionId}
            >
                <KnowledgeEditorSidePanelTwoColumnsContent columns={columns} />
                {isKnowledgeIntentManagementSystemEnabled && (
                    <KnowledgeEditorSidePanelConvertToSkill
                        onConvert={handleConvert}
                        isConvertDisabled={isViewingHistoricalVersion}
                    />
                )}
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelGuidanceVisibilityConflictModal
                isOpen={visibilityConflict.isOpen}
                isLoading={isUpdating || isTogglingAIAgentStatus}
                message={visibilityConflict.message}
                onClose={closeVisibilityConflictModal}
                onRebase={rebaseAndEnableVisibility}
            />

            <KnowledgeEditorSidePanelSectionConvertToSkillModal
                isOpen={isConvertToSkillModalOpen}
                onClose={() => setIsConvertToSkillModalOpen(false)}
                onConvertToSkill={handleConvertToSkill}
            />
        </>
    )
}
