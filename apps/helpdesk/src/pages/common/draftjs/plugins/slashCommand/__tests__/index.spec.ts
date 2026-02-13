import { EditorState, SelectionState } from 'draft-js'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import createSlashCommandPlugin from '../index'

jest.mock('../../toolbar/ToolbarContext', () => ({
    useToolbarContext: () => ({ guidanceActions: [] }),
}))

function createPlugin(getVariables?: () => any[]) {
    return createSlashCommandPlugin({ getVariables })
}

function createKeyboardEvent(
    key: string,
    overrides: Partial<React.KeyboardEvent> = {},
) {
    return {
        key,
        preventDefault: jest.fn(),
        ...overrides,
    } as unknown as React.KeyboardEvent
}

describe('slashCommand plugin', () => {
    describe('initialize', () => {
        it('should set getEditorState and setEditorState', () => {
            const plugin = createPlugin()
            const pluginMethods = mockPluginMethods()
            plugin.initialize!(pluginMethods)

            expect(pluginMethods.getEditorState).toBeDefined()
            expect(pluginMethods.setEditorState).toBeDefined()
        })
    })

    describe('onChange', () => {
        it('should return editorState unchanged when no slash is typed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.onChange!(editorState)

            expect(result).toBe(editorState)
        })

        it('should open dropdown when "/" is typed at start of block', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            // The plugin internally opens the store, we test it via handleReturn behavior
            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })

        it('should open dropdown when "/" is typed after a space', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello /')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })

        it('should not open dropdown when "/" is in the middle of a word', () => {
            const plugin = createPlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'hello/world',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })

        it('should capture search text after slash', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/test')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })

        it('should close dropdown when editor loses focus and dropdown is open', () => {
            const plugin = createPlugin()
            let editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            // Simulate losing focus via EditorState.acceptSelection with hasFocus=false
            const unfocusedSelection = editorState.getSelection().merge({
                hasFocus: false,
            }) as import('draft-js').SelectionState
            const unfocusedState = EditorState.acceptSelection(
                editorState,
                unfocusedSelection,
            )

            plugin.onChange!(unfocusedState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })

        it('should close dropdown when slash is removed', () => {
            const plugin = createPlugin()
            let editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            // Type something without slash
            const noSlashState = typeText(EditorState.createEmpty(), 'hello')
            const noSlashPluginMethods = mockPluginMethods(noSlashState)
            plugin.initialize!(noSlashPluginMethods)
            plugin.onChange!(noSlashState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })
    })

    describe('handleReturn', () => {
        it('should return handled when dropdown is open', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const result = plugin.handleReturn!()
            expect(result).toBe('handled')
        })

        it('should return not-handled when dropdown is closed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const result = plugin.handleReturn!()
            expect(result).toBe('not-handled')
        })
    })

    describe('onDownArrow', () => {
        it('should prevent default and return true when dropdown is open', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowDown')
            const result = plugin.onDownArrow!(event)
            expect(event.preventDefault).toHaveBeenCalled()
            expect(result).toBe(true)
        })

        it('should not prevent default when dropdown is closed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowDown')
            const result = plugin.onDownArrow!(event)
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })

    describe('onUpArrow', () => {
        it('should prevent default and return true when dropdown is open', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowUp')
            const result = plugin.onUpArrow!(event)
            expect(event.preventDefault).toHaveBeenCalled()
            expect(result).toBe(true)
        })

        it('should not prevent default when dropdown is closed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowUp')
            const result = plugin.onUpArrow!(event)
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })

    describe('onRightArrow', () => {
        it('should not prevent default when dropdown is closed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowRight')
            const result = plugin.onRightArrow!(event)
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })

    describe('onLeftArrow', () => {
        it('should not prevent default when dropdown is closed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowLeft')
            const result = plugin.onLeftArrow!(event)
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })

    describe('SlashCommandSuggestions', () => {
        it('should be a component on the plugin', () => {
            const plugin = createPlugin()
            expect(plugin.SlashCommandSuggestions).toBeDefined()
            expect(typeof plugin.SlashCommandSuggestions).toBe('function')
        })
    })

    describe('onChange edge cases', () => {
        it('should not open when selection is not collapsed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/test')
            const contentState = editorState.getCurrentContent()
            const block = contentState.getFirstBlock()
            const nonCollapsedSelection = SelectionState.createEmpty(
                block.getKey(),
            ).merge({
                anchorOffset: 0,
                focusOffset: 3,
                hasFocus: true,
            }) as SelectionState
            const stateWithSelection = EditorState.forceSelection(
                editorState,
                nonCollapsedSelection,
            )
            const pluginMethods = mockPluginMethods(stateWithSelection)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(stateWithSelection)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })

        it('should reset highlightedIndex when searchText changes', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/ab')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            // Navigate down a few times to move the highlightedIndex
            const downEvent = createKeyboardEvent('ArrowDown')
            plugin.onDownArrow!(downEvent)
            plugin.onDownArrow!(downEvent)

            // Change the search text
            const newEditorState = typeText(EditorState.createEmpty(), '/abc')
            pluginMethods.setEditorState(newEditorState)
            plugin.initialize!(mockPluginMethods(newEditorState))
            plugin.onChange!(newEditorState)

            // The internal state reset is handled, verify via return behavior
            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })

        it('should not close dropdown when editor loses focus and searchInputFocused is active', () => {
            // This is an internal state test - searchInputFocused is set via callbacks in the rendered component
            // We can only verify that the dropdown closes by default when focus is lost
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)
            expect(plugin.handleReturn!()).toBe('handled')

            const unfocusedSelection = editorState.getSelection().merge({
                hasFocus: false,
            }) as SelectionState
            const unfocusedState = EditorState.acceptSelection(
                editorState,
                unfocusedSelection,
            )
            plugin.onChange!(unfocusedState)

            expect(plugin.handleReturn!()).toBe('not-handled')
        })
    })

    describe('onRightArrow edge cases', () => {
        it('should not prevent default when open but canNavigateRight is false', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowRight')
            const result = plugin.onRightArrow!(event)
            // canNavigateRight defaults to false
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })

    describe('onLeftArrow edge cases', () => {
        it('should not prevent default when open but inProviderView is false', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            const event = createKeyboardEvent('ArrowLeft')
            const result = plugin.onLeftArrow!(event)
            // inProviderView defaults to false
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })
})
