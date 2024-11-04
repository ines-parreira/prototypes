import 'draft-js/dist/Draft.css'

import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import {ContentState, EditorState} from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import createSingleLinePlugin from 'draft-js-single-line-plugin'
import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
    memo,
    forwardRef,
    ForwardedRef,
    useImperativeHandle,
} from 'react'

import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import {toLiquidSyntax} from 'pages/automate/workflows/models/variables.model'
import {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'
import WorkflowVariableDropdown from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariableDropdown'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import InputGroup, {
    InputGroupContext,
} from 'pages/common/forms/input/InputGroup'
import {insertText} from 'utils'
import {contentStateFromTextOrHTML} from 'utils/editor'

import css from './TextInputWithVariables.less'

type Props = {
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    onFocus?: () => void
    variables?: WorkflowVariableList
    placeholder?: string
    noSelectedCategoryText?: string
    isDisabled?: boolean
    toolTipMessage?: string | null
}

const TextInputWithVariables = (
    {
        value,
        onChange,
        onBlur,
        onFocus,
        variables,
        placeholder,
        noSelectedCategoryText,
        isDisabled,
        toolTipMessage = 'Variables are automatically created and can be used to recall information from previous steps in a flow',
    }: Props,
    ref: ForwardedRef<Editor>
) => {
    const editorRef = useRef<Editor | null>(null)

    useImperativeHandle(ref, () => editorRef.current!)

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
            <InputGroup isDisabled={isDisabled} className={css.container}>
                <InputGroupContext.Consumer>
                    {(inputGroupContext) => (
                        <>
                            <div className={css.editor}>
                                <Editor
                                    editorState={editorState}
                                    readOnly={isDisabled}
                                    onChange={handleChange}
                                    stripPastedStyles
                                    ref={(editor) => {
                                        editorRef.current = editor
                                    }}
                                    plugins={plugins}
                                    onFocus={() => {
                                        inputGroupContext?.setIsFocused(true)
                                        onFocus?.()
                                    }}
                                    onBlur={() => {
                                        inputGroupContext?.setIsFocused(false)
                                        onBlur?.()
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
                            {toolTipMessage && (
                                <Tooltip target={dropdownTargetRef}>
                                    {toolTipMessage}
                                </Tooltip>
                            )}
                        </>
                    )}
                </InputGroupContext.Consumer>
            </InputGroup>
            <WorkflowVariableDropdown
                isDisabled={isDisabled}
                noSelectedCategoryText={noSelectedCategoryText}
                target={dropdownTargetRef}
                onSelect={handleVariableSelect}
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
            />
        </ToolbarProvider>
    )
}

export default memo(forwardRef(TextInputWithVariables))
