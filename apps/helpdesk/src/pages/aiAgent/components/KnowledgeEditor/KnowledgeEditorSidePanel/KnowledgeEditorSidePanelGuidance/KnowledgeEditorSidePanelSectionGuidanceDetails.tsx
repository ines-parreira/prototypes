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
import { KnowledgeEditorSidePanelGuidanceDisableIntentsModal } from './KnowledgeEditorSidePanelGuidanceDisableIntentsModal'

import css from '../KnowledgeEditorSidePanelCommonFields.less'

export type Props = {
    sectionId: string
    linkedIntentsCount?: number
    onDisableWithLinkedIntents?: () => void
}

export const KnowledgeEditorSidePanelSectionGuidanceDetails = ({
    sectionId,
    linkedIntentsCount = 0,
    onDisableWithLinkedIntents,
}: Props) => {
    const {
        aiAgentStatus,
        createdDatetime,
        lastUpdatedDatetime,
        isUpdating,
        isDraft,
        isViewingHistoricalVersion,
        guidanceMode,
    } = useGuidanceDetailsFromContext()
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false)
    const [isDisablingWithLinkedIntents, setIsDisablingWithLinkedIntents] =
        useState(false)

    const handleAIAgentStatusChange = async () => {
        if (aiAgentStatus.value && linkedIntentsCount > 0) {
            setIsDisableModalOpen(true)
            return
        }

        await aiAgentStatus.onChange()
    }

    const handleDisableWithLinkedIntents = async () => {
        setIsDisablingWithLinkedIntents(true)
        try {
            await aiAgentStatus.onChange()
            onDisableWithLinkedIntents?.()
            setIsDisableModalOpen(false)
        } finally {
            setIsDisablingWithLinkedIntents(false)
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
                    isDisabled={isUpdating || isDisablingWithLinkedIntents}
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

            <KnowledgeEditorSidePanelGuidanceDisableIntentsModal
                isOpen={isDisableModalOpen}
                isDisabling={isDisablingWithLinkedIntents}
                onClose={() => setIsDisableModalOpen(false)}
                onDisable={handleDisableWithLinkedIntents}
            />
        </>
    )
}
