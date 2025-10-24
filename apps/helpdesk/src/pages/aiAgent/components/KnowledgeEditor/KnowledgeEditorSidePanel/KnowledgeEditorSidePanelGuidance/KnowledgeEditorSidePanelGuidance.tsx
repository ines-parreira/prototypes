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
    impact?: Omit<ImpactProps, 'sectionId'>
    relatedTickets?: Omit<RelatedTicketsProps, 'sectionId'>
    className?: string
}

export const KnowledgeEditorSidePanelGuidance = ({
    details,
    impact,
    relatedTickets,
    className,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={['details', 'impact', 'related-tickets']}
        className={className}
    >
        <KnowledgeEditorSidePanelSectionGuidanceDetails
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
