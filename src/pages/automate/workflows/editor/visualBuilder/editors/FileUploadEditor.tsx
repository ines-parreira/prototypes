import React, {useCallback, useMemo} from 'react'

import {Drawer} from 'pages/common/components/Drawer'
import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import {FileUploadNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'
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
    const workflowVariables = useMemo(
        () =>
            getWorkflowVariableListForNode(
                visualBuilderGraph,
                nodeInEdition.id
            ),
        [visualBuilderGraph, nodeInEdition.id]
    )
    return (
        <Drawer.Content>
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
                                tkey={
                                    nodeInEdition.data.content.text_tkey ?? ''
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </Drawer.Content>
    )
}
