import 'draft-js/dist/Draft.css'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classnames from 'classnames'
import { ContentState, EditorState, Modifier } from 'draft-js'
import Editor from 'draft-js-plugins-editor'
import { Popover } from 'reactstrap'

import createWorkflowVariablesPlugin from 'pages/automate/workflows/draftjs/plugins/variables'
import {
    extractVariablesFromText,
    parseWorkflowVariable,
    toLiquidSyntax,
} from 'pages/automate/workflows/models/variables.model'
import {
    WorkflowVariable,
    WorkflowVariableList,
    WorkflowVariableType,
} from 'pages/automate/workflows/models/variables.types'
import WorkflowVariablePicker from 'pages/common/draftjs/plugins/toolbar/components/WorkflowVariablePicker'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import TextInput from 'pages/common/forms/input/TextInput'
import { insertText } from 'utils'
import {
    contentStateFromTextOrHTML,
    EditorHandledNotHandled,
    getEntitySelectionState,
} from 'utils/editor'

import css from './TextareaWithVariables.less'

type Props = {
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    variables?: WorkflowVariableList
    error?: string
    isDisabled?: boolean
    noSelectedCategoryText?: string
    variablePickerTooltipMessage?: string | null
    allowFilters?: boolean
}

const workflowVariablesDataTypes: WorkflowVariableType[] = [
    'string',
    'number',
    'date',
    'boolean',
    'array',
    'json',
]

const TextareaWithVariables = ({
    value,
    onChange,
    onBlur,
    variables,
    error,
    isDisabled,
    variablePickerTooltipMessage,
    noSelectedCategoryText = 'Insert variable from previous steps',
    allowFilters,
}: Props) => {
    const editorRef = useRef<Editor | null>()

    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [entityKey, setEntityKey] = useState<string | null>(null)

    const [editorState, setEditorState] = useState(() =>
        EditorState.createWithContent(contentStateFromTextOrHTML(value)),
    )

    const handleVariableTagClick = useCallback(
        (entityKey: string, element: HTMLElement) => {
            setPopoverTarget(element)
            setEntityKey(entityKey)
            setIsPopoverOpen(true)
        },
        [],
    )

    const variable = useMemo(() => {
        if (!entityKey) {
            return null
        }

        const contentState = editorState.getCurrentContent()
        const value =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            contentState.getEntity(entityKey).getData().value as string

        const rawVariable = extractVariablesFromText(value)?.[0]

        if (!rawVariable) {
            return null
        }

        const variable = parseWorkflowVariable(
            rawVariable.value,
            variables || [],
        )

        if (!variable) {
            return null
        }

        return {
            ...variable,
            filter: rawVariable.filter,
        }
    }, [entityKey, variables, editorState])

    const plugins = useMemo(
        () => [
            createWorkflowVariablesPlugin({
                onClick: allowFilters ? handleVariableTagClick : undefined,
            }),
        ],
        [handleVariableTagClick, allowFilters],
    )

    const handleChange = useCallback(
        (editorState: EditorState) => {
            let newEditorState = editorState

            editorRef.current?.resolvePlugins().forEach((plugin) => {
                if (plugin.onChange && editorRef.current) {
                    newEditorState = plugin.onChange(
                        newEditorState,
                        editorRef.current.getPluginMethods(),
                    )
                }
            })

            setEditorState(newEditorState)

            onChange(newEditorState.getCurrentContent().getPlainText())
        },
        [onChange],
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
                            : variable.type === 'json'
                              ? 'json'
                              : undefined,
            }),
        )
        handleChange(
            EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection(),
            ),
        )
    }
    const handlePastedText = useCallback(
        (
            text: string,
            _html: string | undefined,
            editorState: EditorState,
        ): EditorHandledNotHandled => {
            const contentState = Modifier.replaceWithFragment(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                contentStateFromTextOrHTML(
                    text.replace(/\r\n|\r|\n{{/g, '{{'),
                ).getBlockMap(),
            )

            const newEditorState = (
                EditorState.push as (
                    editorState: EditorState,
                    contentState: ContentState,
                ) => EditorState
            )(editorState, contentState)

            handleChange(newEditorState)

            return EditorHandledNotHandled.Handled
        },
        [handleChange],
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
                    contentState: ContentState,
                ) => EditorState
            )(editorState, contentStateFromTextOrHTML(value))
        })
    }, [value])

    return (
        <div>
            <div className={css.container}>
                <ToolbarProvider
                    workflowVariables={variables}
                    workflowVariablesDataTypes={workflowVariablesDataTypes}
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
                            onBlur={onBlur}
                            ref={(editor) => {
                                editorRef.current = editor
                            }}
                            plugins={plugins}
                            handlePastedText={handlePastedText}
                        />
                        {popoverTarget && entityKey && variable && (
                            <Popover
                                key={entityKey}
                                isOpen={isPopoverOpen}
                                toggle={() => {
                                    setIsPopoverOpen(!isPopoverOpen)
                                }}
                                target={popoverTarget}
                                trigger="legacy"
                                placement="right"
                            >
                                <TextInput
                                    value={variable.filter || ''}
                                    autoFocus
                                    onChange={(nextFilter) => {
                                        const contentState =
                                            editorState.getCurrentContent()

                                        const nextValue = toLiquidSyntax({
                                            value: variable.value,
                                            filter: nextFilter,
                                        })

                                        let newContentState =
                                            contentState.mergeEntityData(
                                                entityKey,
                                                {
                                                    value: nextValue,
                                                },
                                            )

                                        let newEditorState = EditorState.push(
                                            editorState,
                                            newContentState,
                                            'apply-entity',
                                        )

                                        const selection =
                                            getEntitySelectionState(
                                                newContentState,
                                                entityKey,
                                            )

                                        if (selection) {
                                            newContentState =
                                                Modifier.replaceText(
                                                    newContentState,
                                                    selection,
                                                    nextValue,
                                                    undefined,
                                                    entityKey,
                                                )

                                            newEditorState = EditorState.push(
                                                newEditorState,
                                                newContentState,
                                                'change-block-data',
                                            )
                                        }

                                        handleChange(newEditorState)
                                    }}
                                />
                            </Popover>
                        )}
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
