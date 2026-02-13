import { EditorState, Modifier } from 'draft-js'

import { ORDERED_LIST_ITEM, UNORDERED_LIST_ITEM } from '../toolbar/constants'

const LIST_BLOCK_TYPES = new Set([UNORDERED_LIST_ITEM, ORDERED_LIST_ITEM])

export function handleListReturn(editorState: EditorState): EditorState | null {
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) return null

    const contentState = editorState.getCurrentContent()
    const block = contentState.getBlockForKey(selection.getStartKey())
    const blockType = block.getType()

    if (!LIST_BLOCK_TYPES.has(blockType)) return null
    if (block.getText().length !== 0) return null

    const depth = block.getDepth()

    if (depth > 0) {
        const blockKey = block.getKey()
        const newBlock = block.set('depth', depth - 1) as typeof block
        const newBlockMap = contentState.getBlockMap().set(blockKey, newBlock)
        const newContent = contentState.merge({
            blockMap: newBlockMap,
        }) as typeof contentState

        return EditorState.push(editorState, newContent, 'adjust-depth')
    }

    const newContent = Modifier.setBlockType(
        contentState,
        selection,
        'unstyled',
    )
    return EditorState.push(editorState, newContent, 'change-block-type')
}
