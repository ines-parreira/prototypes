import { memo, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useShallow } from 'zustand/react/shallow'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import {
    useGuidanceImpactFromContext,
    useGuidanceRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'
import { AddMissingKnowledgeCheckbox } from 'pages/tickets/detail/components/AIAgentFeedbackBar/AddMissingKnowledgeCheckbox'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelBackendIds } from '../KnowledgeEditorSidePanelBackendIds'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'
import { KnowledgeEditorSidePanelSectionLinkedIntents } from './KnowledgeEditorSidePanelSectionLinkedIntents'

import sidePanelCss from '../KnowledgeEditorSidePanel.less'

const KnowledgeEditorSidePanelGuidanceComponent = () => {
    const isLinkedIntentsEnabled = useFlag(
        FeatureFlagKey.AddLinkedIntentsFromSidepanel,
    )
    const impact = useGuidanceImpactFromContext()
    const recentTickets = useGuidanceRecentTicketsFromContext()
    const {
        guidanceArticleId,
        guidanceArticleLocale,
        guidanceHelpCenterId,
        publishedVersionId,
        draftVersionId,
        linkedIntentsCount,
        guidanceMode,
        showMissingKnowledgeCheckbox,
        shouldAddToMissingKnowledge,
        setShouldAddToMissingKnowledge,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceArticleId: storeState.guidanceArticle?.id,
            guidanceArticleLocale: storeState.guidanceArticle?.locale,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id,
            publishedVersionId: storeState.state.guidance?.publishedVersionId,
            draftVersionId: storeState.state.guidance?.draftVersionId,
            linkedIntentsCount: storeState.state.guidance?.intents?.length ?? 0,
            guidanceMode: storeState.state.guidanceMode,
            showMissingKnowledgeCheckbox:
                storeState.config.showMissingKnowledgeCheckbox,
            shouldAddToMissingKnowledge: storeState.shouldAddToMissingKnowledge,
            setShouldAddToMissingKnowledge:
                storeState.setShouldAddToMissingKnowledge,
        })),
    )

    const initialExpandedSections = useMemo(
        () =>
            isLinkedIntentsEnabled
                ? ['details', 'linked-intents', 'impact', 'related-tickets']
                : ['details', 'impact', 'related-tickets'],
        [isLinkedIntentsEnabled],
    )

    const backendIds: Record<string, string | number> = {}
    if (guidanceArticleId) {
        backendIds['Article ID (SourceId)'] = guidanceArticleId
    }
    if (guidanceHelpCenterId) {
        backendIds['Help Center ID (SourceSetId)'] = guidanceHelpCenterId
    }
    if (guidanceArticleLocale) {
        backendIds['Locale'] = guidanceArticleLocale
    }
    if (publishedVersionId) {
        backendIds['Published Version ID'] = publishedVersionId
    }
    if (draftVersionId) {
        backendIds['Draft Version ID'] = draftVersionId
    }

    const isCreateMode = guidanceMode === 'create'

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
            footer={
                <>
                    {isCreateMode && showMissingKnowledgeCheckbox ? (
                        <div className={sidePanelCss.footer}>
                            <AddMissingKnowledgeCheckbox
                                isChecked={shouldAddToMissingKnowledge}
                                onChange={setShouldAddToMissingKnowledge}
                            />
                        </div>
                    ) : null}
                    <KnowledgeEditorSidePanelBackendIds ids={backendIds} />
                </>
            }
        >
            <KnowledgeEditorSidePanelSectionGuidanceDetails
                sectionId="details"
                linkedIntentsCount={linkedIntentsCount}
            />

            {isLinkedIntentsEnabled && (
                <KnowledgeEditorSidePanelSectionLinkedIntents sectionId="linked-intents" />
            )}

            <KnowledgeEditorSidePanelSectionImpact
                {...impact}
                sectionId="impact"
            />

            <KnowledgeEditorSidePanelSectionRecentTickets
                {...recentTickets}
                sectionId="related-tickets"
            />
        </KnowledgeEditorSidePanel>
    )
}

export const KnowledgeEditorSidePanelGuidance = memo(
    KnowledgeEditorSidePanelGuidanceComponent,
)
