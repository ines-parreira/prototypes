import React from 'react'
import {shallow} from 'enzyme'
import TicketMessageBody from '../TicketMessageBody'

describe('components', () => {
    describe('TicketMessageBody', () => {
        it('with empty props', () => {
            const component = shallow(
                <TicketMessageBody
                    message={{}}
                />
            )

            expect(component).toHaveTagName('div')
            expect(component).toHaveClassName('ticket-message-body ticket-message-body-text')
        })
        it('html by default', () => {
            const component = shallow(
                <TicketMessageBody
                    message={{
                        body_text: 'text',
                        body_html: 'html'
                    }}
                />
            )

            expect(component).toHaveClassName('ticket-message-body')
            expect(component).toContainReact(
                <div dangerouslySetInnerHTML={{__html: 'html'}}></div>
            )
        })

        it('use text when no html', () => {
            const component = shallow(
                <TicketMessageBody
                    message={{
                        body_text: 'text',
                        body_html: ''
                    }}
                />
            )

            expect(component).toHaveClassName('ticket-message-body ticket-message-body-text')
            expect(component).toContainReact(
                <div dangerouslySetInnerHTML={{__html: 'text'}}></div>
            )
        })

        it('use stripped_html if available', () => {
            const component = shallow(
                <TicketMessageBody
                    message={{
                        body_text: 'text',
                        body_html: 'long html',
                        stripped_html: 'stripped html',
                        stripped_text: 'stripped text'
                    }}
                />
            )

            expect(component).toHaveClassName('ticket-message-body')
            expect(component.children().at(0)).toContainReact(
                <div dangerouslySetInnerHTML={{__html: 'stripped html'}}></div>
            )
            const quote = component.children().at(1)
            expect(quote).toHaveTagName('div')
            expect(quote).toHaveClassName('mail-quote-toggle')
        })

        it('linkify body_text', () => {
            const component = shallow(
                <TicketMessageBody
                    message={{
                        body_text: 'text http://gorgias.io/',
                        body_html: ''
                    }}
                />
            )

            expect(component).toHaveClassName('ticket-message-body ticket-message-body-text')
            expect(component.children().at(0))
            .toContainReact(
                <div
                  dangerouslySetInnerHTML={{
                      __html: 'text <a ' +
                      'href="http://gorgias.io/" class="linkified" target="_blank">http://gorgias.io/</a>',
                  }}
                />
            )
        })
    })
})
