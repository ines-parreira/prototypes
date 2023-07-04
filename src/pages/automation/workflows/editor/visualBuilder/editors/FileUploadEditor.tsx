import React from 'react'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'

import {FileUploadNodeType} from '../../../models/visualBuilderGraph.types'
import MessageContentFormField from '../components/MessageContentFormField'
import SupportedChannelsWarning from '../components/SupportedChannelsWarning'

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
            <SupportedChannelsWarning nodeType={nodeInEdition.type} />
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
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
