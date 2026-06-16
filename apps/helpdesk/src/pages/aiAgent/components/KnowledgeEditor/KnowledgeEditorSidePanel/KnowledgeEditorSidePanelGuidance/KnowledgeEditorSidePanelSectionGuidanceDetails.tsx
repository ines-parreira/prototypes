import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { Tag } from '@gorgias/axiom'

import { copilotAnchorProps } from 'copilot/uiActions'
import { useUpdateArticle } from 'models/helpCenter/mutations'
import { helpCenterKeys } from 'models/helpCenter/queries'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import { useGuidanceDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'
import { KnowledgeEditorSidePanelConvertToSkill } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelConvertToSkill'
import { KnowledgeEditorSidePanelSectionConvertToSkillModal } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/modals/KnowledgeEditorSidePanelSectionConvertToSkillModal'
import { useSkillNotify } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillNotify'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { useSkillsAccess } from 'pages/aiAgent/hooks/useSkillsAccess'

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
        guidanceHelpCenterId,
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

    const guidanceHelpCenterLocale = useGuidanceStore(
        useShallow(
            (storeState) =>
                storeState.config.guidanceHelpCenter?.default_locale,
        ),
    )

    const { updateGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: guidanceHelpCenterId ?? 0,
    })

    const [isTogglingAIAgentStatus, setIsTogglingAIAgentStatus] =
        useState(false)
    const [isConvertToSkillModalOpen, setIsConvertToSkillModalOpen] =
        useState(false)
    const [isConvertingToSkill, setIsConvertingToSkill] = useState(false)

    const isKnowledgeIntentManagementSystemEnabled = useSkillsAccess()

    const { mutateAsync: updateArticle } = useUpdateArticle(
        guidanceHelpCenterId ?? 0,
    )
    const { success: notifySuccess, error: notifyError } = useSkillNotify()
    const queryClient = useQueryClient()
    const history = useHistory()
    const { routes } = useAiAgentNavigation({ shopName })

    const handleConvertToSkill = async () => {
        if (guidanceId && guidanceHelpCenterId) {
            setIsConvertingToSkill(true)
            try {
                if (guidanceHelpCenterLocale) {
                    await updateGuidanceArticle(
                        {
                            visibility: VisibilityStatusEnum.UNLISTED,
                            isCurrent: false,
                        },
                        {
                            articleId: guidanceId,
                            locale: guidanceHelpCenterLocale,
                        },
                    )
                }
                await updateArticle({
                    articleId: guidanceId,
                    data: { origin: 'skill' },
                })
                await queryClient.invalidateQueries({
                    queryKey: [
                        ...helpCenterKeys.all(),
                        'knowledge-hub-articles',
                    ],
                })
                notifySuccess(
                    'Guidance successfully converted into skill',
                    'Link intents to enable it',
                )
                history.push(routes.skillDetail(guidanceId))
            } catch {
                notifyError(
                    'Failed to convert guidance to skill. Please try again.',
                )
            } finally {
                setIsConvertingToSkill(false)
            }
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

    // Copilot follow-mode `status` anchor: guidance has no status control in
    // the editor toolbar, so the highlight points at the Status field here.
    const statusAnchorProps =
        guidanceId !== undefined
            ? copilotAnchorProps({ type: 'guidance', id: guidanceId }, 'status')
            : undefined

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
            right: (
                <span {...statusAnchorProps}>
                    {isViewingHistoricalVersion ? (
                        <Tag key="status">Previous version</Tag>
                    ) : (
                        <KnowledgeEditorSidePanelFieldStatus
                            key="status"
                            isDraft={isDraft}
                            mode={mode}
                        />
                    )}
                </span>
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
                isLoading={isConvertingToSkill}
                onClose={() => setIsConvertToSkillModalOpen(false)}
                onConvertToSkill={handleConvertToSkill}
            />
        </>
    )
}
