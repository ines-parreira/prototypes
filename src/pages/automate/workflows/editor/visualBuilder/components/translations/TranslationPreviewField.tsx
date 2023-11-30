import React, {useCallback, useEffect, useMemo} from 'react'
import classNames from 'classnames'
import {CompositeDecorator, Editor, EditorState} from 'draft-js'

import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {contentStateFromTextOrHTML} from 'utils/editor'

import {getWorkflowVariableListForNode} from '../../../../models/variables.model'
import createWorkflowVariablesPlugin from '../../../../draftjs/plugins/variables'

import 'draft-js/dist/Draft.css'
import css from './TranslationPreviewField.less'

type Props = {
    tkey: string
    nodeId: string
}

export default function TranslationsPreviewField({nodeId, tkey}: Props) {
    const {translateKey} = useWorkflowEditorContext()
    const {previewLanguageList, previewLanguage, translatedGraph} =
        useTranslationsPreviewContext()
    const workflowVariables = useMemo(
        () => getWorkflowVariableListForNode(translatedGraph, nodeId),
        [translatedGraph, nodeId]
    )
    const workflowsVariablesPlugin = useMemo(
        () => createWorkflowVariablesPlugin(),
        []
    )
    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty(
            new CompositeDecorator(workflowsVariablesPlugin.decorators as any)
        )
    )
    const translatedText = useMemo(() => {
        return previewLanguage ? translateKey(tkey, previewLanguage) : ''
    }, [previewLanguage, tkey, translateKey])
    const onChange = useCallback(
        (editorState: EditorState) => {
            setEditorState(workflowsVariablesPlugin.onChange(editorState))
        },
        [workflowsVariablesPlugin]
    )
    useEffect(() => {
        const newEditorState = EditorState.createWithContent(
            contentStateFromTextOrHTML(translatedText),
            new CompositeDecorator(workflowsVariablesPlugin.decorators as any)
        )
        setEditorState(workflowsVariablesPlugin.onChange(newEditorState))
    }, [translatedText, workflowsVariablesPlugin])

    if (previewLanguageList.length === 0 || previewLanguage == null) return null
    return (
        <div className={css.previewField}>
            <div className={classNames(css.editor, css.readOnly)}>
                <ToolbarProvider workflowVariables={workflowVariables}>
                    <Editor
                        editorState={editorState}
                        onChange={onChange}
                        readOnly
                    />
                </ToolbarProvider>
            </div>
        </div>
    )
}
