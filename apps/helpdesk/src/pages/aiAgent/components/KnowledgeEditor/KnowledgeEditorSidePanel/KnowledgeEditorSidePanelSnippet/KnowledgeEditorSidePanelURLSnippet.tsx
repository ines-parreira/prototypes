import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as URLSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionURLSnippetDetails'
import { KnowledgeEditorSidePanelSectionURLSnippetDetails } from './KnowledgeEditorSidePanelSectionURLSnippetDetails'

type Props = {
    details: Omit<URLSnippetDetailsProps, 'sectionId'>
    impact: Omit<ImpactProps, 'sectionId'>
    relatedTickets: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelURLSnippet = ({
    details,
    impact,
    relatedTickets,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={['details', 'impact', 'related-tickets']}
    >
        <KnowledgeEditorSidePanelSectionURLSnippetDetails
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
