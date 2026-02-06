import React from 'react'

import { render, screen } from '@testing-library/react'
import {
    CharacterMetadata,
    ContentBlock,
    ContentState,
    EditorState,
    genKey,
} from 'draft-js'
import { List } from 'immutable'

import type { DecoratorComponentProps } from 'pages/common/draftjs/plugins/types'

import { DiffReadOnlyEditor } from './DiffReadOnlyEditor'
import { addDiffEntities } from './diffUtils'

let capturedEditorProps: Record<string, unknown> | null = null

jest.mock('draft-js-plugins-editor', () => ({
    __esModule: true,
    default: React.forwardRef(function MockEditor(
        props: Record<string, unknown>,
        __ref: React.Ref<unknown>,
    ) {
        capturedEditorProps = props
        return <div data-testid="mock-editor" />
    }),
}))

jest.mock(
    'pages/common/draftjs/plugins/guidance-variables/GuidanceVariableTag',
    () => ({
        __esModule: true,
        default: ({
            value,
            children,
        }: {
            value: string
            children: React.ReactNode
        }) => (
            <span data-testid="guidance-variable-tag" data-value={value}>
                {children}
            </span>
        ),
    }),
)

jest.mock(
    'pages/common/draftjs/plugins/guidanceActions/GuidanceActionTag',
    () => ({
        __esModule: true,
        default: ({
            value,
            children,
        }: {
            value: string
            children: React.ReactNode
        }) => (
            <span data-testid="guidance-action-tag" data-value={value}>
                {children}
            </span>
        ),
    }),
)

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarProvider', () => ({
    __esModule: true,
    default: ({
        children,
        guidanceVariables,
        guidanceActions,
    }: {
        children: React.ReactNode
        guidanceVariables?: unknown
        guidanceActions?: unknown
    }) => (
        <div
            data-testid="toolbar-provider"
            data-has-variables={guidanceVariables ? 'true' : 'false'}
            data-has-actions={guidanceActions ? 'true' : 'false'}
        >
            {children}
        </div>
    ),
}))

jest.mock('./diffUtils', () => ({
    addDiffEntities: jest.fn((cs: ContentState) => cs),
}))

function createContentState(text: string): ContentState {
    const block = new ContentBlock({
        key: genKey(),
        type: 'unstyled',
        text,
        characterList: List(
            Array.from(text).map(() => CharacterMetadata.create()),
        ),
        depth: 0,
    })
    return ContentState.createFromBlockArray([block])
}

beforeEach(() => {
    capturedEditorProps = null
    jest.clearAllMocks()
})

describe('DiffReadOnlyEditor', () => {
    it('renders the editor inside a ToolbarProvider', () => {
        const contentState = createContentState('Hello world')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        expect(screen.getByTestId('toolbar-provider')).toBeInTheDocument()
        expect(screen.getByTestId('mock-editor')).toBeInTheDocument()
    })

    it('passes availableVariables and availableActions to ToolbarProvider', () => {
        const contentState = createContentState('Hello')
        const mockVariables = [{ name: 'Customer', variables: [] }]
        const mockActions = [{ name: 'action', value: 'val' }]

        render(
            <DiffReadOnlyEditor
                contentState={contentState}
                availableVariables={mockVariables as any}
                availableActions={mockActions as any}
            />,
        )

        const provider = screen.getByTestId('toolbar-provider')
        expect(provider).toHaveAttribute('data-has-variables', 'true')
        expect(provider).toHaveAttribute('data-has-actions', 'true')
    })

    it('renders ToolbarProvider without variables and actions when not provided', () => {
        const contentState = createContentState('Hello')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const provider = screen.getByTestId('toolbar-provider')
        expect(provider).toHaveAttribute('data-has-variables', 'false')
        expect(provider).toHaveAttribute('data-has-actions', 'false')
    })

    it('calls addDiffEntities with the contentState', () => {
        const contentState = createContentState('Hello world')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        expect(addDiffEntities).toHaveBeenCalledWith(contentState)
    })

    it('passes readOnly to the Editor', () => {
        const contentState = createContentState('Hello')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        expect(capturedEditorProps).not.toBeNull()
        expect(capturedEditorProps!.readOnly).toBe(true)
    })

    it('passes customStyleMap with DIFF_ADDED and DIFF_REMOVED styles', () => {
        const contentState = createContentState('Hello')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const styleMap = capturedEditorProps!.customStyleMap as Record<
            string,
            React.CSSProperties
        >
        expect(styleMap).toHaveProperty('DIFF_ADDED')
        expect(styleMap).toHaveProperty('DIFF_REMOVED')
        expect(styleMap.DIFF_ADDED).toEqual({
            backgroundColor: 'var(--surface-success-primary)',
            color: 'var(--content-success-primary)',
        })
        expect(styleMap.DIFF_REMOVED).toEqual({
            backgroundColor: 'var(--surface-error-secondary)',
            color: 'var(--content-error-primary)',
            textDecoration: 'line-through',
        })
    })

    it('passes an EditorState created from the contentState', () => {
        const contentState = createContentState('Test content')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const editorState = capturedEditorProps!.editorState as EditorState
        expect(editorState).toBeInstanceOf(EditorState)
        expect(editorState.getCurrentContent().getPlainText()).toBe(
            'Test content',
        )
    })

    it('passes two plugins with decorator strategies', () => {
        const contentState = createContentState('Hello')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const plugins = capturedEditorProps!.plugins as Array<{
            decorators: Array<{
                strategy: Function
                component: Function
            }>
        }>
        expect(plugins).toHaveLength(2)
        expect(plugins[0].decorators).toHaveLength(1)
        expect(plugins[1].decorators).toHaveLength(1)
    })
})

