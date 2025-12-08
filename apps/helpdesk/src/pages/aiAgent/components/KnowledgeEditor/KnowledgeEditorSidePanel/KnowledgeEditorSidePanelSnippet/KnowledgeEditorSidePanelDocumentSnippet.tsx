import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as DocumentSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'
import { KnowledgeEditorSidePanelSectionDocumentSnippetDetails } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'

type Props = {
    details: Omit<DocumentSnippetDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    relatedTickets?: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelDocumentSnippet = ({
    details,
    impact,
    relatedTickets,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={['details', 'impact', 'related-tickets']}
    >
        <KnowledgeEditorSidePanelSectionDocumentSnippetDetails
            {...details}
            sectionId="details"
        />
        {impact && (
            <KnowledgeEditorSidePanelSectionImpact
                {...impact}
                sectionId="impact"
            />
        )}
        {relatedTickets && (
            <KnowledgeEditorSidePanelSectionRelatedTickets
                {...relatedTickets}
                sectionId="related-tickets"
            />
        )}
    </KnowledgeEditorSidePanel>
)
