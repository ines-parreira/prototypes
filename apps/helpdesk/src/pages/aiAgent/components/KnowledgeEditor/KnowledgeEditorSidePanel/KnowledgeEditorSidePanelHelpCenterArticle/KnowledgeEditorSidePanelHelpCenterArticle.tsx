import { useArticleImpactFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as HelpCenterArticleRelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

type Props = {
    relatedTickets?: Omit<HelpCenterArticleRelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelHelpCenterArticle = ({
    relatedTickets,
}: Props) => {
    const impact = useArticleImpactFromContext()

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
