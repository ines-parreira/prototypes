import {fromJS} from 'immutable'
import {renderCodeSnippet} from '../utils'

describe('chat utils', () => {
    describe('renderCodeSnippet', () => {
        it('should render correctly with old format', () => {
            const integration = fromJS({
                decoration: {
                    icon: 'http://iconurl.com/',
                    header_color: '#789456',
                    chat_icon_color: '#213456',
                    conversation_color: '#741852',
                    window_title: 'foo',
                    header_text: 'bar',
                    input_placeholder: 'placeholder',
                    send_button_text: 'send!'
                },
                meta: {
                    app_token: 'apijdasoidkas'
                }
            })

            expect(renderCodeSnippet(integration)).toMatchSnapshot()
        })

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
                    app_token: 'apijdasoidkas'
                }
            })

            expect(renderCodeSnippet(integration)).toMatchSnapshot()
        })
    })
})
