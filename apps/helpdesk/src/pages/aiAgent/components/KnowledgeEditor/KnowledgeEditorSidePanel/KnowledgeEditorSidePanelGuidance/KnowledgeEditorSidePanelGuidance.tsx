import { useGuidanceContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import {
    useGuidanceImpactFromContext,
    useGuidanceRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelBackendIds } from '../KnowledgeEditorSidePanelBackendIds'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

export const KnowledgeEditorSidePanelGuidance = () => {
    const impact = useGuidanceImpactFromContext()
    const recentTickets = useGuidanceRecentTicketsFromContext()
    const { guidanceArticle, config, state } = useGuidanceContext()

    const initialExpandedSections: string[] = [
        'details',
        'impact',
        'related-tickets',
    ]

    const backendIds: Record<string, string | number> = {}
    if (guidanceArticle?.id) {
        backendIds['Article ID (SourceId)'] = guidanceArticle.id
    }
    if (config.guidanceHelpCenter?.id) {
        backendIds['Help Center ID (SourceSetId)'] =
            config.guidanceHelpCenter.id
    }
    if (guidanceArticle?.locale) {
        backendIds['Locale'] = guidanceArticle.locale
    }
    if (state.guidance?.publishedVersionId) {
        backendIds['Published Version ID'] = state.guidance.publishedVersionId
    }
    if (state.guidance?.draftVersionId) {
        backendIds['Draft Version ID'] = state.guidance.draftVersionId
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
