import React, { ComponentProps, LegacyRef } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { convertToHTML } from 'draft-convert'
import { ContentState, EditorState } from 'draft-js'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'
import { Provider } from 'react-redux'

import shortcutManager from 'services/shortcutManager/shortcutManager'
import { convertFromHTML } from 'utils/editor'
import { mockStore } from 'utils/testing'

import toolbarPlugin from '../../../draftjs/plugins/toolbar/index'
import provideToolbarPlugin from '../provideToolbarPlugin'
import { RichFieldEditor } from '../RichFieldEditor'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('services/shortcutManager/shortcutManager')

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
})
