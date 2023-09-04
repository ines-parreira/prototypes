import React from 'react'
import {ContentBlock, ContentState, EditorState} from 'draft-js'
import findWithRegex from 'find-with-regex'

import {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from 'pages/common/draftjs/plugins/types'
import {flowVariableRegex} from 'pages/automation/workflows/models/variables.model'

import FlowVariableTag from './FlowVariableTag'
import {addEntityToVariable} from './utils'

export default function createFlowVariablesPlugin() {
    return {
        decorators: [
            {
                strategy: (
                    contentBlock: ContentBlock,
                    callback: DecoratorStrategyCallback,
                    contentState: ContentState
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
                    const {contentState, entityKey} = props
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    const value = contentState.getEntity(entityKey).getData()
                        .value as string
                    return <FlowVariableTag value={value} />
                },
            },
        ],
        // reference https://github.com/draft-js-plugins/draft-js-plugins/blob/master/packages/emoji/src/modifiers/attachImmutableEntitiesToEmojis.ts
        onChange: (editorState: EditorState) => {
            const contentState = editorState.getCurrentContent()
            const blocks = contentState.getBlockMap()
            let newContentState = contentState

            blocks.forEach((block) => {
                if (block) {
                    findWithRegex(flowVariableRegex, block, (start, end) => {
                        newContentState = addEntityToVariable(
                            block,
                            newContentState,
                            start,
                            end
                        )
                    })
                }
            })

            if (!newContentState.equals(contentState)) {
                const newEditorState = EditorState.push(
                    editorState,
                    newContentState,
                    'apply-entity'
                )
                const currentSelection = editorState.getSelection()
                // only if editor is focused,
                // so we don't steal focus from elsewhere when rendering the editor.
                if (currentSelection.getHasFocus()) {
                    // restore selection after replaceText
                    return EditorState.forceSelection(
                        newEditorState,
                        currentSelection
                    )
                }
                return newEditorState
            }

            return editorState
        },
    }
}
