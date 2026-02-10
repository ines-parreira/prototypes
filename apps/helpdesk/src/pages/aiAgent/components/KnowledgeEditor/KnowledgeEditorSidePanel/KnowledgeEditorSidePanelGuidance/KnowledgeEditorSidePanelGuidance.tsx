import {
    useGuidanceImpactFromContext,
    useGuidanceRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

export const KnowledgeEditorSidePanelGuidance = () => {
    const impact = useGuidanceImpactFromContext()
    const recentTickets = useGuidanceRecentTicketsFromContext()

    const initialExpandedSections: string[] = [
        'details',
        'impact',
        'related-tickets',
    ]

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
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