describe('decorator strategies', () => {
    function getPlugins() {
        const contentState = createContentState('Hello')
        render(<DiffReadOnlyEditor contentState={contentState} />)
        return capturedEditorProps!.plugins as Array<{
            decorators: Array<{
                strategy: (
                    contentBlock: ContentBlock,
                    callback: Function,
                    contentState: ContentState,
                ) => void
                component: React.ComponentType<DecoratorComponentProps>
            }>
        }>
    }

    it('guidance_action strategy calls callback for guidance_action entities', () => {
        const plugins = getPlugins()
        const actionStrategy = plugins[0].decorators[0].strategy

        const mockCharacter = {
            getEntity: jest.fn().mockReturnValue('entity-1'),
        }

        const mockContentBlock = {
            findEntityRanges: jest
                .fn()
                .mockImplementation(
                    (filterFn: Function, callback: Function) => {
                        if (filterFn(mockCharacter)) {
                            callback(5, 10)
                        }
                    },
                ),
        } as unknown as ContentBlock

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getType: jest.fn().mockReturnValue('guidance_action'),
            }),
        } as unknown as ContentState

        const callback = jest.fn()
        actionStrategy(mockContentBlock, callback, mockContentState)

        expect(callback).toHaveBeenCalledWith(5, 10)
    })

    it('guidance_action strategy does not call callback for non-action entities', () => {
        const plugins = getPlugins()
        const actionStrategy = plugins[0].decorators[0].strategy

        const mockCharacter = {
            getEntity: jest.fn().mockReturnValue('entity-1'),
        }

        const mockContentBlock = {
            findEntityRanges: jest
                .fn()
                .mockImplementation(
                    (filterFn: Function, callback: Function) => {
                        if (filterFn(mockCharacter)) {
                            callback(5, 10)
                        }
                    },
                ),
        } as unknown as ContentBlock

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getType: jest.fn().mockReturnValue('guidance_variable'),
            }),
        } as unknown as ContentState

        const callback = jest.fn()
        actionStrategy(mockContentBlock, callback, mockContentState)

        expect(callback).not.toHaveBeenCalled()
    })

    it('guidance_action strategy skips characters with null entityKey', () => {
        const plugins = getPlugins()
        const actionStrategy = plugins[0].decorators[0].strategy

        const mockCharacter = {
            getEntity: jest.fn().mockReturnValue(null),
        }

        const mockContentBlock = {
            findEntityRanges: jest
                .fn()
                .mockImplementation(
                    (filterFn: Function, callback: Function) => {
                        if (filterFn(mockCharacter)) {
                            callback(0, 5)
                        }
                    },
                ),
        } as unknown as ContentBlock

        const mockContentState = {} as ContentState

        const callback = jest.fn()
        actionStrategy(mockContentBlock, callback, mockContentState)

        expect(callback).not.toHaveBeenCalled()
    })

    it('guidance_variable strategy calls callback for guidance_variable entities', () => {
        const plugins = getPlugins()
        const variableStrategy = plugins[1].decorators[0].strategy

        const mockCharacter = {
            getEntity: jest.fn().mockReturnValue('entity-2'),
        }

        const mockContentBlock = {
            findEntityRanges: jest
                .fn()
                .mockImplementation(
                    (filterFn: Function, callback: Function) => {
                        if (filterFn(mockCharacter)) {
                            callback(3, 15)
                        }
                    },
                ),
        } as unknown as ContentBlock

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getType: jest.fn().mockReturnValue('guidance_variable'),
            }),
        } as unknown as ContentState

        const callback = jest.fn()
        variableStrategy(mockContentBlock, callback, mockContentState)

        expect(callback).toHaveBeenCalledWith(3, 15)
    })

    it('guidance_variable strategy does not call callback for non-variable entities', () => {
        const plugins = getPlugins()
        const variableStrategy = plugins[1].decorators[0].strategy

        const mockCharacter = {
            getEntity: jest.fn().mockReturnValue('entity-2'),
        }

        const mockContentBlock = {
            findEntityRanges: jest
                .fn()
                .mockImplementation(
                    (filterFn: Function, callback: Function) => {
                        if (filterFn(mockCharacter)) {
                            callback(3, 15)
                        }
                    },
                ),
        } as unknown as ContentBlock

        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getType: jest.fn().mockReturnValue('guidance_action'),
            }),
        } as unknown as ContentState

        const callback = jest.fn()
        variableStrategy(mockContentBlock, callback, mockContentState)

        expect(callback).not.toHaveBeenCalled()
    })
})

