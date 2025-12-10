import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldSourceDocument,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from '../KnowledgeEditorSidePanelCommonFields.less'

export type Props = {
    aiAgentStatus: {
        value: boolean
        onChange: (value: boolean) => void
    }
    createdDatetime: Date
    lastUpdatedDatetime: Date
    sourceDocument: string
    googleStorageUrl: string
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionDocumentSnippetDetails = (
    props: Props,
) => (
    <KnowledgeEditorSidePanelSection
        header={{ title: 'Details' }}
        sectionId={props.sectionId}
    >
        <KnowledgeEditorSidePanelTwoColumnsContent
            columns={[
                {
                    left: 'Type',
                    right: (
                        <KnowledgeEditorSidePanelFieldKnowledgeType
                            key="type"
                            type="document-snippet"
                        />
                    ),
                },
                {
                    left: 'In use by AI Agent',
                    right: (
                        <KnowledgeEditorSidePanelFieldAIAgentStatus
                            key="ai-agent-status"
                            checked={props.aiAgentStatus.value}
                            className={css.extraLeftMargin}
                            onChange={props.aiAgentStatus.onChange}
                        />
                    ),
                },
                {
                    left: 'Created',
                    right: (
                        <KnowledgeEditorSidePanelFieldDateField
                            date={props.createdDatetime}
                            key="created"
                        />
                    ),
                },
                {
                    left: 'Last updated',
                    right: (
                        <KnowledgeEditorSidePanelFieldDateField
                            date={props.lastUpdatedDatetime}
                            key="last-updated"
                        />
                    ),
                },
                {
                    left: 'Source document',
                    right: (
                        <KnowledgeEditorSidePanelFieldSourceDocument
                            sourceDocument={{
                                label: props.sourceDocument,
                                downloadUrl: props.googleStorageUrl,
                            }}
                            key="source-document"
                        />
                    ),
                },
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)
