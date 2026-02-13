import { EditorState, RichUtils } from 'draft-js'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import {
    HEADER_ONE,
    HEADER_THREE,
    HEADER_TWO,
    ORDERED_LIST_ITEM,
    UNORDERED_LIST_ITEM,
} from '../../toolbar/constants'
import createAutoBlockPlugin from '../index'

function createSpaceKeyEvent() {
    return {
        key: ' ',
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

function createNonSpaceKeyEvent(key = 'a') {
    return {
        key,
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

describe('autoBlock plugin', () => {
    describe('handleBeforeInput', () => {
        it('should set visual ordered style when switching unordered to ordered', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                UNORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(UNORDERED_LIST_ITEM)
            expect(block.getData().get('visualListStyle')).toBe('ordered')
            expect(block.getText()).toBe('')
        })

        it('should set visual unordered style when switching ordered to unordered', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                ORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(ORDERED_LIST_ITEM)
            expect(block.getData().get('visualListStyle')).toBe('unordered')
            expect(block.getText()).toBe('')
        })

        it('should set visual unordered style when switching ordered to unordered with "*"', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                ORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, '*')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(ORDERED_LIST_ITEM)
            expect(block.getData().get('visualListStyle')).toBe('unordered')
            expect(block.getText()).toBe('')
        })

        it('should remove visual style when reverting same type', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                UNORDERED_LIST_ITEM,
            )

            const cs = editorState.getCurrentContent()
            const blk = cs.getFirstBlock()
            const blockWithData = blk.merge({
                data: blk.getData().set('visualListStyle', 'ordered'),
            }) as typeof blk
            const contentWithData = cs.merge({
                blockMap: cs.getBlockMap().set(blk.getKey(), blockWithData),
            }) as typeof cs
            editorState = EditorState.push(
                editorState,
                contentWithData,
                'change-block-data',
            )

            editorState = typeText(editorState, '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(UNORDERED_LIST_ITEM)
            expect(block.getData().get('visualListStyle')).toBeUndefined()
            expect(block.getText()).toBe('')
        })

        it('should return not-handled for non-space character', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                ORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                'a',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })

        it('should return not-handled when no trigger matches on list item', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                ORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })

        it('should return not-handled when same list type trigger is typed without visual override', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                ORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })

        it('should return not-handled for non-list block types', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(editorState, HEADER_ONE)
            editorState = typeText(editorState, '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })

        it('should return not-handled for unstyled blocks', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleBeforeInput!(
                ' ',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })
    })

    describe('keyBindingFn', () => {
        it('should return ordered list command when "1." + space is typed on unstyled block', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:2:${ORDERED_LIST_ITEM}`)
        })

        it('should return unordered list command when "-" + space is typed on unstyled block', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:1:${UNORDERED_LIST_ITEM}`)
        })

        it('should return unordered list command when "*" + space is typed on unstyled block', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '*')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:1:${UNORDERED_LIST_ITEM}`)
        })

        it('should return undefined for non-space key', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createNonSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should return undefined for non-matching text', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should return undefined for list block types (handled by handleBeforeInput)', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(
                editorState,
                UNORDERED_LIST_ITEM,
            )
            editorState = typeText(editorState, '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should return undefined for non-list non-unstyled block types', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = EditorState.createEmpty()
            editorState = RichUtils.toggleBlockType(editorState, HEADER_ONE)
            editorState = typeText(editorState, '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should still match trigger when cursor is not at end of text', () => {
            const plugin = createAutoBlockPlugin()
            let editorState = typeText(EditorState.createEmpty(), '1.extra')
            const selection = editorState.getSelection().merge({
                anchorOffset: 2,
                focusOffset: 2,
            })
            editorState = EditorState.forceSelection(editorState, selection)
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:2:${ORDERED_LIST_ITEM}`)
        })

        it('should return undefined for "2." + space', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '2.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should return header-one command when "#" + space is typed', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '#')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:1:${HEADER_ONE}`)
        })

        it('should return header-two command when "##" + space is typed', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '##')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:2:${HEADER_TWO}`)
        })

        it('should return header-three command when "###" + space is typed', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '###')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBe(`auto-block-convert:3:${HEADER_THREE}`)
        })

        it('should return undefined for "####" + space (only H1-H3 supported)', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '####')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createSpaceKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should call preventDefault on matching space key', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = createSpaceKeyEvent()
            plugin.keyBindingFn!(event, pluginMethods)

            expect(event.preventDefault).toHaveBeenCalled()
        })
    })

    describe('handleKeyCommand', () => {
        it('should convert to ordered list and clear trigger text', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '1.')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                `auto-block-convert:2:${ORDERED_LIST_ITEM}`,
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(ORDERED_LIST_ITEM)
            expect(block.getText()).toBe('')
        })

        it('should convert to unordered list and clear trigger text', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '-')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                `auto-block-convert:1:${UNORDERED_LIST_ITEM}`,
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(UNORDERED_LIST_ITEM)
            expect(block.getText()).toBe('')
        })

        it('should convert to header-one and clear trigger text', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '#')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                `auto-block-convert:1:${HEADER_ONE}`,
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(HEADER_ONE)
            expect(block.getText()).toBe('')
        })

        it('should convert to header-two and clear trigger text', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = typeText(EditorState.createEmpty(), '##')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                `auto-block-convert:2:${HEADER_TWO}`,
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const content = newState.getCurrentContent()
            const block = content.getFirstBlock()

            expect(block.getType()).toBe(HEADER_TWO)
            expect(block.getText()).toBe('')
        })

        it('should return not-handled for unknown commands', () => {
            const plugin = createAutoBlockPlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                'some-other-command',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('not-handled')
        })
    })
})
