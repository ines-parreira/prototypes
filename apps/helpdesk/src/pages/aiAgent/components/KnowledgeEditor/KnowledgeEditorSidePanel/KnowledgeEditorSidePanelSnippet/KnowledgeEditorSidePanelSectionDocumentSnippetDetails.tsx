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
                [
                    'Type',
                    <KnowledgeEditorSidePanelFieldKnowledgeType
                        key="type"
                        type="document-snippet"
                    />,
                ],
                [
                    'In use by AI Agent',
                    <KnowledgeEditorSidePanelFieldAIAgentStatus
                        key="ai-agent-status"
                        checked={props.aiAgentStatus.value}
                        className={css.extraLeftMargin}
                        onChange={props.aiAgentStatus.onChange}
                    />,
                ],
                [
                    'Created',
                    <KnowledgeEditorSidePanelFieldDateField
                        date={props.createdDatetime}
                        key="created"
                    />,
                ],
                [
                    'Last updated',
                    <KnowledgeEditorSidePanelFieldDateField
                        date={props.lastUpdatedDatetime}
                        key="last-updated"
                    />,
                ],
                [
                    'Source document',
                    <KnowledgeEditorSidePanelFieldSourceDocument
                        sourceDocument={{
                            label: props.sourceDocument,
                            downloadUrl: props.googleStorageUrl,
                        }}
                        key="source-document"
                    />,
                ],
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)
