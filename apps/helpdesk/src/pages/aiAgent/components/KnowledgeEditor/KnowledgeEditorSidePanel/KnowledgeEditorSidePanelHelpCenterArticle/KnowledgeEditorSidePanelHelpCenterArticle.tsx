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
    KnowledgeEditorSidePanelSectionHelpCenterArticleDetails,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import {
    Props as HelpCenterArticleEngagementProps,
    KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement'

type Props = {
    details: Omit<GuidanceDetailsProps, 'sectionId'>
    impact: Omit<ImpactProps, 'sectionId'>
    relatedTickets: Omit<RelatedTicketsProps, 'sectionId'>
    engagement: Omit<HelpCenterArticleEngagementProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelHelpCenterArticle = ({
    details,
    impact,
    relatedTickets,
    engagement,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={[
            'details',
            'impact',
            'related-tickets',
            'engagement',
        ]}
    >
        <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
            {...details}
            sectionId="details"
        />
        <KnowledgeEditorSidePanelSectionImpact {...impact} sectionId="impact" />
        <KnowledgeEditorSidePanelSectionRelatedTickets
            {...relatedTickets}
            sectionId="related-tickets"
        />
        <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
            {...engagement}
            sectionId="engagement"
        />
    </KnowledgeEditorSidePanel>
)
