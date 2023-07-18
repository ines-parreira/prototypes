import React from 'react'
import {MessageContent} from 'pages/automation/workflows/models/workflowConfiguration.types'
import Label from 'pages/common/forms/Label/Label'
import {useTranslationsPreviewContext} from 'pages/automation/workflows/hooks/useTranslationsPreviewContext'
import TranslationPreviewHeader from 'pages/automation/workflows/components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from 'pages/automation/workflows/components/translations/TranslationPreviewField'

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
    const {previewLanguage} = useTranslationsPreviewContext()
    const handleUpdateContent = (content: MessageContent) => {
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            automatedMessageNodeId: nodeInEdition.id,
            content,
        })
    }

    return (
        <div className={css.container}>
            <div className={css.formField}>
                <Label className={css.label} isRequired={true}>
                    Message
                </Label>
                <MessageContentFormField
                    content={nodeInEdition.data.content}
                    handleUpdateContent={handleUpdateContent}
                />
            </div>
            {previewLanguage && (
                <>
                    <TranslationPreviewHeader />
                    <div className={css.formField}>
                        <Label className={css.labelDisabled}>Message</Label>
                        <TranslationsPreviewField
                            tkey={nodeInEdition.data.content.text_tkey ?? ''}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
