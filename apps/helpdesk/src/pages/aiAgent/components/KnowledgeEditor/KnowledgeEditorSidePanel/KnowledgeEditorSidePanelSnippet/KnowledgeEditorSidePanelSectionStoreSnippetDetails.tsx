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
                    {
                        left: 'Type',
                        right: (
                            <KnowledgeEditorSidePanelFieldKnowledgeType
                                key="type"
                                type="store-snippet"
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
                ]}
            />
            <KnowledgeEditorSidePanelFieldURLsList
                urls={props.urls}
                key="source-urls"
            />
        </div>
    </KnowledgeEditorSidePanelSection>
)
