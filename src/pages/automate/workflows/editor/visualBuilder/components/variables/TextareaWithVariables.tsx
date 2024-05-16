import 'draft-js/dist/Draft.css'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {ContentState, EditorState, Modifier} from 'draft-js'
import Editor from 'draft-js-plugins-editor'

import classnames from 'classnames'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {contentStateFromTextOrHTML, EditorHandledNotHandled} from 'utils/editor'
import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import WorkflowVariablePicker from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariablePicker'
import {insertText} from 'utils'
import {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'

import {toLiquidSyntax} from 'pages/automate/workflows/models/variables.model'
import css from './TextareaWithVariables.less'

type Props = {
    value: string
    onChange: (value: string) => void
    variables?: WorkflowVariableList
    error?: string
    isDisabled?: boolean
    noSelectedCategoryText?: string
    variablePickerTooltipMessage?: string | null
}

const workflowVariablesNodeTypes: NonNullable<
    WorkflowVariableList[number]['nodeType']
>[] = [
    'text_reply',
    'custom_input',
    'multiple_choices',
    'file_upload',
    'order_selection',
    'http_request',
    'shopper_authentication',
]

const TextareaWithVariables = ({
    value,
    onChange,
    variables,
    error,
    isDisabled,
    variablePickerTooltipMessage,
    noSelectedCategoryText = 'Insert variable from previous steps',
}: Props) => {
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
    const handleVariableSelect = (variable: WorkflowVariable) => {
        const newEditorState = insertText(
            editorState,
            toLiquidSyntax({
                value: variable.value,
                filter:
                    variable.type === 'date'
                        ? 'date'
                        : variable.type === 'array'
                        ? 'json'
                        : variable.type === 'string'
                        ? 'json_escape'
                        : undefined,
            })
        )
        handleChange(
            EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection()
            )
        )
    }
    const handlePastedText = useCallback(
        (
            text: string,
            _html: string | undefined,
            editorState: EditorState
        ): EditorHandledNotHandled => {
            const contentState = Modifier.replaceWithFragment(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                contentStateFromTextOrHTML(
                    text.replace(/\r\n|\r|\n{{/g, '{{')
                ).getBlockMap()
            )

            const newEditorState = (
                EditorState.push as (
                    editorState: EditorState,
                    contentState: ContentState
                ) => EditorState
            )(editorState, contentState)

            handleChange(newEditorState)

            return EditorHandledNotHandled.Handled
        },
        [handleChange]
    )

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
                <ToolbarProvider
                    workflowVariables={variables}
                    workflowVariablesNodeTypes={workflowVariablesNodeTypes}
                >
                    <div
                        className={classnames(css.editor, {
                            [css.hasError]: !!error,
                        })}
                    >
                        <Editor
                            readOnly={isDisabled}
                            editorState={editorState}
                            onChange={handleChange}
                            ref={(editor) => {
                                editorRef.current = editor
                            }}
                            plugins={plugins}
                            handlePastedText={handlePastedText}
                        />
                    </div>
                    <div className={css.variables}>
                        <WorkflowVariablePicker
                            tooltipMessage={variablePickerTooltipMessage}
                            variableDropdownProps={{
                                noSelectedCategoryText,
                            }}
                            disabled={isDisabled}
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
