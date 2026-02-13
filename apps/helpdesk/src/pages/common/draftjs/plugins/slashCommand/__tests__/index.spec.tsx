import { act, fireEvent, render, screen } from '@testing-library/react'
import { EditorState, SelectionState } from 'draft-js'

import type { GuidanceVariableList } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'

import { mockPluginMethods, typeText } from '../../../tests/draftTestUtils'
import createSlashCommandPlugin from '../index'

jest.mock('../../toolbar/ToolbarContext', () => ({
    useToolbarContext: () => ({ guidanceActions: [] }),
}))

jest.mock('../../guidanceActions/utils', () => ({
    encodeAction: (action: GuidanceAction) => `$$$${action.value}$$$`,
}))

jest.mock('../SlashCommandSuggestions', () => {
    return function MockSlashCommandSuggestions(props: any) {
        return (
            <div data-testid="slash-suggestions">
                <button
                    data-testid="trigger-select"
                    onClick={() =>
                        props.onSelect({
                            label: 'Order ID',
                            value: '{{order.id}}',
                            type: 'variable',
                            category: 'order',
                        })
                    }
                />
                <button
                    data-testid="trigger-interaction-start"
                    onClick={() => props.onInteractionStart()}
                />
                <button
                    data-testid="trigger-search-focus-true"
                    onClick={() => props.onSearchFocusChange(true)}
                />
                <button
                    data-testid="trigger-search-focus-false"
                    onClick={() => props.onSearchFocusChange(false)}
                />
                <button
                    data-testid="trigger-provider-view-true"
                    onClick={() => props.onProviderViewChange(true)}
                />
                <button
                    data-testid="trigger-provider-view-false"
                    onClick={() => props.onProviderViewChange(false)}
                />
                <button
                    data-testid="trigger-can-navigate-right-true"
                    onClick={() => props.onCanNavigateRightChange(true)}
                />
                <button
                    data-testid="trigger-can-navigate-right-false"
                    onClick={() => props.onCanNavigateRightChange(false)}
                />
                <button
                    data-testid="trigger-item-count"
                    onClick={() => props.onItemCountChange(5)}
                />
                <span data-testid="is-open">{String(props.isOpen)}</span>
                <span data-testid="search-text">{props.searchText}</span>
                <span data-testid="highlighted-index">
                    {String(props.highlightedIndex)}
                </span>
            </div>
        )
    }
})

