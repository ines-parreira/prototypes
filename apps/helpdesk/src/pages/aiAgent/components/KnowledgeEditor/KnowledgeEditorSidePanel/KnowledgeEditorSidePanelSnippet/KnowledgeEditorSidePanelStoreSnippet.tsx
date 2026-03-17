import type { JSX } from 'react'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelBackendIds } from '../KnowledgeEditorSidePanelBackendIds'
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
    snippetId?: number
    helpCenterId?: number
    locale?: string
    executionId?: string
}

export const KnowledgeEditorSidePanelStoreSnippet = ({
    details,
    impact,
    recentTickets,
    snippetId,
    helpCenterId,
    locale,
    executionId,
}: Props): JSX.Element => {
    const initialExpandedSections: string[] = [
        'details',
        'impact',
        'related-tickets',
    ]

    const backendIds: Record<string, string | number> = {}
    if (snippetId) {
        backendIds['Snippet ID (SourceId)'] = snippetId
    }
    if (helpCenterId) {
        backendIds['Help Center ID (SourceSetId)'] = helpCenterId
    }
    if (locale) {
        backendIds['Locale'] = locale
    }
    if (executionId) {
        backendIds['Execution ID'] = executionId
    }

    return (
        <KnowledgeEditorSidePanel
            initialExpandedSections={initialExpandedSections}
            footer={<KnowledgeEditorSidePanelBackendIds ids={backendIds} />}
        >
            <KnowledgeEditorSidePanelSectionStoreSnippetDetails
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
