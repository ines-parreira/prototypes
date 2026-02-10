import type { JSX } from 'react'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import type { Props as ImpactProps } from '../KnowledgeEditorSidePanelSectionImpact'
import { KnowledgeEditorSidePanelSectionImpact } from '../KnowledgeEditorSidePanelSectionImpact'
import type { Props as RecentTicketsProps } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import { KnowledgeEditorSidePanelSectionRecentTickets } from '../KnowledgeEditorSidePanelSectionRecentTickets'
import type { Props as DocumentSnippetDetailsProps } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'
import { KnowledgeEditorSidePanelSectionDocumentSnippetDetails } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'

type Props = {
    details: Omit<DocumentSnippetDetailsProps, 'sectionId'>
    impact?: Omit<ImpactProps, 'sectionId'>
    recentTickets?: Omit<RecentTicketsProps, 'sectionId'>
}

export const KnowledgeEditorSidePanelDocumentSnippet = ({
    details,
    impact,
    recentTickets,
}: Props): JSX.Element => {
    const initialExpandedSections: string[] = [
        'details',
        'impact',
        'related-tickets',
    ]

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
        >
            <KnowledgeEditorSidePanelSectionDocumentSnippetDetails
                {...details}
                sectionId="details"
            />

            <KnowledgeEditorSidePanelSectionImpact
                {...impact}
                sectionId="impact"
            />

            <KnowledgeEditorSidePanelSectionRecentTickets
                {...recentTickets}
                sectionId="related-tickets"
            />
        </KnowledgeEditorSidePanel>
    )
}
