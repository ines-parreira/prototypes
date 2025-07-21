import React, { ComponentProps, LegacyRef } from 'react'

import { render } from '@testing-library/react'
import { ContentState, EditorState } from 'draft-js'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { convertToHTML } from 'utils/editor'

import RichField from '../RichField'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')

    return {
        ...reactstrap,
        Popover: (props: Record<string, any>) => {
            return props.isOpen ? <div {...props}>{props.children}</div> : null
        },
    }
})

describe('RichField', () => {
    const mockStore = configureMockStore([thunk])
    let store = mockStore({})
    const defaultProps: ComponentProps<typeof RichField> = {
        value: { html: undefined },
        onChange: _noop,
    }

    beforeEach(() => {
        store = mockStore({})
    })

    it('should render a basic input', () => {
        const { container } = render(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{ text: 'text', html: 'html' }}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a MentionSuggestions component to the DOM if in internal-note mode', () => {
        const { container } = render(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{ text: 'text', html: 'html' }}
                    canAddMention
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render immutable variable', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)

        const { container } = render(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{
                        text: 'text {{current_user.name}}',
                        html: 'html {{current_user.name}}',
                    }}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render mutable variable', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)

        const instanceRef: LegacyRef<InstanceType<typeof RichField>> = {
            current: null,
        }

        const { container } = render(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    value={{ text: 'text', html: 'html' }}
                    ref={instanceRef}
                />
            </Provider>,
            { container: div },
        )

        // simulate typed text
        const editorState = EditorState.createWithContent(
            ContentState.createFromText('{{current_user.name}}'),
        )
        instanceRef.current?.setEditorState(editorState)

        expect(container).toMatchSnapshot()
    })

    it('should render default content state', () => {
        const div = document.createElement('div')
        document.body.appendChild(div)

        const contentState = ContentState.createFromText('foo')
        const { container } = render(
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
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should count the characters in the text', () => {
        const text = 'This is a text 33 characters long'

        const { getByText } = render(
            <Provider store={store}>
                <RichField
                    {...defaultProps}
                    countCharacters
                    value={{
                        text: text,
                        html: text,
                    }}
                />
            </Provider>,
        )

        getByText(`${text.length} characters`)
    })
})
