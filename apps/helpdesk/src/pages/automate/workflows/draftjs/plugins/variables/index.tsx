import type { ContentBlock, ContentState } from 'draft-js'
import { EditorState } from 'draft-js'
import findWithRegex from 'find-with-regex'

import {
    liquidTemplateVariableRegex,
    workflowVariableRegex,
} from 'pages/automate/workflows/models/variables.model'
import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import type {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from 'pages/common/draftjs/plugins/types'

import { addEntityToVariable } from './utils'
import type { WorkflowVariableTagProps } from './WorkflowVariableTag'
import WorkflowVariableTag from './WorkflowVariableTag'

type Options = {
    size?: WorkflowVariableTagProps['size']
    getVariables?: () => WorkflowVariableList
    onClick?: (entityKey: string, element: HTMLElement) => void
    isLiquidTemplate?: boolean
}

export default function createWorkflowVariablesPlugin(options: Options = {}) {
    return {
        decorators: [
            {
                strategy: (
                    contentBlock: ContentBlock,
                    callback: DecoratorStrategyCallback,
                    contentState: ContentState,
                ) => {
                    contentBlock.findEntityRanges((character) => {
                        const entityKey = character.getEntity()
                        return (
                            entityKey !== null &&
                            contentState.getEntity(entityKey).getType() ===
                                'flow_variable'
                        )
                    }, callback)
                },
                component: (props: DecoratorComponentProps) => {
                    const { contentState, entityKey, children } = props

                    const handleClick = (element: HTMLElement) => {
                        options.onClick?.(entityKey, element)
                    }

                    const value = contentState.getEntity(entityKey).getData()
                        .value as string // eslint-disable-line @typescript-eslint/no-unsafe-member-access
                    return (
                        <WorkflowVariableTag
                            value={value}
                            size={options.size}
                            onClick={handleClick}
                            isLiquidTemplate={options.isLiquidTemplate ?? false}
                        >
                            {children}
                        </WorkflowVariableTag>
                    )
                },
            },
        ],
        // reference https://github.com/draft-js-plugins/draft-js-plugins/blob/master/packages/emoji/src/modifiers/attachImmutableEntitiesToEmojis.ts
        onChange: (editorState: EditorState) => {
            const contentState = editorState.getCurrentContent()
            const blocks = contentState.getBlockMap()
            let newContentState = contentState

            const regex = options.isLiquidTemplate
                ? liquidTemplateVariableRegex
                : workflowVariableRegex

            blocks.forEach((block) => {
                if (block) {
                    findWithRegex(regex, block, (start, end) => {
                        newContentState = addEntityToVariable(
                            block,
                            newContentState,
                            start,
                            end,
                            options.getVariables?.(),
                            options.isLiquidTemplate,
                        )
                    })
                }
            })

            if (!newContentState.equals(contentState)) {
                const newEditorState = EditorState.push(
                    editorState,
                    newContentState,
                    'apply-entity',
                )
                const currentSelection = editorState.getSelection()
                // only if editor is focused,
                // so we don't steal focus from elsewhere when rendering the editor.
                if (currentSelection.getHasFocus()) {
                    // restore selection after replaceText
                    return EditorState.forceSelection(
                        newEditorState,
                        currentSelection,
                    )
                }
                return newEditorState
            }

            return editorState
        },
    }
}
