import React from 'react'

import Label from 'pages/common/forms/Label/Label'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'

import {TextReplyNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function TextReplyEditor({
    nodeInEdition,
}: {
    nodeInEdition: TextReplyNodeType
}) {
    const {dispatch} = useWorkflowEditorContext()
    const handleUpdateContent = (content: MessageContent) => {
        dispatch({
            type: 'SET_TEXT_REPLY_CONTENT',
            textReplyNodeId: nodeInEdition.id,
            content,
        })
    }
    return (
        <div className={css.container}>
            <Label className={css.title}>Text reply</Label>
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Prompt
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                />
                <div className={css.helperText}>
                    After the prompt, customers can type a reply of up to 5,000
                    characters
                </div>
            </div>
        </div>
    )
}
