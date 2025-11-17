import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as StoreSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'
import { KnowledgeEditorSidePanelSectionStoreSnippetDetails } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'

type Props = {
    details: Omit<StoreSnippetDetailsProps, 'sectionId'>
    impact: Omit<ImpactProps, 'sectionId'>
    relatedTickets: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelStoreSnippet = ({
    details,
    impact,
    relatedTickets,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={['details', 'impact', 'related-tickets']}
    >
        <KnowledgeEditorSidePanelSectionStoreSnippetDetails
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
