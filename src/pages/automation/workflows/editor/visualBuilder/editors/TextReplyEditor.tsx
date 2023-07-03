import React from 'react'

import Label from 'pages/common/forms/Label/Label'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {
    getChannelName,
    useWorkflowChannelSupportContext,
} from 'pages/automation/workflows/hooks/useWorkflowChannelSupport'

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
    const {getUnsupportedChannels} = useWorkflowChannelSupportContext()
    const unsupportedChannels =
        getUnsupportedChannels('text_reply').map(getChannelName)
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
            {unsupportedChannels.length > 0 && (
                <Alert type={AlertType.Warning} icon={AlertType.Warning}>
                    This step is currently not supported for{' '}
                    {unsupportedChannels.join(' and ')}. If you use it, you
                    won't be able to activate this flow there.
                </Alert>
            )}
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
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
