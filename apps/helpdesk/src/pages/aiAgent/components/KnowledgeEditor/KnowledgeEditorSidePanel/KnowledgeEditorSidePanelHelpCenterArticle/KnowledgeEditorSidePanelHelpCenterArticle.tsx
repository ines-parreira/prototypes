import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import {
    Props as HelpCenterArticleDetailsProps,
    KnowledgeEditorSidePanelSectionHelpCenterArticleDetails,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import {
    Props as HelpCenterArticleImpactProps,
    KnowledgeEditorSidePanelSectionHelpCenterArticleImpact,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleImpact'
import {
    Props as HelpCenterArticleSettingsProps,
    KnowledgeEditorSidePanelSectionHelpCenterArticleSettings,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

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
