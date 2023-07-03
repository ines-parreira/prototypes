import React from 'react'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'

import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function AutomatedMessageEditor({
    nodeInEdition,
}: {
    nodeInEdition: AutomatedMessageNodeType
}) {
    const {dispatch} = useWorkflowEditorContext()
    const handleUpdateContent = (content: MessageContent) => {
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: nodeInEdition.id,
            content,
        })
    }

    return (
        <div className={css.container}>
            <Label className={css.title}>Automated answer</Label>
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                />
            </div>
        </div>
    )
}
