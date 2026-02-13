import {
    ContentBlock,
    ContentState,
    EditorState,
    SelectionState,
} from 'draft-js'
import { List as ImmutableList, Map as ImmutableMap } from 'immutable'

import { ORDERED_LIST_ITEM, UNORDERED_LIST_ITEM } from '../../toolbar/constants'
import { handleListReturn } from '../index'

function createEditorStateWithBlock(
    type: string,
    text: string,
    depth = 0,
): EditorState {
    const blockKey = 'block1'
    const block = new ContentBlock({
        key: blockKey,
        type,
        text,
        depth,
        characterList: ImmutableList(),
        data: ImmutableMap(),
    })
    const contentState = ContentState.createFromBlockArray([block])
    const editorState = EditorState.createWithContent(contentState)
    const selection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: text.length,
        focusOffset: text.length,
        hasFocus: true,
    }) as SelectionState
    return EditorState.forceSelection(editorState, selection)
}

function createEditorStateWithNonCollapsedSelection(
    type: string,
    text: string,
): EditorState {
    const blockKey = 'block1'
    const block = new ContentBlock({
        key: blockKey,
        type,
        text,
        depth: 0,
        characterList: ImmutableList(),
        data: ImmutableMap(),
    })
    const contentState = ContentState.createFromBlockArray([block])
    const editorState = EditorState.createWithContent(contentState)
    const selection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: text.length,
        hasFocus: true,
    }) as SelectionState
    return EditorState.forceSelection(editorState, selection)
}

describe('handleListReturn', () => {
    it('should decrease depth for empty unordered list item at depth > 0', () => {
        const editorState = createEditorStateWithBlock(
            UNORDERED_LIST_ITEM,
            '',
            2,
        )

        const result = handleListReturn(editorState)

        expect(result).not.toBeNull()
        const block = result!.getCurrentContent().getFirstBlock()
        expect(block.getType()).toBe(UNORDERED_LIST_ITEM)
        expect(block.getDepth()).toBe(1)
    })

    it('should decrease depth for empty ordered list item at depth > 0', () => {
        const editorState = createEditorStateWithBlock(ORDERED_LIST_ITEM, '', 3)

        const result = handleListReturn(editorState)

        expect(result).not.toBeNull()
        const block = result!.getCurrentContent().getFirstBlock()
        expect(block.getType()).toBe(ORDERED_LIST_ITEM)
        expect(block.getDepth()).toBe(2)
    })

    it('should convert empty list item at depth 0 to unstyled', () => {
        const editorState = createEditorStateWithBlock(
            UNORDERED_LIST_ITEM,
            '',
            0,
        )

        const result = handleListReturn(editorState)

        expect(result).not.toBeNull()
        const block = result!.getCurrentContent().getFirstBlock()
        expect(block.getType()).toBe('unstyled')
    })

    it('should convert empty ordered list item at depth 0 to unstyled', () => {
        const editorState = createEditorStateWithBlock(ORDERED_LIST_ITEM, '', 0)

        const result = handleListReturn(editorState)

        expect(result).not.toBeNull()
        const block = result!.getCurrentContent().getFirstBlock()
        expect(block.getType()).toBe('unstyled')
    })

    it('should return null for non-empty list item', () => {
        const editorState = createEditorStateWithBlock(
            UNORDERED_LIST_ITEM,
            'some text',
            0,
        )

        const result = handleListReturn(editorState)

        expect(result).toBeNull()
    })

    it('should return null for non-list block', () => {
        const editorState = createEditorStateWithBlock('unstyled', '', 0)

        const result = handleListReturn(editorState)

        expect(result).toBeNull()
    })

    it('should return null for non-collapsed selection', () => {
        const editorState = createEditorStateWithNonCollapsedSelection(
            UNORDERED_LIST_ITEM,
            'text',
        )

        const result = handleListReturn(editorState)

        expect(result).toBeNull()
    })
})
