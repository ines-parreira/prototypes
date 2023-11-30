import React, {useCallback, useMemo} from 'react'

import Label from 'pages/common/forms/Label/Label'
import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'

import {TextReplyNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import MessageContentFormField from '../components/MessageContentFormField'
import SupportedChannelsWarning from '../components/SupportedChannelsWarning'

import css from './NodeEditor.less'

export default function TextReplyEditor({
    nodeInEdition,
}: {
    nodeInEdition: TextReplyNodeType
}) {
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const {previewLanguage} = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_TEXT_REPLY_CONTENT',
                textReplyNodeId: nodeInEdition.id,
                content,
            })
        },
        [dispatch, nodeInEdition.id]
    )
    const workflowVariables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )
    return (
        <div className={css.container}>
            <SupportedChannelsWarning nodeType={nodeInEdition.type} />
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
                </Label>
                <div className={css.withDescription}>
                    <MessageContentFormField
                        content={nodeInEdition.data.content}
                        handleUpdateContent={handleUpdateContent}
                        workflowVariables={workflowVariables}
                    />
                    <div className={css.description}>
                        After the prompt, customers can type a reply of up to
                        5,000 characters
                    </div>
                </div>
            </div>
            {previewLanguage && (
                <>
                    <TranslationPreviewHeader />
                    <div className={css.formField}>
                        <Label className={css.labelDisabled}>Message</Label>
                        <TranslationsPreviewField
                            nodeId={nodeInEdition.id}
                            tkey={nodeInEdition.data.content.text_tkey ?? ''}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
