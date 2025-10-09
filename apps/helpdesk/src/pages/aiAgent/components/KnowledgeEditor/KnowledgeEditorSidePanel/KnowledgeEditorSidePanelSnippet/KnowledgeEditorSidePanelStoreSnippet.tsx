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
    KnowledgeEditorSidePanelSectionStoreSnippetDetails,
    Props as StoreSnippetDetailsProps,
} from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'

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
