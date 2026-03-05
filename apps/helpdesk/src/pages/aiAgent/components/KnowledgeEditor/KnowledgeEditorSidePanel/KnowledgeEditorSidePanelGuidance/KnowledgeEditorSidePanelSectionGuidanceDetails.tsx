import { useState } from 'react'

import { Tag } from '@gorgias/axiom'

import { useGuidanceDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'

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
        aiAgentStatus,
        createdDatetime,
        lastUpdatedDatetime,
        isUpdating,
        isDraft,
        isViewingHistoricalVersion,
        guidanceMode,
        visibilityConflict,
        closeVisibilityConflictModal,
        rebaseAndEnableVisibility,
    } = useGuidanceDetailsFromContext()
    const [isTogglingAIAgentStatus, setIsTogglingAIAgentStatus] =
        useState(false)

    const handleAIAgentStatusChange = async () => {
        setIsTogglingAIAgentStatus(true)
        try {
            await aiAgentStatus.onChange()
        } finally {
            setIsTogglingAIAgentStatus(false)
        }
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
                    mode={guidanceMode}
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
            </KnowledgeEditorSidePanelSection>

            <KnowledgeEditorSidePanelGuidanceVisibilityConflictModal
                isOpen={visibilityConflict.isOpen}
                isLoading={isUpdating || isTogglingAIAgentStatus}
                message={visibilityConflict.message}
                onClose={closeVisibilityConflictModal}
                onRebase={rebaseAndEnableVisibility}
            />
        </>
    )
}
