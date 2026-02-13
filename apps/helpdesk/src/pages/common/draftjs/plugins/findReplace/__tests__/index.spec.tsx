import { render, screen } from '@testing-library/react'
import { EditorState } from 'draft-js'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import createFindReplacePlugin from '../index'

function createCtrlFEvent() {
    return {
        key: 'f',
        metaKey: false,
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

function createCtrlShiftFEvent() {
    return {
        key: 'f',
        metaKey: false,
        ctrlKey: true,
        altKey: false,
        shiftKey: true,
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

function createOtherKeyEvent() {
    return {
        key: 'a',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
    } as unknown as React.KeyboardEvent
}

describe('findReplace plugin', () => {
    describe('keyBindingFn', () => {
        it('should return find command on Ctrl+F', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = createCtrlFEvent()
            const result = plugin.keyBindingFn!(event, pluginMethods)

            expect(result).toBe('find-replace-open-find')
            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('should return replace command on Ctrl+Shift+F', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = createCtrlShiftFEvent()
            const result = plugin.keyBindingFn!(event, pluginMethods)

            expect(result).toBe('find-replace-open-replace')
            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('should return undefined for other keys', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.keyBindingFn!(
                createOtherKeyEvent(),
                pluginMethods,
            )
            expect(result).toBeUndefined()
        })
    })

    describe('handleKeyCommand', () => {
        it('should open find dialog with replace visible on find command', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                'find-replace-open-find',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')
            expect(plugin.store.isOpen).toBe(true)
            expect(plugin.store.showReplace).toBe(true)
        })

        it('should open replace dialog on replace command', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const result = plugin.handleKeyCommand!(
                'find-replace-open-replace',
                editorState,
                pluginMethods,
            )

            expect(result).toBe('handled')
            expect(plugin.store.isOpen).toBe(true)
            expect(plugin.store.showReplace).toBe(true)
        })

        it('should return not-handled for unknown commands', () => {
            const plugin = createFindReplacePlugin()
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

    describe('search functionality', () => {
        it('should find matches in text', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'hello world hello',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('hello')

            expect(plugin.store.matches).toHaveLength(2)
            expect(plugin.store.matches[0].start).toBe(0)
            expect(plugin.store.matches[0].end).toBe(5)
            expect(plugin.store.matches[1].start).toBe(12)
            expect(plugin.store.matches[1].end).toBe(17)
        })

        it('should be case-insensitive', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'Hello HELLO hello',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('hello')

            expect(plugin.store.matches).toHaveLength(3)
        })

        it('should return no matches for empty search', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('')

            expect(plugin.store.matches).toHaveLength(0)
        })
    })

    describe('navigation', () => {
        it('should cycle through matches with findNext', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'abc abc abc',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('abc')
            expect(plugin.store.currentMatchIndex).toBe(0)

            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(1)

            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(2)

            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(0)
        })

        it('should cycle backwards with findPrevious', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'abc abc abc',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('abc')
            expect(plugin.store.currentMatchIndex).toBe(0)

            plugin.onFindPrevious()
            expect(plugin.store.currentMatchIndex).toBe(2)

            plugin.onFindPrevious()
            expect(plugin.store.currentMatchIndex).toBe(1)
        })
    })

    describe('replace functionality', () => {
        it('should replace current match', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'hello world hello',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)

            plugin.onSearchChange('hello')
            plugin.onReplaceChange('hi')
            plugin.onReplace()

            const newState = pluginMethods.getEditorState()
            const text = newState.getCurrentContent().getPlainText()
            expect(text).toBe('hi world hello')
        })

        it('should replace all matches', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'hello world hello',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)

            plugin.onSearchChange('hello')
            plugin.onReplaceChange('hi')
            plugin.onReplaceAll()

            const newState = pluginMethods.getEditorState()
            const text = newState.getCurrentContent().getPlainText()
            expect(text).toBe('hi world hi')
            expect(plugin.store.matches).toHaveLength(0)
        })
    })

    describe('close', () => {
        it('should clear state when closed', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)

            plugin.onSearchChange('hello')
            expect(plugin.store.matches.length).toBeGreaterThan(0)

            plugin.close()

            expect(plugin.store.isOpen).toBe(false)
            expect(plugin.store.searchTerm).toBe('')
            expect(plugin.store.replaceTerm).toBe('')
            expect(plugin.store.matches).toHaveLength(0)
        })
    })

    describe('toggleReplace', () => {
        it('should toggle showReplace on and off', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            expect(plugin.store.showReplace).toBe(false)

            plugin.toggleReplace()
            expect(plugin.store.showReplace).toBe(true)

            plugin.toggleReplace()
            expect(plugin.store.showReplace).toBe(false)
        })
    })

    describe('edge cases', () => {
        it('should return replace command for Ctrl+H (Windows/Linux)', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = {
                key: 'h',
                metaKey: false,
                ctrlKey: true,
                altKey: false,
                shiftKey: false,
                preventDefault: jest.fn(),
            } as unknown as React.KeyboardEvent

            const result = plugin.keyBindingFn!(event, pluginMethods)

            expect(result).toBe('find-replace-open-replace')
            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('onFindNext should do nothing when no matches', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('')
            expect(plugin.store.matches).toHaveLength(0)

            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(0)
        })

        it('onFindPrevious should do nothing when no matches', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('')
            plugin.onFindPrevious()
            expect(plugin.store.currentMatchIndex).toBe(0)
        })

        it('onReplace should do nothing when no matches', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)

            plugin.onSearchChange('')
            plugin.onReplaceChange('hi')
            plugin.onReplace()

            const text = pluginMethods
                .getEditorState()
                .getCurrentContent()
                .getPlainText()
            expect(text).toBe('hello')
        })

        it('onReplaceAll should do nothing when no matches', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)

            plugin.onSearchChange('')
            plugin.onReplaceChange('hi')
            plugin.onReplaceAll()

            const text = pluginMethods
                .getEditorState()
                .getCurrentContent()
                .getPlainText()
            expect(text).toBe('hello')
        })

        it('currentMatchIndex should wrap after replace removes a match', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'aa aa')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)

            plugin.onSearchChange('aa')
            expect(plugin.store.matches).toHaveLength(2)

            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(1)

            plugin.onReplaceChange('bb')
            plugin.onReplace()

            expect(plugin.store.currentMatchIndex).toBe(0)
        })

        it('decorators should be defined', () => {
            const plugin = createFindReplacePlugin()
            expect(plugin.decorators).toBeDefined()
            expect(plugin.decorators).toHaveLength(1)
        })
    })

    describe('decoratorStrategy', () => {
        it('should call callback with correct start/end indices', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'hello world hello',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)
            plugin.onSearchChange('hello')

            const contentState = editorState.getCurrentContent()
            const block = contentState.getFirstBlock()
            const callback = jest.fn()

            plugin.decorators![0].strategy(block, callback, contentState)

            expect(callback).toHaveBeenCalledTimes(2)
            expect(callback).toHaveBeenCalledWith(0, 5)
            expect(callback).toHaveBeenCalledWith(12, 17)
        })

        it('should do nothing when store is closed', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const contentState = editorState.getCurrentContent()
            const block = contentState.getFirstBlock()
            const callback = jest.fn()

            plugin.decorators![0].strategy(block, callback, contentState)

            expect(callback).not.toHaveBeenCalled()
        })

        it('should do nothing when searchTerm is empty', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            const contentState = editorState.getCurrentContent()
            const block = contentState.getFirstBlock()
            const callback = jest.fn()

            plugin.decorators![0].strategy(block, callback, contentState)

            expect(callback).not.toHaveBeenCalled()
        })

        it('should match case-insensitively', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'Hello HELLO',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)
            plugin.onSearchChange('hello')

            const contentState = editorState.getCurrentContent()
            const block = contentState.getFirstBlock()
            const callback = jest.fn()

            plugin.decorators![0].strategy(block, callback, contentState)

            expect(callback).toHaveBeenCalledTimes(2)
            expect(callback).toHaveBeenCalledWith(0, 5)
            expect(callback).toHaveBeenCalledWith(6, 11)
        })
    })

    describe('HighlightComponent', () => {
        it('should render children with data-find-replace-highlight attribute', () => {
            const plugin = createFindReplacePlugin()
            const Component = plugin.decorators![0].component
            const contentState = EditorState.createEmpty().getCurrentContent()

            render(
                <Component
                    entityKey=""
                    contentState={contentState}
                    decoratedText="highlighted text"
                    getEditorState={() => EditorState.createEmpty()}
                    setEditorState={() => {}}
                    offsetKey=""
                >
                    highlighted text
                </Component>,
            )

            const el = screen.getByText('highlighted text')
            expect(
                el.closest('[data-find-replace-highlight]'),
            ).toBeInTheDocument()
        })
    })

    describe('initialize', () => {
        it('should store pluginMethods', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)

            plugin.initialize!(pluginMethods)

            plugin.open(false)
            expect(plugin.store.isOpen).toBe(true)
        })
    })

    describe('onSearchChange', () => {
        it('should reset currentMatchIndex to 0 after search change', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'abc abc abc',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('abc')
            plugin.onFindNext()
            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(2)

            plugin.onSearchChange('abc')
            expect(plugin.store.currentMatchIndex).toBe(0)
        })
    })

    describe('onReplaceChange', () => {
        it('should update replaceTerm in store', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onReplaceChange('new text')
            expect(plugin.store.replaceTerm).toBe('new text')
        })
    })

    describe('shouldScrollToMatch', () => {
        it('should set shouldScrollToMatch to true on onFindNext', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'abc abc')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)
            plugin.onSearchChange('abc')

            expect(plugin.store.shouldScrollToMatch).toBe(false)

            plugin.onFindNext()

            expect(plugin.store.shouldScrollToMatch).toBe(true)
        })

        it('should set shouldScrollToMatch to true on onFindPrevious', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'abc abc')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)
            plugin.onSearchChange('abc')

            plugin.onFindPrevious()

            expect(plugin.store.shouldScrollToMatch).toBe(true)
        })

        it('should set shouldScrollToMatch to true on onReplace', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'abc abc abc',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(true)
            plugin.onSearchChange('abc')
            plugin.onReplaceChange('x')

            plugin.onReplace()

            expect(plugin.store.shouldScrollToMatch).toBe(true)
        })
    })

    describe('open and close lifecycle', () => {
        it('should update matches and set showReplace when opening', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(EditorState.createEmpty(), 'hello')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.store.searchTerm = 'hello'
            plugin.open(true)

            expect(plugin.store.isOpen).toBe(true)
            expect(plugin.store.showReplace).toBe(true)
            expect(plugin.store.matches).toHaveLength(1)
        })

        it('should recompute matches on open with existing search term', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'abc def abc',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.store.searchTerm = 'abc'
            plugin.open(false)

            expect(plugin.store.matches).toHaveLength(2)
        })
    })

    describe('updateMatches currentMatchIndex adjustment', () => {
        it('should adjust currentMatchIndex when it exceeds new matches length', () => {
            const plugin = createFindReplacePlugin()
            const editorState = typeText(
                EditorState.createEmpty(),
                'abc abc abc',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.open(false)

            plugin.onSearchChange('abc')
            expect(plugin.store.matches).toHaveLength(3)

            plugin.onFindNext()
            plugin.onFindNext()
            expect(plugin.store.currentMatchIndex).toBe(2)

            plugin.onSearchChange('abc abc abc')
            expect(plugin.store.currentMatchIndex).toBe(0)
        })
    })

    describe('keyBindingFn with uppercase F', () => {
        it('should return replace command on Ctrl+Shift+F (uppercase)', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = {
                key: 'F',
                metaKey: false,
                ctrlKey: true,
                altKey: false,
                shiftKey: true,
                preventDefault: jest.fn(),
            } as unknown as React.KeyboardEvent

            const result = plugin.keyBindingFn!(event, pluginMethods)

            expect(result).toBe('find-replace-open-replace')
            expect(event.preventDefault).toHaveBeenCalled()
        })

        it('should return replace command for Ctrl+H uppercase (Windows/Linux)', () => {
            const plugin = createFindReplacePlugin()
            const editorState = EditorState.createEmpty()
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            const event = {
                key: 'H',
                metaKey: false,
                ctrlKey: true,
                altKey: false,
                shiftKey: false,
                preventDefault: jest.fn(),
            } as unknown as React.KeyboardEvent

            const result = plugin.keyBindingFn!(event, pluginMethods)

            expect(result).toBe('find-replace-open-replace')
            expect(event.preventDefault).toHaveBeenCalled()
        })
    })
})
