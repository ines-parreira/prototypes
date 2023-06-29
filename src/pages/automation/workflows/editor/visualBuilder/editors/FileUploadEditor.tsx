import React from 'react'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'

import {FileUploadNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function FileUploadEditor({
    nodeInEdition,
}: {
    nodeInEdition: FileUploadNodeType
}) {
    const {dispatch} = useWorkflowEditorContext()
    const handleUpdateContent = (content: MessageContent) => {
        dispatch({
            type: 'SET_FILE_UPLOAD_CONTENT',
            fileUploadNodeId: nodeInEdition.id,
            content,
        })
    }
    return (
        <div className={css.container}>
            <Label className={css.title}>File upload</Label>
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Prompt
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                />
                <div className={css.helperText}>
                    After the prompt, customers can upload up to 5 files
                </div>
            </div>
        </div>
    )
}
