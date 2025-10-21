import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

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
import { Props as HelpCenterArticleSettingsProps } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

type Props = {
    details: Omit<GuidanceDetailsProps, 'sectionId'>
    impact: Omit<ImpactProps, 'sectionId'>
    relatedTickets: Omit<RelatedTicketsProps, 'sectionId'>
    engagement: Omit<HelpCenterArticleEngagementProps, 'sectionId'>
    settings: Omit<HelpCenterArticleSettingsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelHelpCenterArticle = ({
    details,
    impact,
    relatedTickets,
    engagement,
    settings,
}: Props) => (
    <KnowledgeEditorSidePanel
        initialExpandedSections={[
            'details',
            'impact',
            'related-tickets',
            'engagement',
            'settings',
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
        <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings
            {...settings}
            sectionId="settings"
        />
    </KnowledgeEditorSidePanel>
)
