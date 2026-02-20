import { memo } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import {
    useGuidanceImpactFromContext,
    useGuidanceRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelBackendIds } from '../KnowledgeEditorSidePanelBackendIds'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

const initialExpandedSections: string[] = [
    'details',
    'impact',
    'related-tickets',
]

const KnowledgeEditorSidePanelGuidanceComponent = () => {
    const impact = useGuidanceImpactFromContext()
    const recentTickets = useGuidanceRecentTicketsFromContext()
    const {
        guidanceArticleId,
        guidanceArticleLocale,
        guidanceHelpCenterId,
        publishedVersionId,
        draftVersionId,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceArticleId: storeState.guidanceArticle?.id,
            guidanceArticleLocale: storeState.guidanceArticle?.locale,
            guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id,
            publishedVersionId: storeState.state.guidance?.publishedVersionId,
            draftVersionId: storeState.state.guidance?.draftVersionId,
        })),
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

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
            footer={<KnowledgeEditorSidePanelBackendIds ids={backendIds} />}
        >
            <KnowledgeEditorSidePanelSectionGuidanceDetails sectionId="details" />

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