describe('DiffActionDecorator', () => {
    function getActionDecoratorComponent() {
        const contentState = createContentState('Hello')
        render(<DiffReadOnlyEditor contentState={contentState} />)
        const plugins = capturedEditorProps!.plugins as Array<{
            decorators: Array<{
                component: React.ComponentType<DecoratorComponentProps>
            }>
        }>
        return plugins[0].decorators[0].component
    }

    function createDecoratorProps(
        value: string,
        diffStatus: string | null,
    ): DecoratorComponentProps {
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getData: jest.fn().mockReturnValue({ value, diffStatus }),
            }),
        } as unknown as ContentState

        return {
            contentState: mockContentState,
            entityKey: 'entity-1',
            children: <span>action content</span>,
            decoratedText: value,
            getEditorState: jest.fn(),
            setEditorState: jest.fn(),
            offsetKey: 'offset-1',
        }
    }

    it('renders GuidanceActionTag with the correct value', () => {
        const Component = getActionDecoratorComponent()
        const props = createDecoratorProps('$$$myAction$$$', null)

        render(<Component {...props} />)

        const tag = screen.getByTestId('guidance-action-tag')
        expect(tag).toHaveAttribute('data-value', '$$$myAction$$$')
        expect(tag).toHaveTextContent('action content')
    })

    it('applies tagDiffAdded class when diffStatus is added', () => {
        const Component = getActionDecoratorComponent()
        const props = createDecoratorProps('$$$action$$$', 'added')

        const { container } = render(<Component {...props} />)

        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).toContain('tagDiffAdded')
    })

    it('applies tagDiffRemoved class when diffStatus is removed', () => {
        const Component = getActionDecoratorComponent()
        const props = createDecoratorProps('$$$action$$$', 'removed')

        const { container } = render(<Component {...props} />)

        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).toContain('tagDiffRemoved')
    })

    it('applies no diff class when diffStatus is null', () => {
        const Component = getActionDecoratorComponent()
        const props = createDecoratorProps('$$$action$$$', null)

        const { container } = render(<Component {...props} />)

        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).not.toContain('tagDiffAdded')
        expect(wrapper.className).not.toContain('tagDiffRemoved')
    })
})

describe('DiffVariableDecorator', () => {
    function getVariableDecoratorComponent() {
        const contentState = createContentState('Hello')
        render(<DiffReadOnlyEditor contentState={contentState} />)
        const plugins = capturedEditorProps!.plugins as Array<{
            decorators: Array<{
                component: React.ComponentType<DecoratorComponentProps>
            }>
        }>
        return plugins[1].decorators[0].component
    }

    function createDecoratorProps(
        value: string,
        diffStatus: string | null,
    ): DecoratorComponentProps {
        const mockContentState = {
            getEntity: jest.fn().mockReturnValue({
                getData: jest.fn().mockReturnValue({ value, diffStatus }),
            }),
        } as unknown as ContentState

        return {
            contentState: mockContentState,
            entityKey: 'entity-1',
            children: <span>variable content</span>,
            decoratedText: value,
            getEditorState: jest.fn(),
            setEditorState: jest.fn(),
            offsetKey: 'offset-1',
        }
    }

    it('renders GuidanceVariableTag with the correct value', () => {
        const Component = getVariableDecoratorComponent()
        const props = createDecoratorProps('&&&myVar&&&', null)

        render(<Component {...props} />)

        const tag = screen.getByTestId('guidance-variable-tag')
        expect(tag).toHaveAttribute('data-value', '&&&myVar&&&')
        expect(tag).toHaveTextContent('variable content')
    })

    it('applies tagDiffAdded class when diffStatus is added', () => {
        const Component = getVariableDecoratorComponent()
        const props = createDecoratorProps('&&&var&&&', 'added')

        const { container } = render(<Component {...props} />)

        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).toContain('tagDiffAdded')
    })

    it('applies tagDiffRemoved class when diffStatus is removed', () => {
        const Component = getVariableDecoratorComponent()
        const props = createDecoratorProps('&&&var&&&', 'removed')

        const { container } = render(<Component {...props} />)

        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).toContain('tagDiffRemoved')
    })

    it('applies no diff class when diffStatus is null', () => {
        const Component = getVariableDecoratorComponent()
        const props = createDecoratorProps('&&&var&&&', null)

        const { container } = render(<Component {...props} />)

        const wrapper = container.firstElementChild as HTMLElement
        expect(wrapper.className).not.toContain('tagDiffAdded')
        expect(wrapper.className).not.toContain('tagDiffRemoved')
    })
})
