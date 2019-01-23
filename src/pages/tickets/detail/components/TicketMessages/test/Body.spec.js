import React from 'react'
import {mount} from 'enzyme'
import Body from '../Body'

describe('Body', () => {
    it('should display the Facebook carousel if there\'s matching metadata', () => {
        const component = mount(
            <Body
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
})
