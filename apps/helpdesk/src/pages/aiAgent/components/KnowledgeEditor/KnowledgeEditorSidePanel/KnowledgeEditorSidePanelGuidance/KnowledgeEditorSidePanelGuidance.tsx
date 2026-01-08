import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    useGuidanceImpactFromContext,
    useGuidanceRelatedTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

export const KnowledgeEditorSidePanelGuidance = () => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )
    const impact = useGuidanceImpactFromContext()
    const relatedTickets = useGuidanceRelatedTicketsFromContext()

    const initialExpandedSections: string[] = [
        'details',
        ...(isPerformanceStatsEnabled ? ['impact', 'related-tickets'] : []),
    ]

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
        >
            <KnowledgeEditorSidePanelSectionGuidanceDetails sectionId="details" />

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionImpact
                    {...impact}
                    sectionId="impact"
                />
            )}

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    {...relatedTickets}
                    sectionId="related-tickets"
                />
            )}
        </KnowledgeEditorSidePanel>
    )
}
