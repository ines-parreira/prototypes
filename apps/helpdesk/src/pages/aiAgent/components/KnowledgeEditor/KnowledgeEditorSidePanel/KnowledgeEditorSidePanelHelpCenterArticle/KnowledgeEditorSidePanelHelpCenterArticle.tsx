import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as HelpCenterArticleRelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as HelpCenterArticleDetailsProps } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import type { Props as HelpCenterArticleSettingsProps } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

type Props = {
    details: Omit<HelpCenterArticleDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    relatedTickets?: Omit<HelpCenterArticleRelatedTicketsProps, 'sectionId'>
    settings: Omit<HelpCenterArticleSettingsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelHelpCenterArticle = ({
    details,
    impact,
    relatedTickets,
    settings,
}: Props) => {
    const initialExpandedSections =
        impact && relatedTickets
            ? ['details', 'impact', 'relatedTickets', 'settings']
            : impact
              ? ['details', 'impact', 'settings']
              : ['details', 'settings']

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
        >
            <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
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
                    sectionId="relatedTickets"
                />
            )}

            <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings
                {...settings}
                sectionId="settings"
            />
        </KnowledgeEditorSidePanel>
    )
}
