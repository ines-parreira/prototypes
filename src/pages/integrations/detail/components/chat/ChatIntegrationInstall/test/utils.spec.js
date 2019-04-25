import {fromJS} from 'immutable'

import {renderChatCodeSnippet} from '../utils'

describe('chat install utils', () => {
    describe('renderChatCodeSnippet', () => {
        it('should render correctly with new format', () => {
            const integration = fromJS({
                decoration: {
                    icon: 'http://iconurl.com/',
                    header_color: '#789456',
                    chat_icon_color: '#213456',
                    conversation_color: '#741852',
                    header_text: 'foo',
                    introduction_text: 'bar',
                    input_placeholder: 'placeholder',
                    send_button_text: 'send!'
                },
                meta: {
                    app_token: 'apijdasoidkas',
                    script_url: 'config.gorgias.io/foo/chat/bar.js'
                }
            })

            expect(renderChatCodeSnippet(integration)).toMatchSnapshot()
        })
    })
})
