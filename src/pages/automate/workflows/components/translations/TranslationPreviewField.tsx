import React, {useCallback, useEffect, useMemo} from 'react'
import classNames from 'classnames'
import {CompositeDecorator, Editor, EditorState} from 'draft-js'

import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {contentStateFromTextOrHTML} from 'utils/editor'

import {getAvailableFlowVariableListForNode} from '../../models/variables.model'
import createFlowVariablesPlugin from '../../draftjs/plugins/variables'

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
    const availableFlowVariables = useMemo(
        () => getAvailableFlowVariableListForNode(translatedGraph, nodeId),
        [translatedGraph, nodeId]
    )
    const flowsVariablesPlugin = useMemo(() => createFlowVariablesPlugin(), [])
    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty(
            new CompositeDecorator(flowsVariablesPlugin.decorators as any)
        )
    )
    const translatedText = useMemo(() => {
        return previewLanguage ? translateKey(tkey, previewLanguage) : ''
    }, [previewLanguage, tkey, translateKey])
    const onChange = useCallback(
        (editorState: EditorState) => {
            setEditorState(flowsVariablesPlugin.onChange(editorState))
        },
        [flowsVariablesPlugin]
    )
    useEffect(() => {
        const newEditorState = EditorState.createWithContent(
            contentStateFromTextOrHTML(translatedText),
            new CompositeDecorator(flowsVariablesPlugin.decorators as any)
        )
        setEditorState(flowsVariablesPlugin.onChange(newEditorState))
    }, [translatedText, flowsVariablesPlugin])

    if (previewLanguageList.length === 0 || previewLanguage == null) return null
    return (
        <div className={css.previewField}>
            <div className={classNames(css.editor, css.readOnly)}>
                <ToolbarProvider
                    availableFlowVariables={availableFlowVariables}
                >
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
