import type { KeyboardEvent } from 'react'

import type { ContentBlock } from 'draft-js'
import { ContentState, EditorState, Modifier, SelectionState } from 'draft-js'

import { EditorHandledNotHandled } from '../../../../../utils/editor'
import {
    HEADER_ONE,
    HEADER_THREE,
    HEADER_TWO,
    ORDERED_LIST_ITEM,
    UNORDERED_LIST_ITEM,
} from '../toolbar/constants'
import type { Plugin, PluginMethods } from '../types'

const TRIGGER_PATTERNS: Record<string, string> = {
    '1.': ORDERED_LIST_ITEM,
    '-': UNORDERED_LIST_ITEM,
    '*': UNORDERED_LIST_ITEM,
    '#': HEADER_ONE,
    '##': HEADER_TWO,
    '###': HEADER_THREE,
}

const COMMAND_PREFIX = 'auto-block-convert:'

const LIST_BLOCK_TYPES = new Set([ORDERED_LIST_ITEM, UNORDERED_LIST_ITEM])

function applyVisualStyleConversion(
    editorState: EditorState,
    triggerLength: number,
    targetBlockType: string,
    pluginMethods: PluginMethods,
): string {
    const selection = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const blockKey = selection.getStartKey()
    const originalBlock = contentState.getBlockForKey(blockKey)
    const originalBlockType = originalBlock.getType()
    const isSameTypeRevert = originalBlockType === targetBlockType

    const blockSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: triggerLength,
    }) as SelectionState

    const clearedContent = Modifier.removeRange(
        contentState,
        blockSelection,
        'forward',
    )

    const block = clearedContent.getBlockForKey(blockKey)
    const existingData = block.getData()

    const newData = isSameTypeRevert
        ? existingData.delete('visualListStyle')
        : existingData.set(
              'visualListStyle',
              targetBlockType === ORDERED_LIST_ITEM ? 'ordered' : 'unordered',
          )

    const newBlock = block.merge({
        data: newData,
    }) as ContentBlock

    const newContent = clearedContent.merge({
        blockMap: clearedContent.getBlockMap().set(blockKey, newBlock),
    }) as ContentState

    const newSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: 0,
        focusOffset: 0,
        hasFocus: true,
    }) as SelectionState

    const newEditorState = EditorState.forceSelection(
        EditorState.push(editorState, newContent, 'change-block-data'),
        newSelection,
    )

    pluginMethods.setEditorState(newEditorState)
    return EditorHandledNotHandled.Handled
}

const createAutoBlockPlugin = (): Plugin => {
    let pluginMethods: PluginMethods

    return {
        initialize(methods: PluginMethods) {
            pluginMethods = methods
        },

        handleBeforeInput(chars: string, editorState: EditorState) {
            if (chars !== ' ') {
                return EditorHandledNotHandled.NotHandled
            }

            const selection = editorState.getSelection()
            if (!selection.isCollapsed()) {
                return EditorHandledNotHandled.NotHandled
            }

            const contentState = editorState.getCurrentContent()
            const block = contentState.getBlockForKey(selection.getStartKey())
            const blockType = block.getType()

            if (!LIST_BLOCK_TYPES.has(blockType)) {
                return EditorHandledNotHandled.NotHandled
            }

            const text = block.getText()
            const offset = selection.getStartOffset()
            const textBeforeCursor = text.substring(0, offset)
            const targetBlockType = TRIGGER_PATTERNS[textBeforeCursor]

            if (!targetBlockType) {
                return EditorHandledNotHandled.NotHandled
            }

            const isCrossListSwitch =
                (blockType === UNORDERED_LIST_ITEM &&
                    targetBlockType === ORDERED_LIST_ITEM) ||
                (blockType === ORDERED_LIST_ITEM &&
                    targetBlockType === UNORDERED_LIST_ITEM)

            const visualListStyle = block.getData().get('visualListStyle') as
                | string
                | undefined

            const isSameTypeRevert =
                blockType === targetBlockType && visualListStyle !== undefined

            if (!isCrossListSwitch && !isSameTypeRevert) {
                return EditorHandledNotHandled.NotHandled
            }

            return applyVisualStyleConversion(
                editorState,
                textBeforeCursor.length,
                targetBlockType,
                pluginMethods,
            )
        },

        keyBindingFn(event: KeyboardEvent) {
            if (event.key !== ' ') {
                return undefined
            }

            const editorState = pluginMethods.getEditorState()
            const selection = editorState.getSelection()

            if (!selection.isCollapsed()) {
                return undefined
            }

            const contentState = editorState.getCurrentContent()
            const block = contentState.getBlockForKey(selection.getStartKey())
            const blockType = block.getType()

            if (blockType !== 'unstyled') {
                return undefined
            }

            const text = block.getText()
            const offset = selection.getStartOffset()
            const textBeforeCursor = text.substring(0, offset)
            const targetBlockType = TRIGGER_PATTERNS[textBeforeCursor]

            if (!targetBlockType) {
                return undefined
            }

            event.preventDefault()
            return `${COMMAND_PREFIX}${textBeforeCursor.length}:${targetBlockType}`
        },

        handleKeyCommand(command: string, editorState: EditorState) {
            if (!command.startsWith(COMMAND_PREFIX)) {
                return EditorHandledNotHandled.NotHandled
            }

            const [triggerLengthStr, targetBlockType] = command
                .slice(COMMAND_PREFIX.length)
                .split(':')
            const triggerLength = Number(triggerLengthStr)

            const selection = editorState.getSelection()
            const contentState = editorState.getCurrentContent()
            const blockKey = selection.getStartKey()
            const originalBlock = contentState.getBlockForKey(blockKey)
            const originalDepth = originalBlock.getDepth()

            const blockSelection = SelectionState.createEmpty(blockKey).merge({
                anchorOffset: 0,
                focusOffset: triggerLength,
            }) as SelectionState

            const clearedContent = Modifier.removeRange(
                contentState,
                blockSelection,
                'forward',
            )

            let newContent = Modifier.setBlockType(
                clearedContent,
                clearedContent.getSelectionAfter(),
                targetBlockType,
            )

            if (originalDepth > 0) {
                const blocks = newContent.getBlocksAsArray().map((b) => {
                    if (b.getKey() === blockKey) {
                        return b.set('depth', originalDepth) as ContentBlock
                    }
                    return b
                })
                newContent = ContentState.createFromBlockArray(
                    blocks,
                    newContent.getEntityMap(),
                )
            }

            const newSelection = SelectionState.createEmpty(blockKey).merge({
                anchorOffset: 0,
                focusOffset: 0,
                hasFocus: true,
            }) as SelectionState

            const newEditorState = EditorState.forceSelection(
                EditorState.push(editorState, newContent, 'change-block-type'),
                newSelection,
            )

            pluginMethods.setEditorState(newEditorState)
            return EditorHandledNotHandled.Handled
        },
    }
}

export default createAutoBlockPlugin
