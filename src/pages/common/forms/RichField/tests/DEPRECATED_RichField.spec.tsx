import React, {ComponentProps} from 'react'
import {mount, shallow} from 'enzyme'
import _noop from 'lodash/noop'
import {ContentState, EditorState} from 'draft-js'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {convertToHTML} from 'utils/editor'

import RichField from '../DEPRECATED_RichField'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('DEPRECATED_RichField', () => {
    const mockStore = configureMockStore([thunk])
    let store = mockStore({})
    const defaultProps: ComponentProps<typeof RichField> = {
        value: {html: undefined},
        onChange: _noop,
        linkIsOpen: false,
        linkText: '',
        linkUrl: '',
        onLinkUrlChange: _noop,
        onLinkTextChange: _noop,
        onLinkOpen: _noop,
        onLinkClose: _noop,
    }

    beforeEach(() => {
        store = mockStore({})
    })

    it('should render a basic input', () => {
        const component = shallow(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{text: 'text', html: 'html'}}
                />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a MentionSuggestions component to the DOM if in internal-note mode', () => {
        const component = shallow(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{text: 'text', html: 'html'}}
                    canAddMention
                />
            </Provider>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render immutable variable', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)

        const component = mount(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{
                        text: 'text {{current_user.name}}',
                        html: 'html {{current_user.name}}',
                    }}
                />
            </Provider>,
            {attachTo: div}
        )
        expect(component).toMatchSnapshot()
    })

    it('should render mutable variable', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)

        const component = mount<RichField>(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{text: 'text', html: 'html'}}
                />
            </Provider>,
            {attachTo: div}
        )

        // simulate typed text
        const editorState = EditorState.createWithContent(
            ContentState.createFromText('{{current_user.name}}')
        )
        const compenentInstance = component
            .find(RichField)
            .instance() as RichField
        compenentInstance.setEditorState(editorState)

        expect(component).toMatchSnapshot()
    })

    it('should render default content state', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)

        const contentState = ContentState.createFromText('foo')
        const component = mount(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    defaultContentState={contentState}
                    value={{
                        text: contentState.getPlainText(),
                        html: convertToHTML(contentState),
                    }}
                />
            </Provider>,
            {attachTo: div}
        )
        expect(component).toMatchSnapshot()
    })
})
