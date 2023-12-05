import 'draft-js/dist/Draft.css'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ContentState, EditorState} from 'draft-js'
import Editor from 'draft-js-plugins-editor'

import classnames from 'classnames'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {contentStateFromTextOrHTML} from 'utils/editor'
import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import WorkflowVariablePicker from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariablePicker'
import {insertText} from 'utils'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'

import css from './TextareaWithVariables.less'

type Props = {
    value: string
    onChange: (value: string) => void
    variables?: WorkflowVariableList
    error?: string
}

const TextareaWithVariables = ({value, onChange, variables, error}: Props) => {
    const editorRef = useRef<Editor | null>()

    const plugins = useMemo(() => [createWorkflowVariablesPlugin()], [])

    const [editorState, setEditorState] = useState(() =>
        EditorState.createWithContent(contentStateFromTextOrHTML(value))
    )

    const handleChange = useCallback(
        (editorState: EditorState) => {
            let newEditorState = editorState

            editorRef.current?.resolvePlugins().forEach((plugin) => {
                if (plugin.onChange && editorRef.current) {
                    newEditorState = plugin.onChange(
                        newEditorState,
                        editorRef.current.getPluginMethods()
                    )
                }
            })

            setEditorState(newEditorState)

            onChange(newEditorState.getCurrentContent().getPlainText())
        },
        [onChange]
    )
    const handleVariableSelect = (value: string) => {
        const newEditorState = insertText(editorState, value)
        handleChange(
            EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection()
            )
        )
    }

    useEffect(() => {
        setEditorState((editorState) => {
            const text = editorState.getCurrentContent().getPlainText()

            if (text === value) {
                return editorState
            }

            return (
                EditorState.push as (
                    editorState: EditorState,
                    contentState: ContentState
                ) => EditorState
            )(editorState, contentStateFromTextOrHTML(value))
        })
    }, [value])

    return (
        <div>
            <div className={css.container}>
                <ToolbarProvider workflowVariables={variables}>
                    <div
                        className={classnames(css.editor, {
                            [css.hasError]: !!error,
                        })}
                    >
                        <Editor
                            editorState={editorState}
                            onChange={handleChange}
                            stripPastedStyles
                            ref={(editor) => {
                                editorRef.current = editor
                            }}
                            plugins={plugins}
                        />
                    </div>
                    <div className={css.variables}>
                        <WorkflowVariablePicker
                            onSelect={handleVariableSelect}
                        />
                    </div>
                </ToolbarProvider>
            </div>
            {error && <div className={css.error}>{error}</div>}
        </div>
    )
}

export default TextareaWithVariables
