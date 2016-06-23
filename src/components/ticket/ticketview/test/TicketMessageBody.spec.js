import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import TicketMessageBody from '../TicketMessageBody'


function setup(props) {
    const renderer = TestUtils.createRenderer()
    renderer.render(<TicketMessageBody {...props} />)
    const output = renderer.getRenderOutput()

    return {
        props,
        output,
        renderer
    }
}

describe('components', () => {
    describe('TicketMessageBody', () => {
        it('with empty props', () => {
            const {output} = setup({
                message: {}
            })
            expect(output.type).toBe('div')
            expect(output.props.className).toBe('ticket-message-body ticket-message-body-text')
        })
        it('html by default', () => {
            const {output} = setup({
                message: {
                    body_text: 'text',
                    body_html: 'html'
                }
            })
            expect(output.props.className).toBe('ticket-message-body')
            expect(output.props.children).toEqual([
                <div dangerouslySetInnerHTML={{__html: 'html'}}></div>,
                null
            ])
        })

        it('use text when no html', () => {
            const {output} = setup({
                message: {
                    body_text: 'text',
                    body_html: ''
                }
            })
            expect(output.props.className).toBe('ticket-message-body ticket-message-body-text')
            expect(output.props.children).toEqual([
                <div dangerouslySetInnerHTML={{__html: 'text'}}></div>,
                null
            ])
        })

        it('use stripped_html if available', () => {
            const {output} = setup({
                message: {
                    body_text: 'text',
                    body_html: 'long html',
                    stripped_html: 'stripped html',
                    stripped_text: 'stripped text'
                }
            })
            expect(output.props.className).toBe('ticket-message-body')
            expect(output.props.children[0]).toEqual(<div dangerouslySetInnerHTML={{__html: 'stripped html'}}></div>)
            const quote = output.props.children[1]
            expect(quote.type).toBe('div')
            expect(quote.props.className).toBe('mail-quote-toggle')
        })

        it('linkify body_text', () => {
            const {output} = setup({
                message: {
                    body_text: 'text http://gorgias.io/',
                    body_html: ''
                }
            })
            expect(output.props.className).toBe('ticket-message-body ticket-message-body-text')
            expect(output.props.children[0])
            .toEqual(
                <div
                  dangerouslySetInnerHTML={{
                      __html: 'text <a ' +
                      'href="http://gorgias.io/" class="linkified" target="_blank">http://gorgias.io/</a>',
                  }}
                />)
        })
    })
})
