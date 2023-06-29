import React from 'react'

import Label from 'pages/common/forms/Label/Label'
import {MultipleChoicesNodeType} from 'pages/automation/workflows/models/visualBuilderGraph.types'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'

import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import ReplyButtonList from '../nodes/MultipleChoicesNode/ReplyButtonList'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function MultipleChoicesEditor({
    nodeInEdition,
}: {
    nodeInEdition: MultipleChoicesNodeType
    onClose: () => void
}) {
    const {dispatch} = useWorkflowEditorContext()
    const handleUpdateContent = (content: MessageContent) => {
        dispatch({
            type: 'SET_MULTIPLE_CHOICES_CONTENT',
            multipleChoicesNodeId: nodeInEdition.id,
            content,
        })
    }
    const choices = nodeInEdition.data.choices ?? []

    return (
        <div className={css.container}>
            <Label className={css.title}>Multiple choice</Label>
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Question
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                />
            </div>
            <div className={css.formField}>
                <Label className={css.label}>Reply buttons</Label>
                <ReplyButtonList
                    nodeId={nodeInEdition.id}
                    choices={choices}
                    onReorderChoices={(orderedEventIds) => {
                        dispatch({
                            type: 'REORDER_CHOICES',
                            multipleChoicesNodeId: nodeInEdition.id,
                            orderedEventIds,
                        })
                    }}
                    onChangeChoiceLabel={(eventId, label) => {
                        dispatch({
                            type: 'SET_CHOICE_LABEL',
                            multipleChoicesNodeId: nodeInEdition.id,
                            eventId,
                            label,
                        })
                    }}
                    onAddChoice={() => {
                        dispatch({
                            type: 'ADD_MULTIPLE_CHOICES_CHOICE',
                            multipleChoicesNodeId: nodeInEdition.id,
                        })
                    }}
                />
            </div>
        </div>
    )
}
