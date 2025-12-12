import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldStatus,
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
    isDraft?: boolean
}

export const KnowledgeEditorSidePanelSectionGuidanceDetails = (
    props: Props,
) => {
    const columns = [
        {
            left: 'Type',
            right: (
                <KnowledgeEditorSidePanelFieldKnowledgeType
                    key="type"
                    type="guidance"
                />
            ),
        },
        ...(props.isDraft !== undefined
            ? [
                  {
                      left: 'Status',
                      right: (
                          <KnowledgeEditorSidePanelFieldStatus
                              key="status"
                              isDraft={props.isDraft}
                          />
                      ),
                  },
              ]
            : []),
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
    ]

    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: 'Details' }}
            sectionId={props.sectionId}
        >
            <KnowledgeEditorSidePanelTwoColumnsContent columns={columns} />
        </KnowledgeEditorSidePanelSection>
    )
}
