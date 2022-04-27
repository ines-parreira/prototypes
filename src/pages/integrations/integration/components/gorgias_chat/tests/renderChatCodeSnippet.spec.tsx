import {fromJS} from 'immutable'

import {renderChatCodeSnippet} from '../renderChatCodeSnippet'

describe('renderChatCodeSnippet()', () => {
    it('should render the snippet for development', () => {
        const res = renderChatCodeSnippet({
            chatAppId: '1',
            gorgiasChatExtraState: fromJS({
                bundleUrl: 'https://chat-bundle.com',
                chatUrl: 'https://chat-api.com',
                wsUrl: 'chat-ws.com',
            }),
        })

        expect(res).toMatchSnapshot()
    })

    it('should render the snippet for staging', () => {
        window.STAGING = true

        const res = renderChatCodeSnippet({
            chatAppId: '1',
            gorgiasChatExtraState: fromJS({}),
        })
        expect(res).toMatchSnapshot()

        window.STAGING = false
    })

    it('should render the snippet for production', () => {
        window.PRODUCTION = true

        const res = renderChatCodeSnippet({
            chatAppId: '1',
            gorgiasChatExtraState: fromJS({}),
        })
        expect(res).toMatchSnapshot()

        window.PRODUCTION = false
    })
})
