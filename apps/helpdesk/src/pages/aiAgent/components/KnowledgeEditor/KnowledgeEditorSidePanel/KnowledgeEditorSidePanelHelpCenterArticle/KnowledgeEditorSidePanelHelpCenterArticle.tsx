import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import {
    Props as HelpCenterArticleDetailsProps,
    KnowledgeEditorSidePanelSectionHelpCenterArticleDetails,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import {
    Props as HelpCenterArticleSettingsProps,
    KnowledgeEditorSidePanelSectionHelpCenterArticleSettings,
} from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

type Props = {
    details: Omit<HelpCenterArticleDetailsProps, 'sectionId'>
    settings: Omit<HelpCenterArticleSettingsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelHelpCenterArticle = ({
    details,
    settings,
}: Props) => (
    <KnowledgeEditorSidePanel initialExpandedSections={['details', 'settings']}>
        <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails
            {...details}
            sectionId="details"
        />

        <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings
            {...settings}
            sectionId="settings"
        />
    </KnowledgeEditorSidePanel>
)
