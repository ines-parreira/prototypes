import { EditorState, RichUtils, SelectionState } from 'draft-js'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import createClearFormattingPlugin from '../index'

function createBackslashEvent(withCommand = true) {
    return {
        key: '\\',
        metaKey: false,
        ctrlKey: withCommand,
        altKey: false,
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

function createOtherKeyEvent() {
    return {
        key: 'a',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

function selectAll(editorState: EditorState): EditorState {
    const content = editorState.getCurrentContent()
    const firstBlock = content.getFirstBlock()
    const selection = SelectionState.createEmpty(firstBlock.getKey()).merge({
        anchorOffset: 0,
        focusOffset: firstBlock.getText().length,
    }) as SelectionState
    return EditorState.forceSelection(editorState, selection)
}

describe('clearFormatting plugin', () => {
    describe('keyBindingFn', () => {
        it('should return clear-formatting command on Cmd+\\', () => {
            const plugin = createClearFormattingPlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = createBackslashEvent()
            const result = plugin.keyBindingFn!(event, pluginMethods)

            expect(result).toBe('clear-formatting')
            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('should return undefined for non-backslash keys', () => {
            const plugin = createClearFormattingPlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createOtherKeyEvent(),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })

        it('should return undefined for backslash without command modifier', () => {
            const plugin = createClearFormattingPlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createBackslashEvent(false),
                pluginMethods,
            )

            expect(result).toBeUndefined()
        })
    })

    describe('handleKeyCommand', () => {
        it('should remove bold, italic, and underline from selected text', () => {
            const plugin = createClearFormattingPlugin()
            let editorState = typeText(EditorState.createEmpty(), 'hello')
            editorState = selectAll(editorState)
            editorState = RichUtils.toggleInlineStyle(editorState, 'BOLD')
            editorState = RichUtils.toggleInlineStyle(editorState, 'ITALIC')
            editorState = RichUtils.toggleInlineStyle(editorState, 'UNDERLINE')

            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                'clear-formatting',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')

            const newState = pluginMethods.getEditorState()
            const currentStyle = newState.getCurrentInlineStyle()
            expect(currentStyle.has('BOLD')).toBe(false)
            expect(currentStyle.has('ITALIC')).toBe(false)
            expect(currentStyle.has('UNDERLINE')).toBe(false)
        })

        it('should do nothing when selection is collapsed', () => {
            const plugin = createClearFormattingPlugin()
            let editorState = typeText(EditorState.createEmpty(), 'hello')
            editorState = RichUtils.toggleInlineStyle(editorState, 'BOLD')

            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                'clear-formatting',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')
        })

        it('should return not-handled for unknown commands', () => {
            const plugin = createClearFormattingPlugin()
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
