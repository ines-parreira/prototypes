import React, {useCallback, useMemo} from 'react'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'
import {useTranslationsPreviewContext} from 'pages/automation/workflows/hooks/useTranslationsPreviewContext'
import TranslationPreviewHeader from 'pages/automation/workflows/components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from 'pages/automation/workflows/components/translations/TranslationPreviewField'
import {getAvailableFlowVariableListForNode} from 'pages/automation/workflows/models/variables.model'

import {FileUploadNodeType} from '../../../models/visualBuilderGraph.types'
import MessageContentFormField from '../components/MessageContentFormField'
import SupportedChannelsWarning from '../components/SupportedChannelsWarning'

import css from './NodeEditor.less'

export default function FileUploadEditor({
    nodeInEdition,
}: {
    nodeInEdition: FileUploadNodeType
}) {
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const {previewLanguage} = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_FILE_UPLOAD_CONTENT',
                fileUploadNodeId: nodeInEdition.id,
                content,
            })
        },
        [dispatch, nodeInEdition.id]
    )
    const availableFlowVariables = useMemo(
        () =>
            getAvailableFlowVariableListForNode(
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
                        availableFlowVariables={availableFlowVariables}
                    />
                    <div className={css.description}>
                        After the prompt, customers can upload up to 5 files
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
