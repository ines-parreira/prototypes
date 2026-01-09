import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    useArticleEngagementFromContext,
    useArticleImpactFromContext,
    useArticleRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleDetails } from './KnowledgeEditorSidePanelSectionHelpCenterArticleDetails'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement } from './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement'
import { KnowledgeEditorSidePanelSectionHelpCenterArticleSettings } from './KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

export const KnowledgeEditorSidePanelHelpCenterArticle = () => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const impact = useArticleImpactFromContext()
    const engagement = useArticleEngagementFromContext()
    const recentTickets = useArticleRecentTicketsFromContext()

    const initialExpandedSections: string[] = [
        'details',
        ...(isPerformanceStatsEnabled
            ? ['impact', 'engagement', 'recentTickets']
            : []),
        'settings',
    ]

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
        >
            <KnowledgeEditorSidePanelSectionHelpCenterArticleDetails sectionId="details" />

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionImpact
                    {...impact}
                    sectionId="impact"
                />
            )}

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionRecentTickets
                    {...recentTickets}
                    sectionId="recentTickets"
                />
            )}

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement
                    {...engagement}
                    sectionId="engagement"
                />
            )}

            <KnowledgeEditorSidePanelSectionHelpCenterArticleSettings sectionId="settings" />
        </KnowledgeEditorSidePanel>
    )
}
