import React from 'react'
import {mount} from 'enzyme'
import TicketMessageBody from '../TicketMessageBody'

describe('components', () => {
    describe('TicketMessageBody', () => {
        it('with empty props', () => {
            const component = mount(
                <TicketMessageBody
                    message={{}}
                />
            )

            expect(component).toMatchSnapshot()
        })
        it('html by default', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: 'text',
                        body_html: 'html'
                    }}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('use text when no html', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: 'text',
                        body_html: ''
                    }}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('use stripped_html if available', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: 'text',
                        body_html: 'long html',
                        stripped_html: 'stripped html',
                        stripped_text: 'stripped text'
                    }}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('linkify body_text', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: 'text http://gorgias.io/',
                        body_html: ''
                    }}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the Facebook carousel if there\'s matching metadata', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: 'text http://gorgias.io/',
                        body_html: '',
                        meta: {
                            'facebook_carousel': [{
                                'type': 'template',
                                'payload': {
                                    'elements': [{
                                        'title': 'Fixie bike',
                                        'buttons': [{
                                            'url': 'https://sfbicycles.myshopify.com/products/fixie-bike',
                                            'type': 'web_url',
                                            'title': 'View details',
                                            'webview_height_ratio': 'tall'
                                        }, {'type': 'element_share'}, {
                                            'url': 'https://messenger-commerce.shopifyapps.com/redirect_to_cart',
                                            'type': 'web_url',
                                            'title': 'Buy now',
                                            'webview_height_ratio': 'tall'
                                        }],
                                        'subtitle': '$200.00',
                                        'image_url': 'https://cdn.shopify.com/s/files/1/1632/0429/products'
                                    }], 'sharable': true, 'template_type': 'generic'
                                }
                            }]
                        }
                    }}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should set target=_blank for linkified links', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: 'https://gorgias.io',
                        body_html: ''
                    }}
                />
            )

            expect(component.render().find('a').prop('target')).toBe('_blank')
        })

        it('should set target=_blank for body_html links', () => {
            const component = mount(
                <TicketMessageBody
                    message={{
                        body_text: '',
                        body_html: '<a href="#">text</a>'
                    }}
                />
            )

            expect(component.render().find('a').prop('target')).toBe('_blank')
        })
    })
})
