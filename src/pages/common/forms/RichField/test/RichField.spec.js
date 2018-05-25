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

    it('should keep newlines in pasted text', () => {
        const component = mount(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                />
        )
        const text = 'a\n\nb\n\nc'
        const html = '<div>a<br><br>b<br><br>c</div>'

        // simulate pasted text
        component.instance()._handlePastedText(text, html)

        const convertedHTML = convertToHTML(component.state('editorState').getCurrentContent())

        expect(convertedHTML).toBe('<p>a<br/><br/>b<br/><br/>c</p>')
    })
})
