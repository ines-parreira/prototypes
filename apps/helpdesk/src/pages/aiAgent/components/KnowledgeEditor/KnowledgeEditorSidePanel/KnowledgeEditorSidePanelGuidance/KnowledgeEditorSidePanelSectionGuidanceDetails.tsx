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
                [
                    'Type',
                    <KnowledgeEditorSidePanelFieldKnowledgeType
                        key="type"
                        type="guidance"
                    />,
                ],
                [
                    'In use by AI Agent',
                    <KnowledgeEditorSidePanelFieldAIAgentStatus
                        key="ai-agent-status"
                        checked={props.aiAgentStatus.value}
                        className={css.extraLeftMargin}
                        onChange={props.aiAgentStatus.onChange}
                        isDisabled={props.isUpdating}
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
    </KnowledgeEditorSidePanelSection>
)
