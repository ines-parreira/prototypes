import React from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'
import {EditorState} from 'draft-js'
import {convertToHTML} from 'draft-convert'
import Editor from 'draft-js-plugins-editor'

import {RichFieldEditor} from '../RichFieldEditor.tsx'
import provideToolbarPlugin from '../provideToolbarPlugin.tsx'
import createToolbarPlugin from '../../../draftjs/plugins/toolbar/index.ts'
import {convertFromHTML} from '../../../../../utils/editor.tsx'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('RichFieldEditor', () => {
    const defaultProps = {
        createToolbarPlugin,
        detectGrammarly: _noop,
        onChange: jest.fn(),
        linkIsOpen: false,
        linkText: '',
        linkUrl: '',
        onLinkUrlChange: _noop,
        onLinkTextChange: _noop,
        onLinkOpen: _noop,
        onLinkClose: _noop,
    }
    let contentState
    let editorState

    beforeEach(() => {
        jest.clearAllMocks()
        contentState = convertFromHTML('<p>foo</p>')
        editorState = EditorState.createWithContent(contentState)
    })

    // Note: functional test candidate
    it('should keep existing content and newlines when pasting text', () => {
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const component = mount(
            <RichFieldEditor {...defaultProps} editorState={editorState} />
        )
        const text = 'a\n\nb\n\nc'
        const html = '<div>a<br><br>b<br><br>c</div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html, editorState)
        const lastCall =
            defaultProps.onChange.mock.calls[
                defaultProps.onChange.mock.calls.length - 1
            ]

        const convertedHTML = convertToHTML(lastCall[0].getCurrentContent())
        expect(convertedHTML).toBe('<p>htmla<br/><br/>b<br/><br/>c</p>')
    })

    // tests the newline-doubling bug when copying and pasting content from draft-js
    // https://github.com/gorgias/gorgias/pull/3373#issuecomment-392855428
    // Note: functional test candidate
    it('should not handle html when pasting draft-js-specific content', () => {
        contentState = convertFromHTML('html')
        editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const component = mount(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
            />
        )
        const text = 'a\n\nb\n\nc'
        // html copied from draft-js contains the data-editor=editorKey attribute
        const html =
            '<div data-editor="editor"><div>a<br><br>b<br><br>c</div></div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html, editorState)

        const [newContentState] =
            defaultProps.onChange.mock.calls[
                defaultProps.onChange.mock.calls.length - 1
            ]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe('<p>html</p>')
    })

    it('should focus the end of input on initial focus', () => {
        const onFocus = jest.fn()
        const component = shallow(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={onFocus}
            />
        )

        expect(component).toMatchSnapshot()
        expect(component.state('wasEverFocused')).toBe(false)
        component.find(Editor).simulate('focus')
        expect(onFocus).toBeCalled()
        component.setProps({isFocused: true})
        expect(component.state('wasEverFocused')).toBe(true)
        expect(defaultProps.onChange).toBeCalledWith(
            expect.objectContaining(EditorState.moveFocusToEnd(editorState))
        )
    })

    describe('should call detect grammarly when editor is focused', () => {
        const onFocus = jest.fn()
        const detectGrammarly = jest.fn()

        const component = shallow(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onFocus={onFocus}
                detectGrammarly={detectGrammarly}
            />
        )

        component.find(Editor).simulate('focus')
        expect(detectGrammarly).toBeCalledTimes(1)
    })

    it('should handle shortcuts', () => {
        const WrappedRichFieldEditor = provideToolbarPlugin(RichFieldEditor)
        const component = mount(
            <WrappedRichFieldEditor
                {..._omit(defaultProps, 'createToolbarPlugin')}
                editorKey="editor"
                editorState={editorState}
            />
        )

        component
            .find('.public-DraftEditor-content')
            .simulate('keyDown', {ctrlKey: true, key: 'b', keyCode: 66})
        expect(defaultProps.onChange.mock.calls).toMatchSnapshot()
    })
})
