import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as GuidanceDetailsProps } from './KnowledgeEditorSidePanelSectionGuidanceDetails'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

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
