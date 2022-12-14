import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'

import {fromJS} from 'immutable'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import ReactPlayer from 'react-player'
import {TicketChannel} from 'business/types/ticket'

import * as utils from 'utils'

import * as draftjsPluginsUtils from '../../../utils'
import * as newMesageSelector from '../../../../../../../state/newMessage/selectors'

import AddVideo from '../AddVideo'

const minProps = {
    getEditorState: jest.fn(),
    setEditorState: jest.fn(),
}

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('<AddVideo/>', () => {
    let store = mockStore({})

    beforeEach(() => {
        jest.clearAllMocks()
        store = mockStore({ticket: fromJS({id: 1})})
    })

    it('should not render when the popover is closed', () => {
        const {container} = render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render the popover when the button is clicked', () => {
        const {container} = render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))
        expect(container).toMatchSnapshot()
    })

    it('should enable the submit button only when providing a valid url', () => {
        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeDefined()

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'toto'},
        })
        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeDefined()

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.youtube.com/watch?v=4sLFpe-xbhk'},
        })
        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeNull()
    })

    it('should call `addVideo` to the draftjs editorState', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.youtube.com/watch?v=4sLFpe-xbhk'}, // URL is valid, but ReactPlayer will canPlay: false.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(addVideoSpy).toHaveBeenCalled()
    })

    it('should call `insertLink` to the draftjs editorState', () => {
        const insertLinkSpy = jest
            .spyOn(utils, 'insertLink')
            .mockImplementation(jest.fn())

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://gorgias.com'}, // URL is valid, and ReactPlayer will canPlay: true.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(insertLinkSpy).toHaveBeenCalled()
    })

    it('should call `insertText` to the draftjs editorState (UNSUPPORTED_HYPERLINKS_CHANNELS_FOR_VIDEOS case)', () => {
        const insertText = jest
            .spyOn(utils, 'insertText')
            .mockImplementation(jest.fn())

        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Sms)

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://gorgias.com'}, // URL is valid, but ReactPlayer will canPlay: false.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(insertText).toHaveBeenCalled()
    })
})

describe('ReactPlayer', () => {
    it.each`
        url                                                                                           | isValid  | description
        ${''}                                                                                         | ${false} | ${'empty'}
        ${'a'}                                                                                        | ${false} | ${'not a URL'}
        ${'foo.bar@bar.com'}                                                                          | ${false} | ${'not a URL'}
        ${'https://google.com'}                                                                       | ${false} | ${'URL cannot be played by ReactPlayer'}
        ${'https://www.youtube.com/watch?v=oUFJJNQGwhk'}                                              | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://soundcloud.com/tycho/tycho-awake'}                                                 | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://www.facebook.com/facebook/videos/10153231379946729/'}                              | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://vimeo.com/90509568'}                                                               | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://www.twitch.tv/videos/106400740'}                                                   | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://streamable.com/moo'}                                                               | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://home.wistia.com/medias/e4a27b971d'}                                                | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://www.dailymotion.com/video/x5e9eog'}                                                | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://www.mixcloud.com/mixcloud/meet-the-curators/'}                                     | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://video.vidyard.com/watch/YBvcF2BEfvKdowmfrRwk57'}                                   | ${true}  | ${'URL can be played by ReactPlayer'}
        ${'https://test-videos.co.uk/vids/bigbuckbunny/webm/vp8/360/Big_Buck_Bunny_360_10s_1MB.webm'} | ${true}  | ${'URL can be played by ReactPlayer'}
    `(
        'EMAIL_REGEX - $email should be valid: $isValid - $description',
        ({url, isValid}) => {
            expect(ReactPlayer.canPlay(url)).toEqual(isValid)
        }
    )
})
