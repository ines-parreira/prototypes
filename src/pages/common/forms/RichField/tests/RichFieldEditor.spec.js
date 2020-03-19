import React from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {EditorState} from 'draft-js'
import {convertToHTML} from 'draft-convert'
import Editor from 'draft-js-plugins-editor'

import {RichFieldEditor} from '../RichFieldEditor'
import createToolbarPlugin from '../../../draftjs/plugins/toolbar'
import {convertFromHTML} from '../../../../../utils/editor'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('RichFieldEditor', () => {
    const defaultProps = {
        createToolbarPlugin,
        onChange: _noop,
        linkIsOpen: false,
        linkText: '',
        linkUrl: '',
        onLinkUrlChange: _noop,
        onLinkTextChange: _noop,
        onLinkOpen: _noop,
        onLinkClose: _noop,
    }

    // Note: functional test candidate
    it('should keep existing content and newlines when pasting text', () => {
        const contentState = convertFromHTML('html')
        let editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const onChange = jest.fn()
        const component = mount(
            <RichFieldEditor
                {...defaultProps}
                editorState={editorState}
                onChange={onChange}
            />,
        )
        const text = 'a\n\nb\n\nc'
        const html = '<div>a<br><br>b<br><br>c</div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html, editorState)
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]

        const convertedHTML = convertToHTML(lastCall[0].getCurrentContent())
        expect(convertedHTML).toBe('<p>htmla<br/><br/>b<br/><br/>c</p>')
    })

    // tests the newline-doubling bug when copying and pasting content from draft-js
    // https://github.com/gorgias/gorgias/pull/3373#issuecomment-392855428
    // Note: functional test candidate
    it('should not handle html when pasting draft-js-specific content', () => {
        const contentState = convertFromHTML('html')
        let editorState = EditorState.createWithContent(contentState)
        editorState = EditorState.moveFocusToEnd(editorState)
        const onChange = jest.fn()
        const component = mount(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChange}
            />,
        )
        const text = 'a\n\nb\n\nc'
        // html copied from draft-js contains the data-editor=editorKey attribute
        const html = '<div data-editor="editor"><div>a<br><br>b<br><br>c</div></div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html, editorState)

        const [newContentState] = onChange.mock.calls[onChange.mock.calls.length - 1]
        const convertedHTML = convertToHTML(newContentState.getCurrentContent())
        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe('<p>html</p>')
    })

    it('should focus the end of input on initial focus', () => {
        const contentState = convertFromHTML('<p>foo</p>')
        let editorState = EditorState.createWithContent(contentState)
        const onChange = jest.fn()
        const onFocus = jest.fn()
        const component = shallow(
            <RichFieldEditor
                {...defaultProps}
                editorKey="editor"
                editorState={editorState}
                onChange={onChange}
                onFocus={onFocus}
            />)

        expect(component).toMatchSnapshot()
        expect(component.state('wasEverFocused')).toBe(false)
        component.find(Editor).simulate('focus')
        expect(onFocus).toBeCalled()
        component.setProps({isFocused: true})
        expect(component.state('wasEverFocused')).toBe(true)
        expect(onChange).toBeCalledWith(
            expect.objectContaining(EditorState.moveFocusToEnd(editorState))
        )
    })
})
