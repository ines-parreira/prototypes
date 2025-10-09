import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'
import { KnowledgeEditorSidePanelFieldURLsList } from './KnowledgeEditorSidePanelFieldURLsList'

import css from './KnowledgeEditorSidePanelSectionStoreSnippetDetails.less'

export type Props = {
    aiAgentStatus: {
        value: boolean
        onChange: (value: boolean) => void
    }
    createdDatetime: Date
    lastUpdatedDatetime: Date
    urls: string[]
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionStoreSnippetDetails = (
    props: Props,
) => (
    <KnowledgeEditorSidePanelSection
        header={{ title: 'Details' }}
        sectionId={props.sectionId}
    >
        <div className={css.details}>
            <KnowledgeEditorSidePanelTwoColumnsContent
                columns={[
                    [
                        'Type',
                        <KnowledgeEditorSidePanelFieldKnowledgeType
                            key="type"
                            type="store-snippet"
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
                ]}
            />
            <KnowledgeEditorSidePanelFieldURLsList
                urls={props.urls}
                key="source-urls"
            />
        </div>
    </KnowledgeEditorSidePanelSection>
)
