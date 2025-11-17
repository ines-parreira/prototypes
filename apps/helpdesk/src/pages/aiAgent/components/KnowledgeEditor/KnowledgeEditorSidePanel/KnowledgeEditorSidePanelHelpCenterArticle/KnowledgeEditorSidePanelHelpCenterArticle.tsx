import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as HelpCenterArticleDetailsProps } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import type { Props as HelpCenterArticleImpactProps } from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleImpact } from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact'
import type { Props as HelpCenterArticleSettingsProps } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

type Props = {
    details: Omit<HelpCenterArticleDetailsProps, 'sectionId'>
    impact?: Omit<HelpCenterArticleImpactProps, 'sectionId'>
    settings: Omit<HelpCenterArticleSettingsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelHelpCenterArticle = ({
    details,
    impact,
    settings,
}: Props) => {
    const initialExpandedSections = impact
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
                <KnowledgeEditorSidePanelSectionHelpCenterArticleImpact
                    {...impact}
                    sectionId="impact"
                />
            )}

            <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings
                {...settings}
                sectionId="settings"
            />
        </KnowledgeEditorSidePanel>
    )
}
