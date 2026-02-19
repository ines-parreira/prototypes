import React from 'react'

import { render, screen } from '@testing-library/react'
import {
    CharacterMetadata,
    ContentBlock,
    ContentState,
    EditorState,
    genKey,
} from 'draft-js'
import { Map as ImmutableMap, List } from 'immutable'

import type { DecoratorComponentProps } from 'pages/common/draftjs/plugins/types'

import { DiffReadOnlyEditor } from './DiffReadOnlyEditor'
import { addDiffEntities } from './diffUtils'

let capturedEditorProps: Record<string, unknown> | null = null
const mockReplaceAttachmentURL = jest.fn((url: string) => `proxied:${url}`)

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

jest.mock('utils', () => ({
    replaceAttachmentURL: (url: string) => mockReplaceAttachmentURL(url),
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

function createAtomicImageContentState(
    src?: string,
    type = 'img',
    diffStatus: 'added' | 'removed' | null = null,
): ContentState {
    let contentState = ContentState.createFromText('')
    contentState = contentState.createEntity(type, 'MUTABLE', {
        src,
        diffStatus,
    })
    const entityKey = contentState.getLastCreatedEntityKey()
    const block = new ContentBlock({
        key: genKey(),
        type: 'atomic',
        text: ' ',
        characterList: List([
            CharacterMetadata.create({
                entity: entityKey,
            }),
        ]),
        depth: 0,
    })

    return ContentState.createFromBlockArray(
        [block],
        contentState.getEntityMap(),
    )
}

function createContentStateFromBlocks(
    blocks: Array<{
        text: string
        type?: string
        depth?: number
        data?: Record<string, unknown>
        removed?: boolean
        added?: boolean
    }>,
): ContentState {
    const contentBlocks = blocks.map(
        ({
            text,
            type = 'unstyled',
            depth = 0,
            data,
            removed = false,
            added = false,
        }) =>
            new ContentBlock({
                key: genKey(),
                type,
                text,
                characterList: List(
                    Array.from(text).map(() => {
                        const baseMeta = CharacterMetadata.create()
                        if (removed) {
                            return CharacterMetadata.applyStyle(
                                baseMeta,
                                'DIFF_REMOVED',
                            )
                        }
                        if (added) {
                            return CharacterMetadata.applyStyle(
                                baseMeta,
                                'DIFF_ADDED',
                            )
                        }
                        return baseMeta
                    }),
                ),
                depth,
                data: data ? ImmutableMap(data) : undefined,
            }),
    )

    return ContentState.createFromBlockArray(contentBlocks)
}

beforeEach(() => {
    capturedEditorProps = null
    jest.clearAllMocks()
    mockReplaceAttachmentURL.mockClear()
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

    it('passes plugins with decorators and block renderer', () => {
        const contentState = createContentState('Hello')

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const plugins = capturedEditorProps!.plugins as Array<{
            decorators: Array<{
                strategy: Function
                component: Function
            }>
            blockRendererFn?: Function
        }>
        expect(plugins).toHaveLength(3)
        expect(plugins[0].decorators).toHaveLength(1)
        expect(plugins[1].decorators).toHaveLength(1)
        expect(typeof plugins[2].blockRendererFn).toBe('function')
    })
})

describe('image block renderer plugin', () => {
    function getImageBlockRendererFn(contentState: ContentState) {
        render(<DiffReadOnlyEditor contentState={contentState} />)
        const plugins = capturedEditorProps!.plugins as Array<{
            blockRendererFn?: (
                block: ContentBlock,
                options: {
                    getEditorState: () => EditorState
                },
            ) => {
                component: React.ComponentType<{
                    block: ContentBlock
                    contentState: ContentState
                }>
                editable: boolean
            } | null
        }>

        return plugins[2].blockRendererFn!
    }

    it('returns a renderer for atomic image blocks', () => {
        const contentState = createAtomicImageContentState(
            'https://example.com/image.png',
            'img',
            'removed',
        )
        const blockRendererFn = getImageBlockRendererFn(contentState)
        const editorState = EditorState.createWithContent(contentState)
        const imageBlock = contentState.getFirstBlock()

        const rendered = blockRendererFn(imageBlock, {
            getEditorState: () => editorState,
        })

        expect(rendered).not.toBeNull()
        expect(rendered?.editable).toBe(false)

        const ImageComponent = rendered!.component
        const { container } = render(
            <ImageComponent block={imageBlock} contentState={contentState} />,
        )

        expect(screen.getByText('Removed image')).toBeInTheDocument()
        expect(mockReplaceAttachmentURL).toHaveBeenCalledWith(
            'https://example.com/image.png',
        )
        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            'proxied:https://example.com/image.png',
        )
    })

    it('supports legacy IMAGE entity types', () => {
        const contentState = createAtomicImageContentState(
            'https://example.com/legacy.png',
            'IMAGE',
            'added',
        )
        const blockRendererFn = getImageBlockRendererFn(contentState)
        const editorState = EditorState.createWithContent(contentState)
        const imageBlock = contentState.getFirstBlock()

        const rendered = blockRendererFn(imageBlock, {
            getEditorState: () => editorState,
        })

        expect(rendered).not.toBeNull()

        const ImageComponent = rendered!.component
        render(
            <ImageComponent block={imageBlock} contentState={contentState} />,
        )
        expect(screen.getByText('Added image')).toBeInTheDocument()
    })

    it('returns null for atomic blocks with non-image entities', () => {
        let contentState = ContentState.createFromText('')
        contentState = contentState.createEntity('guidance_action', 'MUTABLE', {
            value: '$$$action$$$',
        })
        const entityKey = contentState.getLastCreatedEntityKey()
        const block = new ContentBlock({
            key: genKey(),
            type: 'atomic',
            text: ' ',
            characterList: List([
                CharacterMetadata.create({
                    entity: entityKey,
                }),
            ]),
            depth: 0,
        })
        const atomicContentState = ContentState.createFromBlockArray(
            [block],
            contentState.getEntityMap(),
        )

        const blockRendererFn = getImageBlockRendererFn(atomicContentState)
        const editorState = EditorState.createWithContent(atomicContentState)
        const rendered = blockRendererFn(block, {
            getEditorState: () => editorState,
        })

        expect(rendered).toBeNull()
    })

    it('renders placeholder when image entity has no source URL', () => {
        const contentState = createAtomicImageContentState(undefined, 'img')
        const blockRendererFn = getImageBlockRendererFn(contentState)
        const editorState = EditorState.createWithContent(contentState)
        const imageBlock = contentState.getFirstBlock()
        const rendered = blockRendererFn(imageBlock, {
            getEditorState: () => editorState,
        })

        expect(rendered).not.toBeNull()
        const ImageComponent = rendered!.component
        render(
            <ImageComponent block={imageBlock} contentState={contentState} />,
        )

        expect(screen.getByText('Image unavailable')).toBeInTheDocument()
    })

    it('computes depth-aware ordered list marker classes', () => {
        const contentState = createContentStateFromBlocks([
            { text: 'Parent 1', type: 'ordered-list-item', depth: 0 },
            { text: 'Parent 2', type: 'ordered-list-item', depth: 0 },
            { text: 'Child 1', type: 'ordered-list-item', depth: 1 },
            { text: 'Grandchild 1', type: 'ordered-list-item', depth: 2 },
            { text: 'Grandchild 2', type: 'ordered-list-item', depth: 2 },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        expect(blockStyleFn(blocks[0])).toContain('markerStyle0')
        expect(blockStyleFn(blocks[0])).toContain('listResetDepth0')
        expect(blockStyleFn(blocks[1])).not.toContain('listResetDepth0')

        expect(blockStyleFn(blocks[2])).toContain('markerStyle1')
        expect(blockStyleFn(blocks[2])).toContain('listResetDepth1')

        expect(blockStyleFn(blocks[3])).toContain('markerStyle2')
        expect(blockStyleFn(blocks[3])).toContain('listResetDepth2')
        expect(blockStyleFn(blocks[4])).toContain('markerStyle2')
        expect(blockStyleFn(blocks[4])).not.toContain('listResetDepth2')
    })

    it('honors visualListStyle override when computing list classes', () => {
        const contentState = createContentStateFromBlocks([
            {
                text: 'Visual unordered',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const block = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getFirstBlock()

        const className = blockStyleFn(block)
        expect(className).toContain('listUnordered')
        expect(className).not.toContain('listOrdered')
    })

    it('resets ordered marker counters when parent list item changes', () => {
        const contentState = createContentStateFromBlocks([
            { text: 'Root 1', type: 'ordered-list-item', depth: 0 },
            { text: 'Child 1', type: 'ordered-list-item', depth: 1 },
            { text: 'Child 2', type: 'ordered-list-item', depth: 1 },
            { text: 'Root 2', type: 'ordered-list-item', depth: 0 },
            { text: 'Child A', type: 'ordered-list-item', depth: 1 },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        expect(blockStyleFn(blocks[4])).toContain('listResetDepth1')
    })

    it('keeps list flow when a removed non-list block is between list items', () => {
        const contentState = createContentStateFromBlocks([
            { text: 'Root 1', type: 'ordered-list-item', depth: 0 },
            { text: 'Child 1', type: 'ordered-list-item', depth: 1 },
            { text: 'Old removed paragraph', type: 'unstyled', removed: true },
            { text: 'Child 2', type: 'ordered-list-item', depth: 1 },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        const child2ClassName = blockStyleFn(blocks[3])
        expect(child2ClassName).toContain('markerStyle1')
        expect(child2ClassName).not.toContain('listResetDepth1')
    })

    it('applies depth classes to non-list blocks', () => {
        const contentState = createContentStateFromBlocks([
            { text: 'Top paragraph', type: 'unstyled', depth: 0 },
            { text: 'Nested paragraph', type: 'unstyled', depth: 2 },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        expect(blockStyleFn(blocks[0])).toBe('')
        expect(blockStyleFn(blocks[1])).toContain('blockDepth2')
    })

    it('marks whitespace-only diff blocks as break markers', () => {
        const contentState = createContentStateFromBlocks([
            { text: '\u00A0', type: 'unstyled', removed: true },
            { text: '\u00A0', type: 'unstyled', added: true },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        expect(blockStyleFn(blocks[0])).toContain('diffBreakBlock')
        expect(blockStyleFn(blocks[0])).toContain('diffBreakBlockRemoved')
        expect(blockStyleFn(blocks[1])).toContain('diffBreakBlock')
        expect(blockStyleFn(blocks[1])).toContain('diffBreakBlockAdded')
    })

    it('resets counter when list style changes at the same depth', () => {
        const contentState = createContentStateFromBlocks([
            {
                text: 'Ordered style',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'ordered' },
            },
            {
                text: 'Unordered style',
                type: 'ordered-list-item',
                depth: 0,
                data: { visualListStyle: 'unordered' },
            },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        const className = blockStyleFn(blocks[1])
        expect(className).toContain('listUnordered')
        expect(className).toContain('listResetDepth0')
    })

    it('does not reset root counter when previous block is deeper', () => {
        const contentState = createContentStateFromBlocks([
            { text: 'Root 1', type: 'ordered-list-item', depth: 0 },
            { text: 'Child 1', type: 'ordered-list-item', depth: 1 },
            { text: 'Root 2', type: 'ordered-list-item', depth: 0 },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        expect(blockStyleFn(blocks[2])).not.toContain('listResetDepth0')
    })

    it('falls back to markerStyle0 when list style changes before the chain starts', () => {
        const contentState = createContentStateFromBlocks([
            { text: 'Parent', type: 'ordered-list-item', depth: 0 },
            {
                text: 'Old sibling',
                type: 'ordered-list-item',
                depth: 1,
                data: { visualListStyle: 'unordered' },
            },
            {
                text: 'Current sibling',
                type: 'ordered-list-item',
                depth: 1,
                data: { visualListStyle: 'ordered' },
            },
        ])

        render(<DiffReadOnlyEditor contentState={contentState} />)

        const blockStyleFn = capturedEditorProps!.blockStyleFn as (
            block: ContentBlock,
        ) => string
        const blocks = (capturedEditorProps!.editorState as EditorState)
            .getCurrentContent()
            .getBlocksAsArray()

        const className = blockStyleFn(blocks[2])
        expect(className).toContain('markerStyle0')
        expect(className).toContain('listResetDepth1')
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
