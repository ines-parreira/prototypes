import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {shallow} from 'enzyme'
import {EditorState} from 'draft-js'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import {TicketChannel} from 'business/types/ticket'
import Button from 'pages/common/components/button/Button'

import * as draftjsPluginsUtils from '../../../utils'

import {AddLinkContainer} from '../AddLink'

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AddLink />', () => {
    let store = mockStore({})

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
        currentAccount: fromJS({}),
        ticket: fromJS({}),
        isNewMessagePublic: true,
        newMessageChannel: TicketChannel.Email,
    } as unknown as ComponentProps<typeof AddLinkContainer>

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({ticket: fromJS({id: 1})})
    })

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
            .mockImplementation(jest.fn())

        render(
            <Provider store={store}>
                <AddLinkContainer
                    {...defaultProps}
                    newMessageChannel={TicketChannel.Chat}
                    isNewMessagePublic={true}
                    text="foo"
                    url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
                />
            </Provider>
        )
        fireEvent.click(screen.getByText(/link/))

        fireEvent.click(screen.getByText(/Insert Link/))
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
            <Provider store={store}>
                <AddLinkContainer
                    {...defaultProps}
                    newMessageChannel={TicketChannel.Email}
                    isNewMessagePublic={true}
                    text="foo"
                    url="https://www.youtube.com/watch?v=4sLFpe-xbhk"
                />
            </Provider>
        )
        fireEvent.click(screen.getByText(/link/))
        fireEvent.click(screen.getByText(/Insert Link/))
        expect(addVideoSpy).not.toHaveBeenCalled()
    })
})
