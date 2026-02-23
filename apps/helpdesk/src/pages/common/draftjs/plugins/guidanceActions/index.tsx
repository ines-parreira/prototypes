import type { ContentBlock, ContentState } from 'draft-js'
import { EditorState } from 'draft-js'
import findWithRegex from 'find-with-regex'

import GuidanceActionTag from 'pages/common/draftjs/plugins/guidanceActions/GuidanceActionTag'
import type {
    DecoratorComponentProps,
    DecoratorStrategyCallback,
} from 'pages/common/draftjs/plugins/types'

import { addGuidanceActionEntity, guidanceActionRegex } from './utils'

export default function createGuidanceActionsPlugin() {
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
                                'guidance_action'
                        )
                    }, callback)
                },
                component: (props: DecoratorComponentProps) => {
                    const { contentState, entityKey, children } = props

                    const value = contentState.getEntity(entityKey).getData()
                        .value as string // eslint-disable-line @typescript-eslint/no-unsafe-member-access
                    return (
                        <GuidanceActionTag value={value}>
                            {children}
                        </GuidanceActionTag>
                    )
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
                    findWithRegex(guidanceActionRegex, block, (start, end) => {
                        newContentState = addGuidanceActionEntity(
                            block,
                            newContentState,
                            start,
                            end,
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
                // Always preserve selection to prevent cursor jumping
                // Only set hasFocus if editor currently has focus
                const hadFocus = editorState.getSelection().getHasFocus()
                const selection = newEditorState
                    .getSelection()
                    .merge({ hasFocus: hadFocus })
                return EditorState.forceSelection(newEditorState, selection)
            }

            return editorState
        },
    }
}
