import {
    AtomicBlockUtils,
    EditorState,
    Modifier,
    SelectionState,
} from 'draft-js'
import type { ContentBlock, ContentState } from 'draft-js'

import type { Plugin, PluginMethods } from '../types'
import HorizontalRuleBlock from './HorizontalRuleBlock'

export const HORIZONTAL_RULE_ENTITY = 'HORIZONTAL_RULE'

const createHorizontalRulePlugin = (): Plugin => {
    let pluginMethods: PluginMethods
    let previousContentState: ContentState | null = null

    return {
        initialize(methods: PluginMethods) {
            pluginMethods = methods
        },

        onChange(editorState: EditorState) {
            const contentState = editorState.getCurrentContent()

            if (contentState === previousContentState) {
                return editorState
            }
            previousContentState = contentState

            const selection = editorState.getSelection()

            if (!selection.isCollapsed()) {
                return editorState
            }

            const block = contentState.getBlockForKey(selection.getStartKey())

            if (block.getType() !== 'unstyled') {
                return editorState
            }

            if (block.getText() !== '---') {
                return editorState
            }

            const blockKey = block.getKey()
            const blockSelection = SelectionState.createEmpty(blockKey).merge({
                anchorOffset: 0,
                focusOffset: block.getText().length,
            }) as SelectionState

            const clearedContent = Modifier.removeRange(
                contentState,
                blockSelection,
                'forward',
            )

            const contentWithEntity = clearedContent.createEntity(
                HORIZONTAL_RULE_ENTITY,
                'IMMUTABLE',
                {},
            )
            const entityKey = contentWithEntity.getLastCreatedEntityKey()

            const editorWithEntity = EditorState.push(
                editorState,
                contentWithEntity,
                'apply-entity',
            )

            let newEditorState = AtomicBlockUtils.insertAtomicBlock(
                editorWithEntity,
                entityKey,
                ' ',
            )

            const newContent = newEditorState.getCurrentContent()
            const originalBlock = newContent.getBlockForKey(blockKey)
            if (originalBlock && originalBlock.getText() === '') {
                const cleanedBlockMap = newContent
                    .getBlockMap()
                    .delete(blockKey)
                const cleanedContent = newContent.merge({
                    blockMap: cleanedBlockMap,
                }) as ContentState
                newEditorState = EditorState.push(
                    newEditorState,
                    cleanedContent,
                    'remove-range',
                )
            }

            previousContentState = newEditorState.getCurrentContent()

            return newEditorState
        },

        blockRendererFn(contentBlock: ContentBlock) {
            if (contentBlock.getType() !== 'atomic') {
                return null
            }

            const editorState = pluginMethods.getEditorState()
            const contentState = editorState.getCurrentContent()
            const entityKey = contentBlock.getEntityAt(0)

            if (!entityKey) {
                return null
            }

            const entity = contentState.getEntity(entityKey)

            if (entity.getType() === HORIZONTAL_RULE_ENTITY) {
                return {
                    component: HorizontalRuleBlock,
                    editable: false,
                }
            }

            return null
        },
    }
}

export default createHorizontalRulePlugin
