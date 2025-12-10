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
                {
                    left: 'Type',
                    right: (
                        <KnowledgeEditorSidePanelFieldKnowledgeType
                            key="type"
                            type="url-snippet"
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
                    left: 'Source URL',
                    right: (
                        <KnowledgeEditorSidePanelFieldURL
                            url={props.url}
                            key="source-url"
                        />
                    ),
                },
            ]}
        />
    </KnowledgeEditorSidePanelSection>
)
