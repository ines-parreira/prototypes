import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {EditorState} from 'draft-js'
import _noop from 'lodash/noop'

import {AddLinkContainer} from '../AddLink'

describe('<AddLink />', () => {
    const defaultProps = ({
        isOpen: true,
        getEditorState: () => EditorState.createEmpty(),
        setEditorState: _noop,
        onClose: _noop,
        onOpen: _noop,
        onTextChange: _noop,
        onUrlChange: _noop,
        text: '',
        url: '',
        linkEditionStarted: jest.fn(),
        linkEditionEnded: jest.fn(),
    } as unknown) as ComponentProps<typeof AddLinkContainer>

    it('should allow to submit a valid url', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="http://gorgias.io"
            />
        )
        const button = component.find('Button')
        expect(button.props().disabled).toBe(false)
    })

    it('should allow to submit a url without the protocol', () => {
        const component = shallow(
            <AddLinkContainer {...defaultProps} text="foo" url="gorgias.io" />
        )
        const button = component.find('Button')
        expect(button.props().disabled).toBe(false)
    })

    it('should NOT allow to submit an invalid url', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="{{ticket.url_something}}"
            />
        )
        const button = component.find('Button')
        expect(button.props().disabled).toBe(true)
    })

    it('should allow to submit an url with a variable', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="http://google.com/?email={{message.customer.email}}"
            />
        )
        const button = component.find('Button')
        expect(button.props().disabled).toBe(false)
    })
})
