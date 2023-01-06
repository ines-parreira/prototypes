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
        store = mockStore({ticket: fromJS({id: 1})})

        jest.spyOn(newMesageSelector, 'isNewMessagePublic').mockImplementation(
            () => true
        )

        window.location.pathname = '/app/ticket/187'
    })

    afterEach(() => {
        jest.clearAllMocks()
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

    it('should render the `not supported warning` when providing a valid url that is not supported by ReactPlayer', () => {
        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        expect(
            screen.queryByText(
                'This provider is not supported or link is not valid.'
            )
        ).toBeNull()

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.google.com'},
        })
        expect(
            screen.getByText('Insert Video').getAttribute('disabled')
        ).toBeNull()

        screen.getByText('This provider is not supported or link is not valid.')
    })

    it('should call `addVideo` to the draftjs editorState (chat channel)', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Chat)

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.youtube.com/watch?v=4sLFpe-xbhk'}, // URL is valid and ReactPlayer.canPlay: true.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(addVideoSpy).toHaveBeenCalledWith(
            undefined,
            `https://www.youtube.com/watch?v=4sLFpe-xbhk`
        )
    })

    it('should call `addVideo` to the draftjs editorState (internal note channel)', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        // Internal note has Email + isNewMessagePublic falsy.
        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Email)
        jest.spyOn(newMesageSelector, 'isNewMessagePublic').mockImplementation(
            () => false
        )

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.youtube.com/watch?v=4sLFpe-xbhk'}, // URL is valid and ReactPlayer.canPlay: true.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(addVideoSpy).toHaveBeenCalledWith(
            undefined,
            `https://www.youtube.com/watch?v=4sLFpe-xbhk`
        )
    })

    it('should call `insertLink` to the draftjs editorState (email channel)', () => {
        const insertLinkSpy = jest
            .spyOn(utils, 'insertLink')
            .mockImplementation(jest.fn())

        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Email)

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://gorgias.com'}, // URL is valid and ReactPlayer.canPlay: false.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(insertLinkSpy).toHaveBeenCalledWith(
            undefined,
            `https://gorgias.com`
        )
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
            target: {value: 'https://gorgias.com'}, // URL is valid and ReactPlayer.canPlay: false.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(insertText).toHaveBeenCalledWith(
            undefined,
            `https://gorgias.com`
        )
    })

    it('should call `insertVideo` to the draftjs editorState when being in the campaign edit page', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Email) // The state has Email by default when being on a campaign edition page.
        window.location.pathname =
            '/app/settings/channels/gorgias_chat/69/campaigns/04c1b674-8800-4d22-9b8f-e93db01ef5de'

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {value: 'https://www.youtube.com/watch?v=4sLFpe-xbhk'}, // URL is valid and ReactPlayer.canPlay: true.
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(addVideoSpy).toHaveBeenCalled()
    })

    it('should call `addVideo` to the draftjs editorState with the fixed URL (dailymotion playlist case)', () => {
        const addVideoSpy = jest
            .spyOn(draftjsPluginsUtils, 'addVideo')
            .mockImplementation(jest.fn())

        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Chat)

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {
                value: 'https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf',
            },
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(addVideoSpy).toHaveBeenCalledWith(
            undefined,
            'https://www.dailymotion.com/video/x2m3vyr'
        )
    })

    it('should call `insertLink` to the draftjs editorState with the original URL (dailymotion playlist case with Email channel)', () => {
        const insertLinkSpy = jest
            .spyOn(utils, 'insertLink')
            .mockImplementation(jest.fn())

        jest.spyOn(
            newMesageSelector,
            'getNewMessageChannel'
        ).mockImplementation(() => TicketChannel.Email)

        render(
            <Provider store={store}>
                <AddVideo {...minProps} />
            </Provider>
        )
        fireEvent.click(screen.getByText(/video/i))

        fireEvent.change(screen.getByPlaceholderText('External video URL'), {
            target: {
                value: 'https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf',
            },
        })

        fireEvent.click(screen.getByText(/Insert Video/i))
        expect(insertLinkSpy).toHaveBeenCalledWith(
            undefined,
            `https://www.dailymotion.com/video/x2m3vyr?playlist=x7juyaf`
        )
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
