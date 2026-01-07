import type { JSX } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as URLSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionURLSnippetDetails'
import { KnowledgeEditorSidePanelSectionURLSnippetDetails } from './KnowledgeEditorSidePanelSectionURLSnippetDetails'

type Props = {
    details: Omit<URLSnippetDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    relatedTickets?: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelURLSnippet = ({
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
            <KnowledgeEditorSidePanelSectionURLSnippetDetails
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
