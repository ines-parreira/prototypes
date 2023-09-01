import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {shallow} from 'enzyme'
import {EditorState} from 'draft-js'
import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'

import * as draftjsPluginsUtils from '../../../utils'

import {AddLinkContainer} from '../AddLink'

function AddLinkWithIsOpenState(
    props: ComponentProps<typeof AddLinkContainer>
) {
    const [isOpen, setIsOpen] = React.useState(false)
    return (
        <AddLinkContainer
            {...props}
            onClose={() => setIsOpen(false)}
            onOpen={() => setIsOpen(true)}
            isOpen={isOpen}
        />
    )
}

describe('<AddLink />', () => {
    const defaultProps = {
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
        canAddVideoPlayer: false,
        onInsertVideoAddedFromInsertLink: jest.fn(),
    } as unknown as ComponentProps<typeof AddLinkContainer>

    it('should allow to submit a valid url', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="http://gorgias.io"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should allow to submit a url without the protocol', () => {
        const component = shallow(
            <AddLinkContainer {...defaultProps} text="foo" url="gorgias.io" />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should NOT allow to submit an invalid url', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="{{ticket.url_something}}"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(true)
    })

    it('should allow to submit an url with a variable', () => {
        const component = shallow(
            <AddLinkContainer
                {...defaultProps}
                text="foo"
                url="http://google.com/?email={{message.customer.email}}"
            />
        )
        const button = component.find(Button)
        expect(button.props().isDisabled).toBe(false)
    })

    it('should add a video at the bottom when URL is compatible and under a chat channel', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation((editorState) => editorState)

        const {getByText} = render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer
                text="foo"
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
            />,
            {
                container: document.body,
            }
        )
        fireEvent.click(screen.getByText(/link/))
        fireEvent.click(getByText(/Insert Link/))
        expect(addVideoSpy).toHaveBeenCalled()
    })

    it('should not add a video at the bottom when URL is compatible because channel is not chat', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        jest.spyOn(draftjsPluginsUtils, 'addVideo').mockImplementation(
            jest.fn()
        )

        render(
            <AddLinkWithIsOpenState
                {...defaultProps}
                canAddVideoPlayer={false}
                text="foo"
                url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
            />
        )
        fireEvent.click(screen.getByText(/link/))
        fireEvent.click(screen.getByText(/Insert Link/))
        expect(addVideoSpy).not.toHaveBeenCalled()
    })
})
