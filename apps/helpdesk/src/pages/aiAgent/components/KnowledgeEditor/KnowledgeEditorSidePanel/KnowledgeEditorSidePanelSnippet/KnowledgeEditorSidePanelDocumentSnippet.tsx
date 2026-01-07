import type { JSX } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RelatedTicketsProps } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import { KnowledgeEditorSidePanelSectionRelatedTickets } from '../KnowledgeEditorSidePanelSectionRelatedTickets'
import type { Props as DocumentSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'
import { KnowledgeEditorSidePanelSectionDocumentSnippetDetails } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'

type Props = {
    details: Omit<DocumentSnippetDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    relatedTickets?: Omit<RelatedTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelDocumentSnippet = ({
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
            <KnowledgeEditorSidePanelSectionDocumentSnippetDetails
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
