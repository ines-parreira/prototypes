import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import {
    Props as ImpactProps,
    KnowledgeEditorSidePanelSectionImpact,
} from '../KnowledgeEditorSidePanelSectionImpact'
import {
    KnowledgeEditorSidePanelSectionRelatedTickets,
    Props as RelatedTicketsProps,
} from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import {
    Props as DocumentSnippetDetailsProps,
    KnowledgeEditorSidePanelSectionDocumentSnippetDetails,
} from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'

type Props = {
    details: Omit<DocumentSnippetDetailsProps, 'sectionId'>
    impact: Omit<ImpactProps, 'sectionId'>
    relatedTickets: Omit<RelatedTicketsProps, 'sectionId'>
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
        <KnowledgeEditorSidePanelSectionImpact {...impact} sectionId="impact" />
        <KnowledgeEditorSidePanelSectionRelatedTickets
            {...relatedTickets}
            sectionId="related-tickets"
        />
    </KnowledgeEditorSidePanel>
)
