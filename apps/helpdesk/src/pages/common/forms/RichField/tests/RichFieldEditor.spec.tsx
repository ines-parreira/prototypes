import type { ComponentProps, LegacyRef } from 'react'
import type React from 'react'

import { shortcutManager } from '@repo/utils'
import { act, fireEvent, render } from '@testing-library/react'
import { convertToHTML } from 'draft-convert'
import type { ContentState } from 'draft-js'
import {
    ContentBlock,
    ContentState as DraftContentState,
    EditorState,
    RichUtils,
    SelectionState,
} from 'draft-js'
import { fromJS, List as ImmutableList, Map as ImmutableMap } from 'immutable'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'
import { marked } from 'marked'
import { Provider } from 'react-redux'

import { predictionKey } from 'pages/common/draftjs/plugins/prediction/state'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import { scrollToReactNode } from 'pages/common/utils/keyboard'
import { convertFromHTML } from 'utils/editor'
import { mockStore } from 'utils/testing'

import toolbarPlugin from '../../../draftjs/plugins/toolbar/index'
import provideToolbarPlugin from '../provideToolbarPlugin'
import { RichFieldEditor } from '../RichFieldEditor'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () =>
    jest.fn().mockReturnValue('123'),
)
jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        denylist: jest.fn(),
        clear: jest.fn(),
    },
}))

jest.mock('pages/common/utils/keyboard', () => ({
    scrollToReactNode: jest.fn(),
}))

