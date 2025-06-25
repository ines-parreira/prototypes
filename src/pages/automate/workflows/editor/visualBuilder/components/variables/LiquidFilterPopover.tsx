import React, { useMemo } from 'react'

import { EditorState, Modifier } from 'draft-js'
import { Popover } from 'reactstrap'

import {
    extractVariablesFromText,
    parseWorkflowVariable,
    toLiquidSyntax,
} from 'pages/automate/workflows/models/variables.model'
import { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import TextInput from 'pages/common/forms/input/TextInput'
import { getEntitySelectionState } from 'utils/editor'

type Props = {
    isOpen: boolean
    onToggle: () => void
    target: HTMLElement | null
    entityKey: string | null
    editorState: EditorState
    variables?: WorkflowVariableList
    onChange: (editorState: EditorState) => void
}

const LiquidFilterPopover = ({
    isOpen,
    onToggle,
    target,
    entityKey,
    editorState,
    variables,
    onChange,
}: Props) => {
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

    if (!target || !entityKey || !variable) {
        return null
    }

    return (
        <Popover
            key={entityKey}
            isOpen={isOpen}
            toggle={onToggle}
            target={target}
            trigger="legacy"
            placement="right"
        >
            <TextInput
                value={variable.filter || ''}
                autoFocus
                onChange={(nextFilter) => {
                    const contentState = editorState.getCurrentContent()

                    const nextValue = toLiquidSyntax({
                        value: variable.value,
                        filter: nextFilter,
                    })

                    let newContentState = contentState.mergeEntityData(
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

                    const selection = getEntitySelectionState(
                        newContentState,
                        entityKey,
                    )

                    if (selection) {
                        newContentState = Modifier.replaceText(
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

                    onChange(newEditorState)
                }}
            />
        </Popover>
    )
}

export default LiquidFilterPopover