function createPlugin(getVariables?: () => GuidanceVariableList) {
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

function openDropdown(plugin: ReturnType<typeof createPlugin>) {
    const editorState = typeText(EditorState.createEmpty(), '/')
    const pluginMethods = mockPluginMethods(editorState)
    plugin.initialize!(pluginMethods)
    plugin.onChange!(editorState)
    return { editorState, pluginMethods }
}

function makeUnfocused(editorState: EditorState) {
    const unfocusedSelection = editorState.getSelection().merge({
        hasFocus: false,
    }) as SelectionState
    return EditorState.acceptSelection(editorState, unfocusedSelection)
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
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

            plugin.onChange!(makeUnfocused(editorState))

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })

        it('should close dropdown when slash is removed', () => {
            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            plugin.onChange!(editorState)

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

        it('should prevent default and return true when open AND canNavigateRight is true', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin
            openDropdown(plugin)

            render(<SlashCommandSuggestions />)

            fireEvent.click(
                screen.getByTestId('trigger-can-navigate-right-true'),
            )

            const event = createKeyboardEvent('ArrowRight')
            let result: boolean | undefined
            act(() => {
                result = plugin.onRightArrow!(event) as boolean | undefined
            })
            expect(event.preventDefault).toHaveBeenCalled()
            expect(result).toBe(true)
        })

        it('should not prevent default when open but canNavigateRight is false', () => {
            const plugin = createPlugin()
            openDropdown(plugin)

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

        it('should prevent default and return true when open AND inProviderView is true', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin
            openDropdown(plugin)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-provider-view-true'))

            const event = createKeyboardEvent('ArrowLeft')
            let result: boolean | undefined
            act(() => {
                result = plugin.onLeftArrow!(event) as boolean | undefined
            })
            expect(event.preventDefault).toHaveBeenCalled()
            expect(result).toBe(true)
        })

        it('should not prevent default when open but inProviderView is false', () => {
            const plugin = createPlugin()
            openDropdown(plugin)

            const event = createKeyboardEvent('ArrowLeft')
            const result = plugin.onLeftArrow!(event)
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })

    describe('handleSelect via SlashCommandSuggestions', () => {
        it('should replace slash trigger text with selected item value', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/ord')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-select'))

            const updatedState = pluginMethods.getEditorState()
            const text = updatedState.getCurrentContent().getPlainText()
            expect(text).toBe('{{order.id}}')
        })

        it('should close dropdown after selecting an item', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/ord')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-select'))

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })

        it('should replace trigger text when slash is after a space', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(
                EditorState.createEmpty(),
                'hello /ord',
            )
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-select'))

            const updatedState = pluginMethods.getEditorState()
            const text = updatedState.getCurrentContent().getPlainText()
            expect(text).toBe('hello {{order.id}}')
        })
    })

    describe('onChange with preventClose', () => {
        it('should NOT close dropdown when preventClose is true and editor loses focus', () => {
            jest.useFakeTimers()
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-interaction-start'))

            plugin.onChange!(makeUnfocused(editorState))

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')

            act(() => {
                jest.runAllTimers()
            })

            jest.useRealTimers()
        })

        it('should close dropdown after preventClose timeout expires', () => {
            jest.useFakeTimers()
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-interaction-start'))

            act(() => {
                jest.runAllTimers()
            })

            act(() => {
                plugin.onChange!(makeUnfocused(editorState))
            })

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')

            jest.useRealTimers()
        })

        it('should NOT close when preventClose is true and slash is removed', () => {
            jest.useFakeTimers()
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-interaction-start'))

            const noSlashState = typeText(EditorState.createEmpty(), 'hello')
            const noSlashMethods = mockPluginMethods(noSlashState)
            plugin.initialize!(noSlashMethods)
            plugin.onChange!(noSlashState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')

            act(() => {
                jest.runAllTimers()
            })

            jest.useRealTimers()
        })
    })

    describe('onChange with searchInputFocused', () => {
        it('should NOT close dropdown when searchInputFocused is true and editor loses focus', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-search-focus-true'))

            plugin.onChange!(makeUnfocused(editorState))

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })

        it('should NOT close when searchInputFocused is true and slash is removed', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-search-focus-true'))

            const noSlashState = typeText(EditorState.createEmpty(), 'hello')
            const noSlashMethods = mockPluginMethods(noSlashState)
            plugin.initialize!(noSlashMethods)
            plugin.onChange!(noSlashState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })

        it('should close dropdown after searchInputFocused is set back to false', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-search-focus-true'))

            fireEvent.click(screen.getByTestId('trigger-search-focus-false'))

            act(() => {
                plugin.onChange!(makeUnfocused(editorState))
            })

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('not-handled')
        })
    })

    describe('onChange with nativeSelection rangeCount === 0', () => {
        it('should not throw when window.getSelection returns null', () => {
            jest.useFakeTimers()
            const getSelectionSpy = jest
                .spyOn(window, 'getSelection')
                .mockReturnValue(null as any)

            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            expect(() => plugin.onChange!(editorState)).not.toThrow()

            act(() => {
                jest.runAllTimers()
            })

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')

            getSelectionSpy.mockRestore()
            jest.useRealTimers()
        })

        it('should not throw when nativeSelection.rangeCount is 0', () => {
            jest.useFakeTimers()
            const getSelectionSpy = jest
                .spyOn(window, 'getSelection')
                .mockReturnValue({
                    rangeCount: 0,
                } as any)

            const plugin = createPlugin()
            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)

            expect(() => plugin.onChange!(editorState)).not.toThrow()

            act(() => {
                jest.runAllTimers()
            })

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')

            getSelectionSpy.mockRestore()
            jest.useRealTimers()
        })
    })

    describe('flattenVariables', () => {
        it('should handle flat variables via getVariables in the plugin', () => {
            const variables: GuidanceVariableList = [
                {
                    name: 'Customer Email',
                    value: '{{customer.email}}',
                    category: 'customer' as const,
                },
                {
                    name: 'Order ID',
                    value: '{{order.id}}',
                    category: 'order' as const,
                },
            ]

            const plugin = createPlugin(() => variables)
            const { SlashCommandSuggestions } = plugin
            openDropdown(plugin)

            render(<SlashCommandSuggestions />)

            expect(screen.getByTestId('slash-suggestions')).toBeInTheDocument()
        })

        it('should handle nested variable groups via getVariables in the plugin', () => {
            const variables: GuidanceVariableList = [
                {
                    name: 'Shopify',
                    variables: [
                        {
                            name: 'Nested Group',
                            variables: [
                                {
                                    name: 'Deep Variable',
                                    value: '{{deep.var}}',
                                    category: 'order' as const,
                                },
                            ],
                        },
                        {
                            name: 'Order ID',
                            value: '{{order.id}}',
                            category: 'order' as const,
                        },
                    ],
                },
            ]

            const plugin = createPlugin(() => variables)
            const { SlashCommandSuggestions } = plugin
            openDropdown(plugin)

            render(<SlashCommandSuggestions />)

            expect(screen.getByTestId('slash-suggestions')).toBeInTheDocument()
        })

        it('should handle empty variable list', () => {
            const plugin = createPlugin(() => [])
            const { SlashCommandSuggestions } = plugin
            openDropdown(plugin)

            render(<SlashCommandSuggestions />)

            expect(screen.getByTestId('slash-suggestions')).toBeInTheDocument()
        })
    })

    describe('handleInteractionStart sets preventClose', () => {
        it('should set preventClose that prevents close on focus loss and resets after timeout', () => {
            jest.useFakeTimers()
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-interaction-start'))

            plugin.onChange!(makeUnfocused(editorState))

            expect(plugin.handleReturn!()).toBe('handled')

            act(() => {
                jest.runAllTimers()
            })

            act(() => {
                plugin.onChange!(makeUnfocused(editorState))
            })
            expect(plugin.handleReturn!()).toBe('not-handled')

            jest.useRealTimers()
        })
    })

    describe('handleSearchFocusChange', () => {
        it('should keep dropdown open on blur when searchInputFocused is true', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-search-focus-true'))

            plugin.onChange!(makeUnfocused(editorState))

            expect(plugin.handleReturn!()).toBe('handled')
        })

        it('should allow dropdown to close after setting searchInputFocused to false', () => {
            const plugin = createPlugin()
            const { SlashCommandSuggestions } = plugin

            const editorState = typeText(EditorState.createEmpty(), '/')
            const pluginMethods = mockPluginMethods(editorState)
            plugin.initialize!(pluginMethods)
            plugin.onChange!(editorState)

            render(<SlashCommandSuggestions />)

            fireEvent.click(screen.getByTestId('trigger-search-focus-true'))
            fireEvent.click(screen.getByTestId('trigger-search-focus-false'))

            const noSlashState = typeText(EditorState.createEmpty(), 'hello')
            const noSlashMethods = mockPluginMethods(noSlashState)
            plugin.initialize!(noSlashMethods)
            act(() => {
                plugin.onChange!(noSlashState)
            })

            expect(plugin.handleReturn!()).toBe('not-handled')
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

            const downEvent = createKeyboardEvent('ArrowDown')
            plugin.onDownArrow!(downEvent)
            plugin.onDownArrow!(downEvent)

            const newEditorState = typeText(EditorState.createEmpty(), '/abc')
            pluginMethods.setEditorState(newEditorState)
            plugin.initialize!(mockPluginMethods(newEditorState))
            plugin.onChange!(newEditorState)

            const returnResult = plugin.handleReturn!()
            expect(returnResult).toBe('handled')
        })
    })

    describe('SlashCommandSuggestions', () => {
        it('should be a component on the plugin', () => {
            const plugin = createPlugin()
            expect(plugin.SlashCommandSuggestions).toBeDefined()
            expect(typeof plugin.SlashCommandSuggestions).toBe('function')
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
            expect(event.preventDefault).not.toHaveBeenCalled()
            expect(result).toBeUndefined()
        })
    })
})
