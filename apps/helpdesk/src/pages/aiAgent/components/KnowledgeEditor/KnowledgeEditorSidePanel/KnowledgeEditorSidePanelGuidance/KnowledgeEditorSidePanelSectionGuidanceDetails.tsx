import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
} from '../KnowledgeEditorSidePanelCommonFields'
import { KnowledgeEditorSidePanelSection } from '../KnowledgeEditorSidePanelSection'
import { KnowledgeEditorSidePanelTwoColumnsContent } from '../KnowledgeEditorSidePanelTwoColumnsContent'

import css from '../KnowledgeEditorSidePanelCommonFields.less'

export type Props = {
    aiAgentStatus: {
        value: boolean
        onChange: (value: boolean) => void
    }
    createdDatetime?: Date
    lastUpdatedDatetime?: Date
    sectionId: string
    isUpdating: boolean
}

export const KnowledgeEditorSidePanelSectionGuidanceDetails = (
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
                            type="guidance"
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
                            isDisabled={props.isUpdating}
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
    </KnowledgeEditorSidePanelSection>
)
