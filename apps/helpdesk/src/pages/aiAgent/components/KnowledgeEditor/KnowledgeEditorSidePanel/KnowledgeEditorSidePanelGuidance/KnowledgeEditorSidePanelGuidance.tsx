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
    Props as GuidanceDetailsProps,
    KnowledgeEditorSidePanelSectionGuidanceDetails,
} from './KnowledgeEditorSidePanelSectionGuidanceDetails'

type Props = {
    details: Omit<GuidanceDetailsProps, 'sectionId'>
    impact: Omit<ImpactProps, 'sectionId'>
    relatedTickets: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelGuidance = ({
    details,
    impact,
    relatedTickets,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={['details', 'impact', 'related-tickets']}
    >
        <KnowledgeEditorSidePanelSectionGuidanceDetails
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
