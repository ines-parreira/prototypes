import React, {useCallback, useMemo} from 'react'
import {MessageContent} from 'pages/automate/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {getWorkflowVariableListForNode} from 'pages/automate/workflows/models/variables.model'
import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'

import {AutomatedMessageNodeType} from '../../../models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import MessageContentFormField from '../components/MessageContentFormField'

import css from './NodeEditor.less'

export default function AutomatedMessageEditor({
    nodeInEdition,
}: {
    nodeInEdition: AutomatedMessageNodeType
}) {
    const {dispatch, visualBuilderGraph} = useWorkflowEditorContext()
    const {previewLanguage} = useTranslationsPreviewContext()
    const handleUpdateContent = useCallback(
        (content: MessageContent) => {
            dispatch({
                type: 'SET_AUTOMATED_MESSAGE_CONTENT',
                automatedMessageNodeId: nodeInEdition.id,
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
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                    workflowVariables={workflowVariables}
                />
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