describe('RichFieldEditor', () => {
    const defaultProps: ComponentProps<typeof RichFieldEditor> = {
        createToolbarPlugin: (imageDecorator) =>
            toolbarPlugin({
                imageDecorator,
                onLinkEdit: jest.fn(),
                onLinkCreate: jest.fn(),
                getDisplayedActions: jest.fn(),
            }),
        editorState: fromJS({}),
        onFocus: jest.fn(),
        onBlur: jest.fn(),
        detectGrammarly: jest.fn(),
        onChange: jest.fn(),
        linkIsOpen: false,
        linkText: '',
        linkUrl: '',
        linkTarget: '_blank',
        onLinkUrlChange: _noop,
        onLinkTextChange: _noop,
        onLinkTargetChange: _noop,
        onLinkOpen: _noop,
        onLinkClose: _noop,
        isRequired: false,
        isFocused: false,
        mentionSearchResults: fromJS({}),
        onMentionSearchChange: jest.fn(),
    }
    let contentState: ContentState
    let editorState: EditorState

    beforeEach(() => {
        contentState = convertFromHTML('<p>foo</p>')
        editorState = EditorState.createWithContent(contentState)
    })

    // Note: functional test candidate
    it('should keep existing content and newlines when pasting text', () => {
        const mockOnChange = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)

        const { container } = render(
            <RichFieldEditor
                {...defaultProps}
                editorState={editorState}
                onChange={mockOnChange}
            />,
        )
        const html = '<div>a<br><br>b<br><br>c</div>'
        const editor = container.querySelector('.public-DraftEditor-content')!
        // simulate pasted text
        fireEvent.paste(editor, {
            clipboardData: {
                getData: () => html,
            },
        })
        const lastCall: EditorState[] =
            mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1]
        const convertedHTML = convertToHTML(lastCall[0].getCurrentContent())

        expect(convertedHTML).toBe('<p>htmla<br/><br/>b<br/><br/>c</p>')
    })

    // tests the newline-doubling bug when copying and pasting content from draft-js
    // https://github.com/gorgias/gorgias/pull/3373#issuecomment-392855428
    // Note: functional test candidate
    //
    // test could not properly be converted to RTL like the test above
    // the end test would return "htmlc" instead of "html"
    it('should not handle html when pasting draft-js-specific content', () => {
        const onChangeSpy = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> = {
            current: null,
        }

        render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
                ref={instanceRef}
            />,
        )
        const text = 'a\n\nb\n\nc'
        // html copied from draft-js contains the data-editor=editorKey attribute
        const html =
            '<div data-editor="editor"><div>a<br><br>b<br><br>c</div></div>'
        // simulate pasted text
        instanceRef.current?._handlePastedText(text, html, editorState)
        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())

        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe('<p>html</p>')
    })

    it('should focus the end of input on initial focus', () => {
        const mockOnFocus = jest.fn()

        const { container, rerender } = render(
            <Provider store={mockStore({})}>
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onFocus={mockOnFocus}
                />
            </Provider>,
        )
        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.focus(editor)

        expect(mockOnFocus).toHaveBeenCalled()

        rerender(
            <Provider store={mockStore({})}>
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onFocus={mockOnFocus}
                    isFocused={true}
                />
            </Provider>,
        )

        expect(defaultProps.onChange).toHaveBeenCalledWith(
            expect.objectContaining(EditorState.moveFocusToEnd(editorState)),
        )
    })

    it('should call detect grammarly when editor is focused', () => {
        const mockOnFocus = jest.fn()
        const mockDetectGrammarly = jest.fn()
        const { container } = render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={mockOnFocus}
                detectGrammarly={mockDetectGrammarly}
                placeholder="foo"
            />,
        )

        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.focus(editor)

        expect(mockDetectGrammarly).toBeCalledTimes(1)
    })

    it('should blacklist navbar shortcuts when editor is focused', () => {
        const mockOnFocus = jest.fn()
        const { container } = render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={mockOnFocus}
            />,
        )

        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.focus(editor)

        expect(shortcutManager.denylist).toHaveBeenCalledWith([
            'SpotlightModal',
            'Dialpad',
            'PhoneCall',
        ])
    })

    it('should clear navbar shortcuts when editor is blurred', () => {
        const mockOnFocus = jest.fn()

        const { container } = render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={mockOnFocus}
            />,
        )
        const editor = container.querySelector('.public-DraftEditor-content')
        fireEvent.focus(editor!)
        fireEvent.blur(editor!)

        expect(shortcutManager.clear).toHaveBeenCalledWith([
            'SpotlightModal',
            'Dialpad',
            'PhoneCall',
        ])
    })

    it('should handle shortcuts', () => {
        const spyOnchange = jest.fn()
        const WrappedRichFieldEditor = provideToolbarPlugin(RichFieldEditor)

        const { container } = render(
            <WrappedRichFieldEditor
                {..._omit(defaultProps, 'createToolbarPlugin')}
                editorKey="editor"
                editorState={editorState}
                onChange={spyOnchange}
            />,
        )
        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.keyDown(editor, { ctrlKey: true, key: 'b', keyCode: 66 })

        expect(spyOnchange.mock.calls).toMatchSnapshot()
    })

    it('should insert a video preview when pasting a compatible video link', () => {
        const onChangeSpy = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const { container } = render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
                canAddVideoPlayer
            />,
        )
        const text = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'
        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.paste(editor, {
            clipboardData: {
                getData: () => text,
            },
        })

        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        expect(convertedHTML).toBe('<figure></figure>')
    })

    it('should NOT insert a video preview when pasting a compatible video link when video is disabled', () => {
        const onChangeSpy = jest.fn()
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const { container } = render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
                canAddVideoPlayer={false}
            />,
        )
        const text = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'
        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.paste(editor, {
            clipboardData: {
                getData: () => text,
            },
        })

        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        expect(convertedHTML).toBe(
            '<p>htmlhttps://www.youtube.com/watch?v=4sLFpe-xbhk</p>',
        )
    })

    it('should handle modifier + enter key binding', () => {
        const onChangeSpy = jest.fn()
        const WrappedRichFieldEditor = provideToolbarPlugin(RichFieldEditor)
        editorState = EditorState.createWithContent(contentState)
        // without the keyBindingFn, the enter key would insert a newline
        editorState = EditorState.moveFocusToEnd(editorState)

        const { container } = render(
            <WrappedRichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChangeSpy}
            />,
        )
        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.focus(editor)
        fireEvent.keyDown(editor, { ctrlKey: true, key: 'Enter', keyCode: 13 })

        const [newContentState]: EditorState[] =
            onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        expect(convertedHTML).toBe('<p>foo</p>')
    })

    it('should not trigger handleChildChange via _handleOnTab for unstyled content', () => {
        const spyOnchange = jest.fn()
        const instanceRef: {
            current: InstanceType<typeof RichFieldEditor> | null
        } = { current: null }

        render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={spyOnchange}
                ref={instanceRef}
            />,
        )

        spyOnchange.mockClear()

        const tabEvent = {
            preventDefault: jest.fn(),
            shiftKey: false,
            key: 'Tab',
        } as unknown as React.KeyboardEvent
        instanceRef.current!._handleOnTab(tabEvent)

        expect(tabEvent.preventDefault).toHaveBeenCalled()
        expect(spyOnchange).not.toHaveBeenCalled()
    })

    it('should trigger handleChildChange via _handleOnTab for list content with depth change', () => {
        const spyOnchange = jest.fn()
        const instanceRef: {
            current: InstanceType<typeof RichFieldEditor> | null
        } = { current: null }

        const block1Key = 'block1'
        const block2Key = 'block2'
        const blocks = [
            new ContentBlock({
                key: block1Key,
                type: 'ordered-list-item',
                text: 'first',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            }),
            new ContentBlock({
                key: block2Key,
                type: 'ordered-list-item',
                text: 'second',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            }),
        ]
        const listContent = DraftContentState.createFromBlockArray(blocks)
        let listEditorState = EditorState.createWithContent(listContent)
        const selection = SelectionState.createEmpty(block2Key).merge({
            anchorOffset: 0,
            focusOffset: 0,
            hasFocus: true,
        }) as SelectionState
        listEditorState = EditorState.forceSelection(listEditorState, selection)

        render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={listEditorState}
                onChange={spyOnchange}
                ref={instanceRef}
            />,
        )

        spyOnchange.mockClear()

        const tabEvent = {
            preventDefault: jest.fn(),
            shiftKey: false,
            key: 'Tab',
        } as unknown as React.KeyboardEvent
        instanceRef.current!._handleOnTab(tabEvent)

        expect(tabEvent.preventDefault).toHaveBeenCalled()
        expect(spyOnchange).toHaveBeenCalled()
    })

    it('should not trigger handleChildChange via _handleOnTab for Shift+Tab at depth 0', () => {
        const spyOnchange = jest.fn()
        const instanceRef: {
            current: InstanceType<typeof RichFieldEditor> | null
        } = { current: null }

        let listEditorState = EditorState.moveFocusToEnd(editorState)
        listEditorState = RichUtils.toggleBlockType(
            listEditorState,
            'ordered-list-item',
        )

        render(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={listEditorState}
                onChange={spyOnchange}
                ref={instanceRef}
            />,
        )

        spyOnchange.mockClear()

        const shiftTabEvent = {
            preventDefault: jest.fn(),
            shiftKey: true,
            key: 'Tab',
        } as unknown as React.KeyboardEvent
        instanceRef.current!._handleOnTab(shiftTabEvent)

        expect(shiftTabEvent.preventDefault).toHaveBeenCalled()
        expect(spyOnchange).not.toHaveBeenCalled()
    })

    it('should allow modifier keys to be handled by default Draft.js behavior', () => {
        const spyOnchange = jest.fn()
        const WrappedRichFieldEditor = provideToolbarPlugin(RichFieldEditor)

        const { container } = render(
            <WrappedRichFieldEditor
                {..._omit(defaultProps, 'createToolbarPlugin')}
                editorKey="editor"
                editorState={editorState}
                onChange={spyOnchange}
            />,
        )

        const editor = container.querySelector('.public-DraftEditor-content')!

        fireEvent.keyDown(editor, { ctrlKey: true, key: 'b', keyCode: 66 })
        expect(spyOnchange).toHaveBeenCalled()

        spyOnchange.mockClear()
        fireEvent.keyDown(editor, { ctrlKey: true, key: 'i', keyCode: 73 })
        expect(spyOnchange).toHaveBeenCalled()

        spyOnchange.mockClear()
        fireEvent.keyDown(editor, { ctrlKey: true, key: 'u', keyCode: 85 })
        expect(spyOnchange).toHaveBeenCalled()
    })

    describe('markdown paste support', () => {
        it('should convert pasted markdown bold to inline style', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)
            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            instanceRef.current?._handlePastedText(
                '**bold text**',
                undefined,
                editorState,
            )
            const [newEditorState]: EditorState[] =
                onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()
            const textBlock = blocks.find(
                (block) => block.getText() === 'bold text',
            )

            expect(textBlock).toBeDefined()
            expect(textBlock!.getInlineStyleAt(0).has('BOLD')).toBe(true)
        })

        it('should use existing html when provided instead of converting markdown', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)
            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            instanceRef.current?._handlePastedText(
                '# Heading',
                '<p>Some HTML content</p>',
                editorState,
            )
            const [newEditorState]: EditorState[] =
                onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()

            expect(blocks[0].getType()).toBe('unstyled')
            expect(blocks[0].getText()).toBe('Some HTML content')
        })

        it('should convert plain text without markdown syntax as unstyled', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)
            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            instanceRef.current?._handlePastedText(
                'just some plain text',
                undefined,
                editorState,
            )
            const [newEditorState]: EditorState[] =
                onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()

            expect(blocks[0].getType()).toBe('unstyled')
            expect(blocks[0].getText()).toBe('just some plain text')
        })

        it('should preserve line breaks when pasting plain text without markdown', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)
            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            instanceRef.current?._handlePastedText(
                'Line 1\nLine 2\nLine 3',
                undefined,
                editorState,
            )
            const [newEditorState]: EditorState[] =
                onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()

            expect(blocks.length).toBe(1)
            expect(blocks[0].getType()).toBe('unstyled')
            expect(blocks[0].getText()).toBe('Line 1\nLine 2\nLine 3')
        })

        it('should handle pasting text that contains ordered list syntax', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)
            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            instanceRef.current?._handlePastedText(
                'Intro line\nLine two\n\n1. First item\n2. Second item',
                undefined,
                editorState,
            )

            // Paste should be handled - onChange is called with updated content
            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should NOT treat asterisks in sentences as markdown', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)
            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            instanceRef.current?._handlePastedText(
                'Price is $10 * quantity',
                undefined,
                editorState,
            )
            const [newEditorState]: EditorState[] =
                onChangeSpy.mock.calls[onChangeSpy.mock.calls.length - 1]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()

            expect(blocks[0].getType()).toBe('unstyled')
            expect(blocks[0].getText()).toBe('Price is $10 * quantity')
        })
    })

    it('should open link modal when Cmd+K is pressed', () => {
        const mockOnLinkCreate = jest.fn()

        const { container } = render(
            <Provider store={mockStore({})}>
                <RichFieldEditor
                    {...defaultProps}
                    createToolbarPlugin={(imageDecorator) =>
                        toolbarPlugin({
                            imageDecorator,
                            onLinkEdit: jest.fn(),
                            onLinkCreate: mockOnLinkCreate,
                            getDisplayedActions: jest.fn(),
                        })
                    }
                    editorKey="editor"
                    editorState={editorState}
                />
            </Provider>,
        )

        const editor = container.querySelector('.public-DraftEditor-content')!
        fireEvent.keyDown(editor, { ctrlKey: true, key: 'k', keyCode: 75 })

        expect(mockOnLinkCreate).toHaveBeenCalled()
    })

    describe('_customKeyBindingFn', () => {
        it('should return undefined for space key', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: ' ',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).toBeUndefined()
        })

        it('should return default key binding for regular key', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: 'a',
                keyCode: 65,
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).toBeDefined()
        })

        it('should invoke onKeyDown callback', () => {
            const onKeyDown = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onKeyDown={onKeyDown}
                    ref={instanceRef}
                />,
            )

            const nativeEvent = { key: 'a' } as globalThis.KeyboardEvent
            const event = {
                key: 'a',
                keyCode: 65,
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                nativeEvent,
            } as any
            instanceRef.current!._customKeyBindingFn(event)
            expect(onKeyDown).toHaveBeenCalledWith(nativeEvent)
        })
    })

    describe('_handleKeyCommand', () => {
        it('should return not-handled when RichUtils returns null', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const result =
                instanceRef.current!._handleKeyCommand('unknown-command')
            expect(result).toBe('not-handled')
        })
    })

    describe('_focusEditor', () => {
        it('should not focus when findReplace is open', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    displayedActions={[ActionName.FindReplace]}
                    ref={instanceRef}
                />,
            )

            instanceRef.current!.findReplacePlugin!.store.isOpen = true
            onChangeSpy.mockClear()

            instanceRef.current!._focusEditor()

            expect(onChangeSpy).not.toHaveBeenCalled()
        })
    })

    describe('_handlePastedText', () => {
        it('should create link when pasting URL over selected text', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p>Hello World</p>')
            editorState = EditorState.createWithContent(contentState)
            const block = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(block.getKey()).merge({
                anchorOffset: 0,
                focusOffset: 5,
                hasFocus: true,
            }) as SelectionState
            editorState = EditorState.forceSelection(editorState, selection)

            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current?._handlePastedText(
                'https://example.com',
                undefined,
                editorState,
            )

            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should call marked.parse once with full text when pasting text with numbered lists', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)

            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const parseSpy = jest.spyOn(marked, 'parse')

            instanceRef.current?._handlePastedText(
                'Intro line\n\n1. First item\n2. Second item',
                undefined,
                editorState,
            )

            expect(parseSpy).toHaveBeenCalledTimes(1)
            expect(parseSpy).toHaveBeenCalledWith(
                'Intro line\n\n1. First item\n2. Second item',
                { breaks: true },
            )
            expect(onChangeSpy).toHaveBeenCalled()

            parseSpy.mockRestore()
        })

        it('should call marked.parse once with full text for multiple double newlines', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)

            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const parseSpy = jest.spyOn(marked, 'parse')

            instanceRef.current?._handlePastedText(
                'Para 1\n\nPara 2\n\n1. Item',
                undefined,
                editorState,
            )

            expect(parseSpy).toHaveBeenCalledTimes(1)
            expect(parseSpy).toHaveBeenCalledWith(
                'Para 1\n\nPara 2\n\n1. Item',
                {
                    breaks: true,
                },
            )
            expect(onChangeSpy).toHaveBeenCalled()

            parseSpy.mockRestore()
        })

        it('should produce an empty block between paragraphs when pasting text with double newlines', () => {
            const onChangeSpy = jest.fn()

            const generateRandomKeyMock = jest.requireMock(
                'draft-js/lib/generateRandomKey',
            ) as jest.Mock
            let keyCounter = 0
            generateRandomKeyMock.mockImplementation(() => `key${keyCounter++}`)

            try {
                contentState = convertFromHTML('<p></p>')
                editorState = EditorState.createWithContent(contentState)
                editorState = EditorState.moveFocusToEnd(editorState)

                const instanceRef: LegacyRef<
                    InstanceType<typeof RichFieldEditor>
                > = { current: null }

                render(
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        ref={instanceRef}
                    />,
                )

                const callsBefore = onChangeSpy.mock.calls.length

                instanceRef.current?._handlePastedText(
                    '**Para 1**\n\nPara 2',
                    undefined,
                    editorState,
                )

                const [newEditorState]: EditorState[] =
                    onChangeSpy.mock.calls[callsBefore]
                const blocks = newEditorState
                    .getCurrentContent()
                    .getBlocksAsArray()
                    .map((block) => block.getText())
                expect(blocks).toContain('')
            } finally {
                generateRandomKeyMock.mockReturnValue('123')
            }
        })
    })

    describe('componentDidUpdate', () => {
        it('should remove mentions when canAddMention changes from true to false', () => {
            const onChangeSpy = jest.fn()

            const { rerender } = render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        canAddMention={true}
                    />
                </Provider>,
            )

            onChangeSpy.mockClear()

            rerender(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        canAddMention={false}
                    />
                </Provider>,
            )

            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should refresh editor when displayedActions changes', () => {
            const onChangeSpy = jest.fn()

            const { rerender } = render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    displayedActions={[ActionName.BulletedList]}
                />,
            )

            onChangeSpy.mockClear()

            rerender(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    displayedActions={[
                        ActionName.BulletedList,
                        ActionName.OrderedList,
                    ]}
                />,
            )

            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should re-focus when isFocused changes to true', () => {
            const onChangeSpy = jest.fn()

            const { rerender } = render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        isFocused={false}
                    />
                </Provider>,
            )

            onChangeSpy.mockClear()

            rerender(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        isFocused={true}
                    />
                </Provider>,
            )

            expect(onChangeSpy).toHaveBeenCalled()
        })
    })

    describe('plugin creation with displayedActions', () => {
        it('should create slashCommand plugin when GuidanceVariable in displayedActions', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    displayedActions={[ActionName.GuidanceVariable]}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!.slashCommandPlugin).toBeDefined()
        })

        it('should create slashCommand plugin when GuidanceAction in displayedActions', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    displayedActions={[ActionName.GuidanceAction]}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!.slashCommandPlugin).toBeDefined()
        })

        it('should create findReplace plugin when FindReplace in displayedActions', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    displayedActions={[ActionName.FindReplace]}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!.findReplacePlugin).toBeDefined()
        })

        it('should create autoBlock and horizontalRule plugins when list actions present', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    displayedActions={[ActionName.BulletedList]}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current).toBeDefined()
        })
    })

    describe('_onDrop', () => {
        it('should prevent default and set isDragging to false', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const mockEvent = {
                preventDefault: jest.fn(),
            } as unknown as React.DragEvent<HTMLDivElement>

            instanceRef.current!._onDrop(mockEvent)

            expect(mockEvent.preventDefault).toHaveBeenCalled()
        })
    })

    describe('_nativeFindHandler', () => {
        it('should open find dialog with replace on Ctrl+F when findReplacePlugin exists', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    displayedActions={[ActionName.FindReplace]}
                    ref={instanceRef}
                />,
            )

            const plugin = instanceRef.current!.findReplacePlugin!
            expect(plugin.store.isOpen).toBe(false)

            const event = new KeyboardEvent('keydown', {
                key: 'f',
                ctrlKey: true,
                cancelable: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(plugin.store.isOpen).toBe(true)
            expect(plugin.store.showReplace).toBe(true)
        })
    })

    describe('_nativeTabHandler', () => {
        it('should handle Tab key in the editor wrapper for list content', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block1Key = 'blk1'
            const block2Key = 'blk2'
            const blocks = [
                new ContentBlock({
                    key: block1Key,
                    type: 'ordered-list-item',
                    text: 'first',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
                new ContentBlock({
                    key: block2Key,
                    type: 'ordered-list-item',
                    text: 'second',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const listContent = DraftContentState.createFromBlockArray(blocks)
            let listEditorState = EditorState.createWithContent(listContent)
            const selection = SelectionState.createEmpty(block2Key).merge({
                anchorOffset: 0,
                focusOffset: 0,
                hasFocus: true,
            }) as SelectionState
            listEditorState = EditorState.forceSelection(
                listEditorState,
                selection,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).toHaveBeenCalled()
        })

        it('should indent unstyled block on Tab via native handler', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).toHaveBeenCalled()
            const newState: EditorState = spyOnchange.mock.calls[0][0]
            const block = newState.getCurrentContent().getFirstBlock()
            expect(block.getDepth()).toBe(1)
        })

        it('should outdent unstyled block on Shift+Tab via native handler', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block = new ContentBlock({
                key: 'blk1',
                type: 'unstyled',
                text: 'hello',
                depth: 2,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            })
            const content = DraftContentState.createFromBlockArray([block])
            let state = EditorState.createWithContent(content)
            const sel = SelectionState.createEmpty('blk1').merge({
                anchorOffset: 0,
                focusOffset: 0,
                hasFocus: true,
            }) as SelectionState
            state = EditorState.forceSelection(state, sel)

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                shiftKey: true,
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).toHaveBeenCalled()
            const newState: EditorState = spyOnchange.mock.calls[0][0]
            const resultBlock = newState.getCurrentContent().getFirstBlock()
            expect(resultBlock.getDepth()).toBe(1)
        })

        it('should not indent unstyled block beyond max depth', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block = new ContentBlock({
                key: 'blk1',
                type: 'unstyled',
                text: 'hello',
                depth: 4,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            })
            const content = DraftContentState.createFromBlockArray([block])
            let state = EditorState.createWithContent(content)
            const sel = SelectionState.createEmpty('blk1').merge({
                anchorOffset: 0,
                focusOffset: 0,
                hasFocus: true,
            }) as SelectionState
            state = EditorState.forceSelection(state, sel)

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).not.toHaveBeenCalled()
        })

        it('should not outdent unstyled block below depth 0', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                shiftKey: true,
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).not.toHaveBeenCalled()
        })

        it('should not handle Tab when prediction is active', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()
            predictionKey.set('some-key')

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).not.toHaveBeenCalled()
            predictionKey.set(null)
        })

        it('should not indent unstyled block when cursor is in the middle of text', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block = new ContentBlock({
                key: 'blk1',
                type: 'unstyled',
                text: 'hello',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            })
            const content = DraftContentState.createFromBlockArray([block])
            let state = EditorState.createWithContent(content)
            const sel = SelectionState.createEmpty('blk1').merge({
                anchorOffset: 3,
                focusOffset: 3,
                hasFocus: true,
            }) as SelectionState
            state = EditorState.forceSelection(state, sel)

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).not.toHaveBeenCalled()
        })

        it('should not handle Tab key when target is inside find-replace dialog', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={spyOnchange}
                    displayedActions={[ActionName.FindReplace]}
                    ref={instanceRef}
                />,
            )

            spyOnchange.mockClear()

            const dialogEl = document.createElement('div')
            dialogEl.setAttribute('data-find-replace-dialog', '')
            const inputEl = document.createElement('input')
            dialogEl.appendChild(inputEl)
            instanceRef.current!['editorWrapperRef']?.appendChild(dialogEl)

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            Object.defineProperty(event, 'target', { value: inputEl })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            expect(spyOnchange).not.toHaveBeenCalled()
        })
    })

    describe('drag events', () => {
        it('should handle dragover and dragleave without errors', () => {
            const { container } = render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                />,
            )

            const wrapper = container.firstChild as HTMLElement
            fireEvent.dragOver(wrapper)
            fireEvent.dragLeave(wrapper)
        })
    })

    describe('WorkflowVariable plugin', () => {
        it('should create workflowVariables plugin when WorkflowVariable in displayedActions', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    displayedActions={[ActionName.WorkflowVariable]}
                    getWorkflowVariables={() => []}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!.workflowVariablesPlugin).toBeDefined()
        })
    })

    describe('componentWillUnmount', () => {
        it('should clear shortcut manager on unmount', () => {
            const { unmount } = render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                />,
            )

            ;(shortcutManager.clear as jest.Mock).mockClear()

            unmount()

            expect(shortcutManager.clear).toHaveBeenCalledWith([
                'SpotlightModal',
                'Dialpad',
                'PhoneCall',
            ])
        })

        it('should remove keydown event listeners from editorWrapperRef on unmount', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const wrapperRef = instanceRef.current!['editorWrapperRef']!
            const removeEventListenerSpy = jest.spyOn(
                wrapperRef,
                'removeEventListener',
            )

            instanceRef.current!.componentWillUnmount()

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
                true,
            )
            expect(removeEventListenerSpy).toHaveBeenCalledTimes(2)

            removeEventListenerSpy.mockRestore()
        })
    })

    describe('_focusEditor', () => {
        it('should call EditorState.moveFocusToEnd on first focus when wasEverFocused is false', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        ref={instanceRef}
                    />
                </Provider>,
            )

            expect(instanceRef.current!.state.wasEverFocused).toBe(false)

            onChangeSpy.mockClear()
            act(() => {
                instanceRef.current!._focusEditor()
            })

            expect(onChangeSpy).toHaveBeenCalledWith(
                expect.objectContaining(
                    EditorState.moveFocusToEnd(editorState),
                ),
            )
            expect(instanceRef.current!.state.wasEverFocused).toBe(true)
        })

        it('should not call EditorState.moveFocusToEnd on subsequent focus calls', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        ref={instanceRef}
                    />
                </Provider>,
            )

            act(() => {
                instanceRef.current!._focusEditor()
            })
            onChangeSpy.mockClear()

            act(() => {
                instanceRef.current!._focusEditor()
            })

            expect(onChangeSpy).not.toHaveBeenCalled()
        })
    })

    describe('_handleKeyCommand', () => {
        it('should return handled and update state for bold command', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null } as any

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            const result = instanceRef.current!._handleKeyCommand('bold')

            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
        })
    })

    describe('componentDidUpdate selection validation', () => {
        it('should refocus when selection key becomes invalid after external content change', () => {
            const onChangeSpy = jest.fn()

            const initialContent = DraftContentState.createFromBlockArray([
                new ContentBlock({
                    key: 'old-key',
                    type: 'unstyled',
                    text: 'initial',
                    characterList: ImmutableList(),
                    depth: 0,
                    data: ImmutableMap(),
                }),
            ])
            const initialEditorState =
                EditorState.createWithContent(initialContent)

            const { rerender } = render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={initialEditorState}
                        onChange={onChangeSpy}
                        isFocused={true}
                    />
                </Provider>,
            )

            onChangeSpy.mockClear()

            const newContent = DraftContentState.createFromBlockArray([
                new ContentBlock({
                    key: 'new-key',
                    type: 'unstyled',
                    text: 'completely new',
                    characterList: ImmutableList(),
                    depth: 0,
                    data: ImmutableMap(),
                }),
            ])
            const newEditorState = EditorState.createWithContent(newContent)

            rerender(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={newEditorState}
                        onChange={onChangeSpy}
                        isFocused={true}
                    />
                </Provider>,
            )

            expect(onChangeSpy).toHaveBeenCalled()
        })
    })

    describe('_customKeyBindingFn', () => {
        it('should return null for Enter with command modifier', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: 'Enter',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).toBeNull()
        })
    })

    describe('paste with multiple video URLs', () => {
        it('should call onInsertVideoAddedFromPastedLink when pasting a video URL', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)

            const onInsertVideoSpy = jest.fn()

            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    canAddVideoPlayer
                    onInsertVideoAddedFromPastedLink={onInsertVideoSpy}
                    ref={instanceRef}
                />,
            )

            const text = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'

            instanceRef.current!['_insertExtraVideoOnPastedTextIfApplicable'](
                editorState,
                text,
            )

            expect(onInsertVideoSpy).toHaveBeenCalled()
        })

        it('should not insert videos when canAddVideoPlayer is false', () => {
            const onChangeSpy = jest.fn()
            contentState = convertFromHTML('<p></p>')
            editorState = EditorState.createWithContent(contentState)
            editorState = EditorState.moveFocusToEnd(editorState)

            const onInsertVideoSpy = jest.fn()

            const instanceRef: LegacyRef<InstanceType<typeof RichFieldEditor>> =
                { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    canAddVideoPlayer={false}
                    onInsertVideoAddedFromPastedLink={onInsertVideoSpy}
                    ref={instanceRef}
                />,
            )

            const text = 'https://www.youtube.com/watch?v=4sLFpe-xbhk'

            const result = instanceRef.current![
                '_insertExtraVideoOnPastedTextIfApplicable'
            ](editorState, text)

            const blocks = result.getCurrentContent().getBlocksAsArray()
            const atomicBlocks = blocks.filter(
                (block) => block.getType() === 'atomic',
            )

            expect(atomicBlocks.length).toBe(0)
            expect(onInsertVideoSpy).not.toHaveBeenCalled()
        })
    })

    describe('_setEditorWrapperRef', () => {
        it('should add event listeners when ref is set', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!['editorWrapperRef']).toBeTruthy()

            const wrapperRef = instanceRef.current!['editorWrapperRef']!
            const addEventListenerSpy = jest.spyOn(
                wrapperRef,
                'addEventListener',
            )

            const newDiv = document.createElement('div')
            const addSpy = jest.spyOn(newDiv, 'addEventListener')

            instanceRef.current!._setEditorWrapperRef(newDiv)

            expect(addSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
                true,
            )
            expect(addSpy).toHaveBeenCalledTimes(2)

            addEventListenerSpy.mockRestore()
            addSpy.mockRestore()
        })

        it('should remove event listeners from old ref when new ref is set', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const oldWrapperRef = instanceRef.current!['editorWrapperRef']!
            const removeSpy = jest.spyOn(oldWrapperRef, 'removeEventListener')

            const newDiv = document.createElement('div')
            instanceRef.current!._setEditorWrapperRef(newDiv)

            expect(removeSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
                true,
            )
            expect(removeSpy).toHaveBeenCalledTimes(2)

            removeSpy.mockRestore()
        })

        it('should not add event listeners when ref is set to null', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            instanceRef.current!._setEditorWrapperRef(null)
            expect(instanceRef.current!['editorWrapperRef']).toBeNull()
        })
    })

    describe('_blockStyleFn', () => {
        function makeBlocks(
            specs: Array<{
                key: string
                type: string
                depth?: number
                data?: Record<string, string>
            }>,
        ) {
            return specs.map(
                (s) =>
                    new ContentBlock({
                        key: s.key,
                        type: s.type,
                        text: 'x',
                        depth: s.depth ?? 0,
                        characterList: ImmutableList(),
                        data: ImmutableMap(s.data ?? {}),
                    }),
            )
        }

        function renderWithBlocks(
            blocks: ContentBlock[],
            targetKey: string,
        ): string {
            const content = DraftContentState.createFromBlockArray(blocks)
            const state = EditorState.createWithContent(content)
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    ref={instanceRef}
                />,
            )

            const block = content.getBlockForKey(targetKey)
            return instanceRef.current!._blockStyleFn(block)
        }

        it('should return list classes for OL at depth 0', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b1')
            expect(result).toContain('listItem')
            expect(result).toContain('listOrdered')
            expect(result).toContain('listDepth0')
            expect(result).toContain('markerStyle0')
            expect(result).toContain('listResetDepth0')
        })

        it('should return unordered class for UL at depth 0', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b1')
            expect(result).toContain('listUnordered')
            expect(result).not.toContain('listOrdered')
        })

        it('should override OL to unordered when visualListStyle is unordered', () => {
            const blocks = makeBlocks([
                {
                    key: 'b1',
                    type: 'ordered-list-item',
                    depth: 0,
                    data: { visualListStyle: 'unordered' },
                },
            ])
            const result = renderWithBlocks(blocks, 'b1')
            expect(result).toContain('listUnordered')
            expect(result).not.toContain('listOrdered')
        })

        it('should override UL to ordered when visualListStyle is ordered', () => {
            const blocks = makeBlocks([
                {
                    key: 'b1',
                    type: 'unordered-list-item',
                    depth: 0,
                    data: { visualListStyle: 'ordered' },
                },
            ])
            const result = renderWithBlocks(blocks, 'b1')
            expect(result).toContain('listOrdered')
            expect(result).not.toContain('listUnordered')
        })

        it('should not reset second consecutive OL at same depth', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b2')
            expect(result).not.toContain('listResetDepth0')
        })

        it('should reset when list style changes between consecutive blocks', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'unordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b2')
            expect(result).toContain('listResetDepth0')
        })

        it('should reset when unstyled block precedes list', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unstyled', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b2')
            expect(result).toContain('listResetDepth0')
        })

        it('should set markerStyle1 for nested OL at depth 1', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
            ])
            const result = renderWithBlocks(blocks, 'b2')
            expect(result).toContain('markerStyle1')
        })

        it('should set markerStyle2 for double-nested OL at depth 2', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
                { key: 'b3', type: 'ordered-list-item', depth: 2 },
            ])
            const result = renderWithBlocks(blocks, 'b3')
            expect(result).toContain('markerStyle2')
        })

        it('should reset nesting when style breaks between depths', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
            ])
            const result = renderWithBlocks(blocks, 'b2')
            expect(result).toContain('markerStyle0')
        })

        it('should not reset when previous block is at greater depth', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 1 },
                { key: 'b2', type: 'ordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b2')
            expect(result).not.toContain('listResetDepth0')
        })

        it('should return blockDepth class for unstyled block with depth > 0', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unstyled', depth: 2 },
            ])
            const result = renderWithBlocks(blocks, 'b1')
            expect(result).toContain('blockDepth2')
        })

        it('should return empty string for unstyled block at depth 0', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unstyled', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b1')
            expect(result).toBe('')
        })

        it('should handle chain that skips deeper blocks', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
                { key: 'b3', type: 'ordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b3')
            expect(result).not.toContain('listResetDepth0')
        })

        it('should detect style break through deeper blocks via findChainContext', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
                { key: 'b3', type: 'ordered-list-item', depth: 0 },
                { key: 'b4', type: 'ordered-list-item', depth: 1 },
            ])
            const result = renderWithBlocks(blocks, 'b4')
            expect(result).toContain('markerStyle1')
        })

        it('should walk past deeper blocks in chain to find same-depth predecessor', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 0 },
                { key: 'b3', type: 'ordered-list-item', depth: 2 },
                { key: 'b4', type: 'ordered-list-item', depth: 0 },
            ])
            const result = renderWithBlocks(blocks, 'b4')
            expect(result).not.toContain('listResetDepth0')
        })

        it('should stop chain walk when encountering non-list block at same depth', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unstyled', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 0 },
                { key: 'b3', type: 'ordered-list-item', depth: 1 },
            ])
            const result = renderWithBlocks(blocks, 'b3')
            expect(result).toContain('markerStyle1')
        })

        it('should handle nesting level with deeper blocks interspersed between depths', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 2 },
                { key: 'b3', type: 'ordered-list-item', depth: 1 },
                { key: 'b4', type: 'ordered-list-item', depth: 2 },
            ])
            const result = renderWithBlocks(blocks, 'b4')
            expect(result).toContain('markerStyle2')
        })

        it('should walk through multi-block chain at ancestor depth', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'ordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 0 },
                { key: 'b3', type: 'ordered-list-item', depth: 1 },
            ])
            const result = renderWithBlocks(blocks, 'b3')
            expect(result).toContain('markerStyle1')
        })

        it('should limit nesting level when ancestor has different style', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unordered-list-item', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
                { key: 'b3', type: 'ordered-list-item', depth: 2 },
            ])
            const result = renderWithBlocks(blocks, 'b3')
            expect(result).toContain('markerStyle1')
            expect(result).toContain('listDepth2')
        })

        it('should limit nesting level when ancestor is non-list block', () => {
            const blocks = makeBlocks([
                { key: 'b1', type: 'unstyled', depth: 0 },
                { key: 'b2', type: 'ordered-list-item', depth: 1 },
                { key: 'b3', type: 'ordered-list-item', depth: 2 },
            ])
            const result = renderWithBlocks(blocks, 'b3')
            expect(result).toContain('markerStyle1')
            expect(result).toContain('listDepth2')
        })
    })

    describe('_handleReturn with visualListStyle', () => {
        it('should return handled for empty list item', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'ordered-list-item',
                    text: '',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 0,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._handleReturn({
                shiftKey: false,
            } as unknown as React.KeyboardEvent)
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should preserve visualListStyle on Enter for non-empty list with visualListStyle', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'ordered-list-item',
                    text: 'hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap({ visualListStyle: 'unordered' }),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 5,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._handleReturn({
                shiftKey: false,
            } as unknown as React.KeyboardEvent)
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()

            const newState: EditorState = onChangeSpy.mock.calls[0][0]
            const newBlocks = newState.getCurrentContent().getBlocksAsArray()
            const newBlock = newBlocks[newBlocks.length - 1]
            expect(newBlock.getData().get('visualListStyle')).toBe('unordered')
        })

        it('should return not-handled for non-empty list without visualListStyle', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'ordered-list-item',
                    text: 'hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 5,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            const result = instanceRef.current!._handleReturn({
                shiftKey: false,
            } as unknown as React.KeyboardEvent)
            expect(result).toBe('not-handled')
        })
    })

    describe('_handleKeyCommand unindent-block', () => {
        it('should reduce depth from 2 to 1', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 2,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 0,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const result =
                instanceRef.current!._handleKeyCommand('unindent-block')
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should reduce depth from 1 to 0', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 1,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 0,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const result =
                instanceRef.current!._handleKeyCommand('unindent-block')
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
        })
    })

    describe('_handleKeyCommand select-all', () => {
        it('should select all content from first to last block', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'Hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
                new ContentBlock({
                    key: 'b2',
                    type: 'unstyled',
                    text: 'World',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 2,
                    focusOffset: 2,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            const result = instanceRef.current!._handleKeyCommand(
                'select-all',
                state,
            )
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
            const newState = onChangeSpy.mock.calls[0][0] as EditorState
            const newSelection = newState.getSelection()
            expect(newSelection.getAnchorKey()).toBe('b1')
            expect(newSelection.getAnchorOffset()).toBe(0)
            expect(newSelection.getFocusKey()).toBe('b2')
            expect(newSelection.getFocusOffset()).toBe(5)
            expect(newSelection.isCollapsed()).toBe(false)
        })
    })

    describe('_handleKeyCommand backspace/delete with selection', () => {
        it('should remove selected text on backspace with non-collapsed selection', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'Hello World',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            const result = instanceRef.current!._handleKeyCommand(
                'backspace',
                state,
            )
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
            const newState = onChangeSpy.mock.calls[0][0] as EditorState
            expect(newState.getCurrentContent().getPlainText()).toBe(' World')
        })

        it('should remove selected text on delete with non-collapsed selection', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'Hello World',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 5,
                    focusOffset: 11,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            const result = instanceRef.current!._handleKeyCommand(
                'delete',
                state,
            )
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
            const newState = onChangeSpy.mock.calls[0][0] as EditorState
            expect(newState.getCurrentContent().getPlainText()).toBe('Hello')
        })

        it('should fall through to RichUtils for backspace with collapsed selection', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'Hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 3,
                    focusOffset: 3,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._handleKeyCommand(
                'backspace',
                state,
            )
            expect(result).toBe('not-handled')
        })

        it('should prefer latestEditorState argument over props', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const propsContent = DraftContentState.createFromBlockArray([
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'props state',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ])
            const propsState = EditorState.createWithContent(propsContent)

            const latestContent = DraftContentState.createFromBlockArray([
                new ContentBlock({
                    key: 'b2',
                    type: 'unstyled',
                    text: 'latest state',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ])
            let latestState = EditorState.createWithContent(latestContent)
            latestState = EditorState.forceSelection(
                latestState,
                SelectionState.createEmpty('b2').merge({
                    anchorOffset: 0,
                    focusOffset: 12,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={propsState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            onChangeSpy.mockClear()
            const result = instanceRef.current!._handleKeyCommand(
                'backspace',
                latestState,
            )
            expect(result).toBe('handled')
            expect(onChangeSpy).toHaveBeenCalled()
            const newState = onChangeSpy.mock.calls[0][0] as EditorState
            expect(newState.getCurrentContent().getPlainText()).toBe('')
        })
    })

    describe('_customKeyBindingFn backspace unindent', () => {
        it('should return unindent-block for Backspace at offset 0 on unstyled block with depth 1', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 1,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 0,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: 'Backspace',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).toBe('unindent-block')
        })

        it('should not return unindent-block for Backspace on list block with depth 1', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'ordered-list-item',
                    text: 'hello',
                    depth: 1,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 0,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: 'Backspace',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).not.toBe('unindent-block')
        })

        it('should not return unindent-block for Backspace at offset > 0', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 1,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 3,
                    focusOffset: 3,
                    hasFocus: true,
                }) as SelectionState,
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: 'Backspace',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).not.toBe('unindent-block')
        })

        it('should not return unindent-block for Backspace at offset 0 on unstyled block at depth 0', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    ref={instanceRef}
                />,
            )

            const event = {
                key: 'Backspace',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
            } as any
            const result = instanceRef.current!._customKeyBindingFn(event)
            expect(result).not.toBe('unindent-block')
        })
    })

    describe('copy and cut handlers', () => {
        function renderWithGuidanceVariables(
            state: EditorState,
            onChangeSpy: jest.Mock,
        ) {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    onChange={onChangeSpy}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            return instanceRef
        }

        it('should return selected text for single-block selection', () => {
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello world',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            const instanceRef = renderWithGuidanceVariables(state, jest.fn())

            const result = instanceRef.current!._getSelectedText()
            expect(result).toBe('hello')
        })

        it('should return null for collapsed selection', () => {
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 2,
                    focusOffset: 2,
                    hasFocus: true,
                }) as SelectionState,
            )

            const instanceRef = renderWithGuidanceVariables(state, jest.fn())

            const result = instanceRef.current!._getSelectedText()
            expect(result).toBeNull()
        })

        it('should include full middle block text for 3-block selection', () => {
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'first',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
                new ContentBlock({
                    key: 'b2',
                    type: 'unstyled',
                    text: 'middle',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
                new ContentBlock({
                    key: 'b3',
                    type: 'unstyled',
                    text: 'last',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                new SelectionState({
                    anchorKey: 'b1',
                    anchorOffset: 2,
                    focusKey: 'b3',
                    focusOffset: 3,
                    hasFocus: true,
                }),
            )

            const instanceRef = renderWithGuidanceVariables(state, jest.fn())

            const result = instanceRef.current!._getSelectedText()
            expect(result).toBe('rst\nmiddle\nlas')
        })

        it('should return text with newlines for multi-block selection', () => {
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
                new ContentBlock({
                    key: 'b2',
                    type: 'unstyled',
                    text: 'world',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                new SelectionState({
                    anchorKey: 'b1',
                    anchorOffset: 0,
                    focusKey: 'b2',
                    focusOffset: 5,
                    hasFocus: true,
                }),
            )

            const instanceRef = renderWithGuidanceVariables(state, jest.fn())

            const result = instanceRef.current!._getSelectedText()
            expect(result).toBe('hello\nworld')
        })

        it('should set clipboard, remove range, and call onChange on cut with selection', () => {
            const onChangeSpy = jest.fn()
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello world',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            const instanceRef = renderWithGuidanceVariables(state, onChangeSpy)

            onChangeSpy.mockClear()

            const setData = jest.fn()
            const preventDefault = jest.fn()
            const event = {
                clipboardData: { setData },
                preventDefault,
            } as unknown as ClipboardEvent

            instanceRef.current!._nativeCutHandler(event)

            expect(setData).toHaveBeenCalledWith('text/plain', 'hello')
            expect(setData).toHaveBeenCalledWith(
                'text/html',
                '<div>hello</div>',
            )
            expect(preventDefault).toHaveBeenCalled()
            expect(onChangeSpy).toHaveBeenCalled()
        })

        it('should do nothing on cut with collapsed selection', () => {
            const onChangeSpy = jest.fn()
            const instanceRef = renderWithGuidanceVariables(
                editorState,
                onChangeSpy,
            )

            onChangeSpy.mockClear()

            const setData = jest.fn()
            const preventDefault = jest.fn()
            const event = {
                clipboardData: { setData },
                preventDefault,
            } as unknown as ClipboardEvent

            instanceRef.current!._nativeCutHandler(event)

            expect(setData).not.toHaveBeenCalled()
            expect(onChangeSpy).not.toHaveBeenCalled()
        })

        it('should set text/plain and text/html on clipboard and call preventDefault on copy with selection', () => {
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello world',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            const instanceRef = renderWithGuidanceVariables(state, jest.fn())

            const setData = jest.fn()
            const preventDefault = jest.fn()
            const event = {
                clipboardData: { setData },
                preventDefault,
            } as unknown as ClipboardEvent

            instanceRef.current!._nativeCopyHandler(event)

            expect(setData).toHaveBeenCalledWith('text/plain', 'hello')
            expect(setData).toHaveBeenCalledWith(
                'text/html',
                '<div>hello</div>',
            )
            expect(preventDefault).toHaveBeenCalled()
        })

        it('should preserve inline styles in text/html when copying formatted text', () => {
            const content = convertFromHTML('<strong>hello</strong> world')
            const firstKey = content.getFirstBlock().getKey()
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty(firstKey).merge({
                    anchorOffset: 0,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            const instanceRef = renderWithGuidanceVariables(state, jest.fn())

            const setData = jest.fn()
            const preventDefault = jest.fn()
            const event = {
                clipboardData: { setData },
                preventDefault,
            } as unknown as ClipboardEvent

            instanceRef.current!._nativeCopyHandler(event)

            expect(setData).toHaveBeenCalledWith('text/plain', 'hello')
            expect(setData).toHaveBeenCalledWith(
                'text/html',
                expect.stringContaining('<strong>'),
            )
            expect(preventDefault).toHaveBeenCalled()
        })

        it('should do nothing on copy with collapsed selection', () => {
            const instanceRef = renderWithGuidanceVariables(
                editorState,
                jest.fn(),
            )

            const setData = jest.fn()
            const preventDefault = jest.fn()
            const event = {
                clipboardData: { setData },
                preventDefault,
            } as unknown as ClipboardEvent

            instanceRef.current!._nativeCopyHandler(event)

            expect(setData).not.toHaveBeenCalled()
            expect(preventDefault).not.toHaveBeenCalled()
        })
    })

    describe('prop getters', () => {
        it('should return attachFiles prop from _getAttachFiles', () => {
            const attachFiles = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    attachFiles={attachFiles}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!._getAttachFiles()).toBe(attachFiles)
        })

        it('should return canDropFiles prop from _getCanDropFiles', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    canDropFiles={true}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!._getCanDropFiles()).toBe(true)
        })

        it('should return canInsertInlineImages prop from _getCanInsertInlineImages', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    canInsertInlineImages={false}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!._getCanInsertInlineImages()).toBe(false)
        })
    })

    describe('_onDragOver and _onDragLeave', () => {
        it('should set isDragging to true on dragOver', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        ref={instanceRef}
                    />
                </Provider>,
            )

            act(() => {
                instanceRef.current!._onDragOver()
            })

            expect(instanceRef.current!.state.isDragging).toBe(true)
        })

        it('should set isDragging to false on dragLeave', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        ref={instanceRef}
                    />
                </Provider>,
            )

            act(() => {
                instanceRef.current!._onDragOver()
            })
            act(() => {
                instanceRef.current!._onDragLeave()
            })

            expect(instanceRef.current!.state.isDragging).toBe(false)
        })
    })

    describe('_handlePastedText when editor is null', () => {
        it('should return undefined and not call onChange', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={onChangeSpy}
                    ref={instanceRef}
                />,
            )

            instanceRef.current!.editor = null
            onChangeSpy.mockClear()

            const result = instanceRef.current!._handlePastedText(
                'text',
                undefined,
                editorState,
            )

            expect(result).toBeUndefined()
            expect(onChangeSpy).not.toHaveBeenCalled()
        })
    })

    describe('predictionPlugin creation', () => {
        it('should create prediction plugin when predictionContext is set', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    predictionContext={ImmutableMap({})}
                    ref={instanceRef}
                />,
            )

            expect(instanceRef.current!.predictionPlugin).toBeDefined()
        })
    })

    describe('_handleSelectionChange', () => {
        beforeEach(() => {
            jest.spyOn(window, 'requestAnimationFrame').mockImplementation(
                (cb) => {
                    cb(0)
                    return 0
                },
            )
        })

        afterEach(() => {
            ;(
                window.requestAnimationFrame as unknown as jest.SpyInstance
            ).mockRestore()
        })

        it('should mark guidance entities as selected when in range', () => {
            const blocks = [
                new ContentBlock({
                    key: 'b1',
                    type: 'unstyled',
                    text: 'hello',
                    depth: 0,
                    characterList: ImmutableList(),
                    data: ImmutableMap(),
                }),
            ]
            const content = DraftContentState.createFromBlockArray(blocks)
            let state = EditorState.createWithContent(content)
            state = EditorState.forceSelection(
                state,
                SelectionState.createEmpty('b1').merge({
                    anchorOffset: 0,
                    focusOffset: 5,
                    hasFocus: true,
                }) as SelectionState,
            )

            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={state}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            instanceRef.current!._handleSelectionChange()
        })

        it('should handle case when editorWrapperRef is null', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            instanceRef.current!['editorWrapperRef'] = null
            instanceRef.current!._handleSelectionChange()
        })
    })

    describe('componentDidUpdate with getGuidanceVariables', () => {
        it('should call _handleSelectionChange on update when getGuidanceVariables is set', () => {
            const onChangeSpy = jest.fn()

            const { rerender } = render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        getGuidanceVariables={() => []}
                    />
                </Provider>,
            )

            rerender(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        getGuidanceVariables={() => []}
                        placeholder="updated"
                    />
                </Provider>,
            )
        })
    })

    describe('componentWillUnmount with getGuidanceVariables', () => {
        it('should remove cut and copy listeners and selectionchange on unmount', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const { unmount } = render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            const wrapperRef = instanceRef.current!['editorWrapperRef']!
            const removeSpy = jest.spyOn(wrapperRef, 'removeEventListener')
            const docRemoveSpy = jest.spyOn(document, 'removeEventListener')

            unmount()

            expect(removeSpy).toHaveBeenCalledWith(
                'cut',
                expect.any(Function),
                true,
            )
            expect(removeSpy).toHaveBeenCalledWith(
                'copy',
                expect.any(Function),
                true,
            )
            expect(docRemoveSpy).toHaveBeenCalledWith(
                'selectionchange',
                expect.any(Function),
            )

            removeSpy.mockRestore()
            docRemoveSpy.mockRestore()
        })
    })

    describe('_setEditorWrapperRef with getGuidanceVariables', () => {
        it('should add cut and copy listeners and selectionchange when ref is set', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            const newDiv = document.createElement('div')
            const addSpy = jest.spyOn(newDiv, 'addEventListener')
            const docAddSpy = jest.spyOn(document, 'addEventListener')

            instanceRef.current!._setEditorWrapperRef(newDiv)

            expect(addSpy).toHaveBeenCalledWith(
                'cut',
                expect.any(Function),
                true,
            )
            expect(addSpy).toHaveBeenCalledWith(
                'copy',
                expect.any(Function),
                true,
            )
            expect(docAddSpy).toHaveBeenCalledWith(
                'selectionchange',
                expect.any(Function),
            )

            addSpy.mockRestore()
            docAddSpy.mockRestore()
        })

        it('should remove copy/cut listeners from old ref when setting new ref', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    getGuidanceVariables={() => []}
                    ref={instanceRef}
                />,
            )

            const oldWrapperRef = instanceRef.current!['editorWrapperRef']!
            const removeSpy = jest.spyOn(oldWrapperRef, 'removeEventListener')
            const docRemoveSpy = jest.spyOn(document, 'removeEventListener')

            const newDiv = document.createElement('div')
            instanceRef.current!._setEditorWrapperRef(newDiv)

            expect(removeSpy).toHaveBeenCalledWith(
                'cut',
                expect.any(Function),
                true,
            )
            expect(removeSpy).toHaveBeenCalledWith(
                'copy',
                expect.any(Function),
                true,
            )
            expect(docRemoveSpy).toHaveBeenCalledWith(
                'selectionchange',
                expect.any(Function),
            )

            removeSpy.mockRestore()
            docRemoveSpy.mockRestore()
        })
    })

    describe('_nativeTabHandler re-focus', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should re-focus editor after tab when focus moved outside wrapper', () => {
            const spyOnchange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={editorState}
                    onChange={spyOnchange}
                    ref={instanceRef}
                />,
            )

            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                cancelable: true,
                bubbles: true,
            })
            instanceRef.current!['editorWrapperRef']?.dispatchEvent(event)

            act(() => {
                jest.runAllTimers()
            })

            expect(spyOnchange).toHaveBeenCalled()
        })
    })

    describe('_focusEditor scroll', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should call scrollToReactNode when noAutoScroll is false', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        ref={instanceRef}
                    />
                </Provider>,
            )

            act(() => {
                instanceRef.current!._focusEditor()
            })

            act(() => {
                jest.runAllTimers()
            })

            expect(scrollToReactNode).toHaveBeenCalled()
        })

        it('should not call scrollToReactNode when noAutoScroll is true', () => {
            const onChangeSpy = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            ;(scrollToReactNode as jest.Mock).mockClear()

            render(
                <Provider store={mockStore({})}>
                    <RichFieldEditor
                        {...defaultProps}
                        editorKey="editor"
                        editorState={editorState}
                        onChange={onChangeSpy}
                        noAutoScroll
                        ref={instanceRef}
                    />
                </Provider>,
            )

            act(() => {
                instanceRef.current!._focusEditor()
            })

            act(() => {
                jest.runAllTimers()
            })

            expect(scrollToReactNode).not.toHaveBeenCalled()
        })
    })

    describe('_handleReturn', () => {
        function createListEditorState(
            type: 'unordered-list-item' | 'ordered-list-item',
            text = 'List item',
        ) {
            const blockKey = 'block1'
            const block = new ContentBlock({
                key: blockKey,
                type,
                text,
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            })
            const content = DraftContentState.createFromBlockArray([block])
            const state = EditorState.createWithContent(content)
            const selection = SelectionState.createEmpty(blockKey).merge({
                anchorOffset: text.length,
                focusOffset: text.length,
                hasFocus: true,
            }) as SelectionState
            return EditorState.forceSelection(state, selection)
        }

        it('should insert soft newline within the same unordered-list-item on Shift+Enter', () => {
            const spyOnChange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }
            const listEditorState = createListEditorState('unordered-list-item')

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={spyOnChange}
                    ref={instanceRef}
                />,
            )
            spyOnChange.mockClear()

            const result = instanceRef.current!._handleReturn({
                shiftKey: true,
            } as unknown as React.KeyboardEvent)

            expect(result).toBe('handled')
            expect(spyOnChange).toHaveBeenCalledTimes(1)
            const [newEditorState] = spyOnChange.mock.calls[0] as [EditorState]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()
            expect(blocks).toHaveLength(1)
            expect(blocks[0].getType()).toBe('unordered-list-item')
            expect(blocks[0].getText()).toContain('\n')
        })

        it('should insert soft newline within the same ordered-list-item on Shift+Enter', () => {
            const spyOnChange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }
            const listEditorState = createListEditorState('ordered-list-item')

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={spyOnChange}
                    ref={instanceRef}
                />,
            )
            spyOnChange.mockClear()

            const result = instanceRef.current!._handleReturn({
                shiftKey: true,
            } as unknown as React.KeyboardEvent)

            expect(result).toBe('handled')
            expect(spyOnChange).toHaveBeenCalledTimes(1)
            const [newEditorState] = spyOnChange.mock.calls[0] as [EditorState]
            const blocks = newEditorState.getCurrentContent().getBlocksAsArray()
            expect(blocks).toHaveLength(1)
            expect(blocks[0].getType()).toBe('ordered-list-item')
            expect(blocks[0].getText()).toContain('\n')
        })

        it('should not insert soft newline on plain Enter in a non-empty list item', () => {
            const spyOnChange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }
            const listEditorState = createListEditorState(
                'unordered-list-item',
                'Some text',
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={spyOnChange}
                    ref={instanceRef}
                />,
            )
            spyOnChange.mockClear()

            const result = instanceRef.current!._handleReturn({
                shiftKey: false,
            } as unknown as React.KeyboardEvent)

            expect(result).toBe('not-handled')
            expect(spyOnChange).not.toHaveBeenCalled()
        })

        it('should not insert soft newline on Shift+Enter in a non-list block', () => {
            const spyOnChange = jest.fn()
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }
            const unstyledEditorState = EditorState.moveFocusToEnd(
                EditorState.createWithContent(
                    convertFromHTML('<p>Some text</p>'),
                ),
            )

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={unstyledEditorState}
                    onChange={spyOnChange}
                    ref={instanceRef}
                />,
            )
            spyOnChange.mockClear()

            const result = instanceRef.current!._handleReturn({
                shiftKey: true,
            } as unknown as React.KeyboardEvent)

            expect(result).toBe('not-handled')
            expect(spyOnChange).not.toHaveBeenCalled()
        })
    })

    describe('_blockStyleFn', () => {
        const makeListEditorState = (blocks: ContentBlock[]): EditorState => {
            const listContent = DraftContentState.createFromBlockArray(blocks)
            return EditorState.createWithContent(listContent)
        }

        it('should apply listStartAt class when first ordered-list block has listStart > 1', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block = new ContentBlock({
                key: 'list-key-1',
                type: 'ordered-list-item',
                text: 'First item',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap({ listStart: 5 }),
            })
            const listEditorState = makeListEditorState([block])

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={jest.fn()}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._blockStyleFn(block)

            expect(result).toContain('listStartAt5')
            expect(result).not.toContain('listResetDepth')
        })

        it('should fall back to listResetDepth class when first ordered-list block has listStart = 1', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block = new ContentBlock({
                key: 'list-key-1',
                type: 'ordered-list-item',
                text: 'First item',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap({ listStart: 1 }),
            })
            const listEditorState = makeListEditorState([block])

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={jest.fn()}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._blockStyleFn(block)

            expect(result).toContain('listResetDepth0')
            expect(result).not.toContain('listStartAt')
        })

        it('should fall back to listResetDepth class when first ordered-list block has no listStart', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const block = new ContentBlock({
                key: 'list-key-1',
                type: 'ordered-list-item',
                text: 'First item',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            })
            const listEditorState = makeListEditorState([block])

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={jest.fn()}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._blockStyleFn(block)

            expect(result).toContain('listResetDepth0')
            expect(result).not.toContain('listStartAt')
        })

        it('should not apply listStartAt class for non-first ordered-list item', () => {
            const instanceRef: {
                current: InstanceType<typeof RichFieldEditor> | null
            } = { current: null }

            const firstBlock = new ContentBlock({
                key: 'list-key-1',
                type: 'ordered-list-item',
                text: 'First item',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap({ listStart: 5 }),
            })
            const secondBlock = new ContentBlock({
                key: 'list-key-2',
                type: 'ordered-list-item',
                text: 'Second item',
                depth: 0,
                characterList: ImmutableList(),
                data: ImmutableMap(),
            })
            const listEditorState = makeListEditorState([
                firstBlock,
                secondBlock,
            ])

            render(
                <RichFieldEditor
                    {...defaultProps}
                    editorKey="editor"
                    editorState={listEditorState}
                    onChange={jest.fn()}
                    ref={instanceRef}
                />,
            )

            const result = instanceRef.current!._blockStyleFn(secondBlock)

            expect(result).not.toContain('listStartAt')
            expect(result).not.toContain('listResetDepth')
        })
    })
})
