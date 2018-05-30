import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'
import {EditorState, ContentState} from 'draft-js'
import {convertToHTML} from 'draft-convert'

import RichField from '../RichField'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('RichField', () => {
    it('should render a basic input', () => {
        const component = shallow(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('display alert', () => {
        const component = shallow(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                alertMode="warning"
                alertText="alert"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a MentionSuggestions component to the DOM if in internal-note mode', () => {
        const component = shallow(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                mentionProps={{canAddMention: true}}
                />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render immutable variable', () => {
        const component = mount(
            <RichField
                value={{text: 'text {{current_user.name}}', html: 'html {{current_user.name}}'}}
                onChange={_noop}
                />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render mutable variable', () => {
        const component = mount(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                />
        )

        // simulate typed text
        const editorState = EditorState.createWithContent(ContentState.createFromText('{{current_user.name}}'))
        component.instance()._setEditorState(editorState)

        expect(component).toMatchSnapshot()
    })

    it('should keep existing content and newlines when pasting text', () => {
        const component = mount(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                />
        )
        const text = 'a\n\nb\n\nc'
        const html = '<div>a<br><br>b<br><br>c</div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html, component.state('editorState'))

        const convertedHTML = convertToHTML(component.state('editorState').getCurrentContent())
        expect(convertedHTML).toBe('<p>htmla<br/><br/>b<br/><br/>c</p>')
    })

    // tests the newline-doubling bug when copying and pasting content from draft-js
    // https://github.com/gorgias/gorgias/pull/3373#issuecomment-392855428
    it('should not handle html when pasting draft-js-specific content', () => {
        const component = mount(
            <RichField
                editorKey="editor"
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                />
        )
        const text = 'a\n\nb\n\nc'
        // html copied from draft-js contains the data-editor=editorKey attribute
        const html = '<div data-editor="editor"><div>a<br><br>b<br><br>c</div></div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html, component.state('editorState'))

        const convertedHTML = convertToHTML(component.state('editorState').getCurrentContent())
        // we can't simulate the paste event, so we test for unmodified content
        expect(convertedHTML).toBe('<p>html</p>')
    })
})
