import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldURL,
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
    url: string
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionURLSnippetDetails = (
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
                        type="url-snippet"
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
                    'Source URL',
                    <KnowledgeEditorSidePanelFieldURL
                        url={props.url}
                        key="source-url"
                    />,
                ],
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)
