import React from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {ContentState, EditorState} from 'draft-js'

import RichField from '../RichField'
import createToolbarPlugin from '../../../draftjs/plugins/toolbar/index.ts'
import {convertToHTML} from '../../../../../utils/editor.tsx'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('RichField', () => {
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

    it('should render a basic input', () => {
        const component = shallow(
            <RichField {...defaultProps} value={{text: 'text', html: 'html'}} />
        )
        expect(component).toMatchSnapshot()
    })

    it('display alert', () => {
        const component = shallow(
            <RichField
                {...defaultProps}
                value={{text: 'text', html: 'html'}}
                alertMode="warning"
                alertText="alert"
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a MentionSuggestions component to the DOM if in internal-note mode', () => {
        const component = shallow(
            <RichField
                {...defaultProps}
                value={{text: 'text', html: 'html'}}
                mentionProps={{canAddMention: true}}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render immutable variable', () => {
        const component = mount(
            <RichField
                {...defaultProps}
                value={{
                    text: 'text {{current_user.name}}',
                    html: 'html {{current_user.name}}',
                }}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render mutable variable', () => {
        const component = mount(
            <RichField {...defaultProps} value={{text: 'text', html: 'html'}} />
        )

        // simulate typed text
        const editorState = EditorState.createWithContent(
            ContentState.createFromText('{{current_user.name}}')
        )
        component.instance()._setEditorState(editorState)

        expect(component).toMatchSnapshot()
    })

    it('should render default content state', () => {
        const contentState = ContentState.createFromText('foo')
        const component = mount(
            <RichField
                {...defaultProps}
                defaultContentState={contentState}
                value={{
                    text: contentState.getPlainText(),
                    html: convertToHTML(contentState),
                }}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
