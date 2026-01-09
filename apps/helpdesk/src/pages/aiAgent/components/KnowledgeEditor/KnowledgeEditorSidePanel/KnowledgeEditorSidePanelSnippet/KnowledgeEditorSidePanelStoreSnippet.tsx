import type { JSX } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RecentTicketsProps } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import type { Props as StoreSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'
import { KnowledgeEditorSidePanelSectionStoreSnippetDetails } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'

type Props = {
    details: Omit<StoreSnippetDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    recentTickets?: Omit<RecentTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelStoreSnippet = ({
    details,
    impact,
    recentTickets,
}: Props): JSX.Element => {
    const isPerformanceStatsEnabled = useFlag(
        FeatureFlagKey.PerformanceStatsOnIndividualKnowledge,
    )

    const initialExpandedSections: string[] = [
        'details',
        ...(isPerformanceStatsEnabled ? ['impact', 'related-tickets'] : []),
    ]

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
        >
            <KnowledgeEditorSidePanelSectionStoreSnippetDetails
                {...details}
                sectionId="details"
            />

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionImpact
                    {...impact}
                    sectionId="impact"
                />
            )}

            {isPerformanceStatsEnabled && (
                <KnowledgeEditorSidePanelSectionRecentTickets
                    {...recentTickets}
                    sectionId="related-tickets"
                />
            )}
        </KnowledgeEditorSidePanel>
    )
}
