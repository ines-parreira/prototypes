import React from 'react'

import { render } from '@repo/testing'
import { fireEvent } from '@testing-library/react'
import type { ContentBlock, ContentState, EditorState } from 'draft-js'

import createGuidanceVariablesPlugin from '../index'
import { attachGuidanceVariableEntities } from '../utils'

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

// onChange delegates to this helper; its behaviour is covered in utils.spec.ts.
jest.mock('../utils', () => ({
    attachGuidanceVariableEntities: jest.fn(),
}))

describe('createGuidanceVariablesPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks()
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

    it('onChange delegates entity attachment to attachGuidanceVariableEntities', () => {
        const plugin = createGuidanceVariablesPlugin()
        const editorState = {} as EditorState
        const decoratedEditorState = {} as EditorState
        ;(attachGuidanceVariableEntities as jest.Mock).mockReturnValue(
            decoratedEditorState,
        )

        const result = plugin.onChange(editorState)

        expect(attachGuidanceVariableEntities).toHaveBeenCalledWith(editorState)
        expect(result).toBe(decoratedEditorState)
    })
})
