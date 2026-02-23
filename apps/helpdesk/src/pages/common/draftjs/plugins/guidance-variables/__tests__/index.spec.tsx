import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import type { ContentBlock, ContentState } from 'draft-js'
import { EditorState } from 'draft-js'

import createGuidanceVariablesPlugin from '../index'
import { addGuidanceVariableEntity } from '../utils'

// Mock the GuidanceVariableTag component
jest.mock('../GuidanceVariableTag', () => {
    return {
        __esModule: true,
        default: function MockGuidanceVariableTag(props: any) {
            return (
                <div
                    data-testid="guidance-variable-tag"
                    onClick={(e) =>
                        props.onClick && props.onClick(e.currentTarget)
                    }
                >
                    {props.children}
                </div>
            )
        },
    }
})

// Mock findWithRegex
jest.mock('find-with-regex', () => {
    return jest.fn().mockImplementation((regex, block, callback) => {
        callback(6, 22) // Mock finding a variable at positions 6-22
    })
})

// Mock the utils
jest.mock('../utils', () => ({
    addGuidanceVariableEntity: jest.fn((block, contentState) => contentState),
}))

describe('createGuidanceVariablesPlugin', () => {
    let mockEditorStatePush: jest.SpyInstance
    let mockEditorStateForceSelection: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        mockEditorStatePush = jest
            .spyOn(EditorState, 'push')
            .mockImplementation(() => ({}) as EditorState)
        mockEditorStateForceSelection = jest
            .spyOn(EditorState, 'forceSelection')
            .mockImplementation(() => ({}) as EditorState)
    })

    afterEach(() => {
        mockEditorStatePush.mockRestore()
        mockEditorStateForceSelection.mockRestore()
    })

    it('creates a plugin with decorators', () => {
        const plugin = createGuidanceVariablesPlugin()
        expect(plugin).toBeDefined()
        expect(plugin.decorators).toBeDefined()
        expect(plugin.decorators.length).toBe(1)
        expect(plugin.onChange).toBeDefined()
    })

    it('renders decorator component with correct props', () => {
        const plugin = createGuidanceVariablesPlugin()
        const DecoratorComponent = plugin.decorators[0].component

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getData: jest.fn().mockReturnValue({
                    value: '&&&customer.name&&&',
                }),
            }),
        } as unknown as ContentState

        const { getByTestId } = render(
            <DecoratorComponent
                contentState={mockContentState}
                entityKey="entity-1"
                decoratedText="&&&customer.name&&&"
                offsetKey="offset-1"
                children="&&&customer.name&&&"
                getEditorState={() => ({}) as EditorState}
                setEditorState={() => {}}
            />,
        )

        const tag = getByTestId('guidance-variable-tag')
        expect(tag).toBeDefined()
        expect(tag.textContent).toBe('&&&customer.name&&&')
    })

    it('calls onClick handler when decorator component is clicked', () => {
        const mockOnClick = jest.fn()
        const plugin = createGuidanceVariablesPlugin({
            onClick: mockOnClick,
        })
        const DecoratorComponent = plugin.decorators[0].component

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getData: jest.fn().mockReturnValue({
                    value: '&&&customer.name&&&',
                }),
            }),
        } as unknown as ContentState

        const { getByTestId } = render(
            <DecoratorComponent
                contentState={mockContentState}
                entityKey="entity-1"
                decoratedText="&&&customer.name&&&"
                offsetKey="offset-1"
                children="&&&customer.name&&&"
                getEditorState={() => ({}) as EditorState}
                setEditorState={() => {}}
            />,
        )

        const tag = getByTestId('guidance-variable-tag')
        fireEvent.click(tag)

        expect(mockOnClick).toHaveBeenCalledWith(
            'entity-1',
            expect.any(HTMLElement),
        )
    })

    it('strategy finds entity ranges of type guidance_variable', () => {
        const plugin = createGuidanceVariablesPlugin()
        const strategy = plugin.decorators[0].strategy

        const mockCharacter = {
            getEntity: jest.fn().mockReturnValue('entity-1'),
        }

        const mockContentBlock = {
            findEntityRanges: jest
                .fn()
                .mockImplementation((filterFn, callback) => {
                    // Simulate finding an entity
                    const result = filterFn(mockCharacter)
                    if (result) {
                        callback(5, 10)
                    }
                }),
        } as unknown as ContentBlock

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getType: jest.fn().mockReturnValue('guidance_variable'),
            }),
        } as unknown as ContentState

        const callback = jest.fn()

        strategy(mockContentBlock, callback, mockContentState)

        expect(mockContentBlock.findEntityRanges).toHaveBeenCalled()
        expect(callback).toHaveBeenCalledWith(5, 10)
    })

    it('onChange processes blocks and adds entities to guidance variables', () => {
        const plugin = createGuidanceVariablesPlugin()

        // Mock editor state and content
        const mockBlock = {
            getKey: jest.fn().mockReturnValue('block-1'),
            getText: jest.fn().mockReturnValue('Hello &&&customer.name&&&'),
        }

        const mockBlockMap = {
            forEach: jest.fn((callback) => {
                callback(mockBlock)
            }),
        }

        const mockContentState = {
            getBlockMap: jest.fn().mockReturnValue(mockBlockMap),
            equals: jest.fn().mockReturnValue(false),
            createEntity: jest.fn().mockReturnThis(),
            getLastCreatedEntityKey: jest.fn().mockReturnValue('entity-1'),
        }

        const mockSelection = {
            getHasFocus: jest.fn().mockReturnValue(true),
            merge: jest.fn().mockReturnThis(),
        }

        const mockEditorState = {
            getCurrentContent: jest.fn().mockReturnValue(mockContentState),
            getSelection: jest.fn().mockReturnValue(mockSelection),
        } as unknown as EditorState

        const mockNewEditorState = {
            getSelection: jest.fn().mockReturnValue(mockSelection),
        } as unknown as EditorState

        mockEditorStatePush.mockReturnValue(mockNewEditorState)
        mockEditorStateForceSelection.mockReturnValue(mockNewEditorState)

        // Call the onChange function
        const result = plugin.onChange(mockEditorState)

        // Verify the result
        expect(result).toBe(mockNewEditorState)
        expect(addGuidanceVariableEntity).toHaveBeenCalledWith(
            mockBlock,
            mockContentState,
            6,
            22,
        )
        expect(mockEditorStatePush).toHaveBeenCalledWith(
            mockEditorState,
            mockContentState,
            'apply-entity',
        )
        // Verify focus is preserved
        expect(mockSelection.merge).toHaveBeenCalledWith({ hasFocus: true })
        expect(mockEditorStateForceSelection).toHaveBeenCalledWith(
            mockNewEditorState,
            mockSelection,
        )
    })

    it('onChange returns original state when content has not changed', () => {
        const plugin = createGuidanceVariablesPlugin()

        // Mock editor state and content
        const mockBlock = {
            getKey: jest.fn().mockReturnValue('block-1'),
            getText: jest.fn().mockReturnValue('Hello &&&customer.name&&&'),
        }

        const mockBlockMap = {
            forEach: jest.fn((callback) => {
                callback(mockBlock)
            }),
        }

        const mockContentState = {
            getBlockMap: jest.fn().mockReturnValue(mockBlockMap),
            equals: jest.fn().mockReturnValue(true), // Content has not changed
        }

        const mockEditorState = {
            getCurrentContent: jest.fn().mockReturnValue(mockContentState),
        } as unknown as EditorState

        // Call the onChange function
        const result = plugin.onChange(mockEditorState)

        // Verify the result
        expect(result).toBe(mockEditorState)
    })

    it('onChange preserves unfocused state when editor is not focused', () => {
        const plugin = createGuidanceVariablesPlugin()

        // Mock editor state and content
        const mockBlock = {
            getKey: jest.fn().mockReturnValue('block-1'),
            getText: jest.fn().mockReturnValue('Hello &&&customer.name&&&'),
        }

        const mockBlockMap = {
            forEach: jest.fn((callback) => {
                callback(mockBlock)
            }),
        }

        const mockContentState = {
            getBlockMap: jest.fn().mockReturnValue(mockBlockMap),
            equals: jest.fn().mockReturnValue(false),
        }

        const mockSelection = {
            getHasFocus: jest.fn().mockReturnValue(false), // Editor is not focused
            merge: jest.fn().mockReturnThis(),
        }

        const mockEditorState = {
            getCurrentContent: jest.fn().mockReturnValue(mockContentState),
            getSelection: jest.fn().mockReturnValue(mockSelection),
        } as unknown as EditorState

        const mockNewEditorState = {
            getSelection: jest.fn().mockReturnValue(mockSelection),
        } as unknown as EditorState

        mockEditorStatePush.mockReturnValue(mockNewEditorState)
        mockEditorStateForceSelection.mockReturnValue(mockNewEditorState)

        // Call the onChange function
        const result = plugin.onChange(mockEditorState)

        // Verify the result
        expect(result).toBe(mockNewEditorState)
        expect(mockEditorStatePush).toHaveBeenCalledWith(
            mockEditorState,
            mockContentState,
            'apply-entity',
        )
        // Verify unfocused state is preserved
        expect(mockSelection.merge).toHaveBeenCalledWith({ hasFocus: false })
        expect(mockEditorStateForceSelection).toHaveBeenCalledWith(
            mockNewEditorState,
            mockSelection,
        )
    })
})
