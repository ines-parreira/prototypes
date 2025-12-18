import {
    useArticleImpactFromContext,
    useArticleRelatedTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

export const KnowledgeEditorSidePanelHelpCenterArticle = () => {
    const impact = useArticleImpactFromContext()
    const relatedTickets = useArticleRelatedTicketsFromContext()

    const initialExpandedSections = relatedTickets
        ? ['details', 'impact', 'relatedTickets', 'settings']
        : ['details', 'impact', 'settings']

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
        >
            <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />

            {impact && (
                <KnowledgeEditorSidePanelSectionImpact
                    {...impact}
                    sectionId="impact"
                />
            )}

            {relatedTickets && (
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    {...relatedTickets}
                    sectionId="relatedTickets"
                />
            )}

            <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings sectionId="settings" />
        </KnowledgeEditorSidePanel>
    )
}
