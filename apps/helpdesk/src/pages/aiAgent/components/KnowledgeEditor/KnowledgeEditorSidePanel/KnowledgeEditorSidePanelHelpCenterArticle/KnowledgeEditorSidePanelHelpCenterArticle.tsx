import { useArticleContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import {
    useArticleEngagementFromContext,
    useArticleImpactFromContext,
    useArticleRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'
import { AddMissingKnowledgeCheckbox } from 'pages/tickets/detail/components/AIAgentFeedbackBar/AddMissingKnowledgeCheckbox'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelBackendIds } from '../KnowledgeEditorSidePanelBackendIds'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement } from './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

import sidePanelCss from '../KnowledgeEditorSidePanel.less'

export const KnowledgeEditorSidePanelHelpCenterArticle = () => {
    const impact = useArticleImpactFromContext()
    const engagement = useArticleEngagementFromContext()
    const recentTickets = useArticleRecentTicketsFromContext()
    const {
        state,
        config,
        shouldAddToMissingKnowledge = true,
        setShouldAddToMissingKnowledge,
    } = useArticleContext()
    const { showMissingKnowledgeCheckbox = false } = config

    const initialExpandedSections: string[] = [
        'details',
        'impact',
        'engagement',
        'recentTickets',
        'settings',
    ]

    const backendIds: Record<string, string | number> = {}
    if (state.article?.id) {
        backendIds['Article ID (SourceId)'] = state.article.id
    }
    if (config.helpCenter?.id) {
        backendIds['Help Center ID (SourceSetId)'] = config.helpCenter.id
    }
    if (state.currentLocale) {
        backendIds['Locale'] = state.currentLocale
    }
    if (state.article?.translation?.published_version_id) {
        backendIds['Published Version ID'] =
            state.article.translation.published_version_id
    }
    if (state.article?.translation?.draft_version_id) {
        backendIds['Draft Version ID'] =
            state.article.translation.draft_version_id
    }

    const isCreateMode = state.articleMode === 'create'

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
            footer={
                <>
                    {isCreateMode && showMissingKnowledgeCheckbox ? (
                        <div className={sidePanelCss.footer}>
                            <AddMissingKnowledgeCheckbox
                                isChecked={shouldAddToMissingKnowledge}
                                onChange={(checked) =>
                                    setShouldAddToMissingKnowledge?.(checked)
                                }
                            />
                        </div>
                    ) : null}
                    <KnowledgeEditorSidePanelBackendIds ids={backendIds} />
                </>
            }
        >
            <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />

            <KnowledgeEditorSidePanelSectionImpact
                {...impact}
                sectionId="impact"
            />

            <KnowledgeEditorSidePanelSectionRecentTickets
                {...recentTickets}
                sectionId="recentTickets"
            />

            <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                {...engagement}
                sectionId="engagement"
            />

            <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings sectionId="settings" />
        </KnowledgeEditorSidePanel>
    )
}
