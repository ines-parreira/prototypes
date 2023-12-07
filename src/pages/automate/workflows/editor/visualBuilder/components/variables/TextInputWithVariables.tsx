import 'draft-js/dist/Draft.css'

import React, {useCallback, useMemo, useRef, useState, useEffect} from 'react'
import {ContentState, EditorState} from 'draft-js'
import createSingleLinePlugin from 'draft-js-single-line-plugin'
import Editor from 'draft-js-plugins-editor'
import classnames from 'classnames'

import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {contentStateFromTextOrHTML} from 'utils/editor'
import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import {insertText} from 'utils'
import InputGroup, {
    InputGroupContext,
} from 'pages/common/forms/input/InputGroup'
import WorkflowVariableDropdown from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariableDropdown'
import Tooltip from 'pages/common/components/Tooltip'
import {WorkflowVariableList} from 'pages/automate/workflows/models/variables.types'

import css from './TextInputWithVariables.less'

type Props = {
    value: string
    onChange: (value: string) => void
    variables?: WorkflowVariableList
    placeholder?: string
}

const TextInputWithVariables = ({
    value,
    onChange,
    variables,
    placeholder,
}: Props) => {
    const editorRef = useRef<Editor | null>()

    const dropdownTargetRef = useRef<HTMLDivElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const plugins = useMemo(
        () => [
            createWorkflowVariablesPlugin({size: 'small'}),
            createSingleLinePlugin({stripEntities: false}),
        ],
        []
    )

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
        <ToolbarProvider workflowVariables={variables}>
            <InputGroup className={css.container}>
                <InputGroupContext.Consumer>
                    {(inputGroupContext) => (
                        <>
                            <div className={css.editor}>
                                <Editor
                                    editorState={editorState}
                                    onChange={handleChange}
                                    stripPastedStyles
                                    ref={(editor) => {
                                        editorRef.current = editor
                                    }}
                                    plugins={plugins}
                                    onFocus={() => {
                                        inputGroupContext?.setIsFocused(true)
                                    }}
                                    onBlur={() => {
                                        inputGroupContext?.setIsFocused(false)
                                    }}
                                    placeholder={placeholder}
                                />
                            </div>
                            <div
                                ref={dropdownTargetRef}
                                className={css.button}
                                onClick={() => {
                                    setIsDropdownOpen(!isDropdownOpen)
                                }}
                            >
                                {`{+}`}
                                <i
                                    className={classnames(
                                        'material-icons',
                                        css.buttonIcon
                                    )}
                                >
                                    arrow_drop_down
                                </i>
                            </div>
                            <Tooltip target={dropdownTargetRef}>
                                Variables are automatically created and can be
                                used to recall information from previous steps
                                in a flow
                            </Tooltip>
                        </>
                    )}
                </InputGroupContext.Consumer>
            </InputGroup>
            <WorkflowVariableDropdown
                target={dropdownTargetRef}
                onSelect={handleVariableSelect}
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
            />
        </ToolbarProvider>
    )
}

export default TextInputWithVariables
