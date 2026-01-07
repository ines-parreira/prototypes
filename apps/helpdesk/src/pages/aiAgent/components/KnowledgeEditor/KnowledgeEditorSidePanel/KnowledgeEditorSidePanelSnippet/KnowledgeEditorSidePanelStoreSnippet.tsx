import type { JSX } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as StoreSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'
import { KnowledgeEditorSidePanelSectionStoreSnippetDetails } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'

type Props = {
    details: Omit<StoreSnippetDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    relatedTickets?: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelStoreSnippet = ({
    details,
    impact,
    relatedTickets,
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
                <KnowledgeEditorSidePanelSectionRelatedTickets
                    {...relatedTickets}
                    sectionId="related-tickets"
                />
            )}
        </KnowledgeEditorSidePanel>
    )
}
