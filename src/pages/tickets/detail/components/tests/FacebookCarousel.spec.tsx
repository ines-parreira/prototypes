import React, {ComponentProps} from 'react'
import {shallow, mount} from 'enzyme'

import Button from 'pages/common/components/button/Button'

import FacebookCarousel from '../FacebookCarousel'

describe('FacebookCarousel component', () => {
    const defaultProps: ComponentProps<typeof FacebookCarousel> = {
        data: [],
    }

    it('default props', () => {
        expect(
            shallow(<FacebookCarousel {...defaultProps} />)
        ).toMatchSnapshot()
    })

    it('should render empty with template_type=button', () => {
        const data: ComponentProps<typeof FacebookCarousel>['data'] = [
            {
                type: 'template',
                payload: {
                    template_type: 'button',
                    elements: [
                        {
                            title: '',
                            subtitle: '',
                            image_url: '',
                            buttons: [
                                {
                                    type: 'postback',
                                    title: 'What?!😱',
                                    url: 'ACT::3fb3ff8b9e10dcf67efbc0f7943c825f',
                                },
                                {
                                    type: 'postback',
                                    title: "I don't get scared🙄",
                                    url: 'ACT::8d539d3ba2f4904acf5c54162f06f573',
                                },
                            ],
                        },
                    ],
                },
            },
        ]

        expect(mount(<FacebookCarousel data={data} />)).toMatchSnapshot()
    })

    it('render generic template', () => {
        const data: ComponentProps<typeof FacebookCarousel>['data'] = [
            {
                type: 'template',
                payload: {
                    elements: [
                        {
                            title: 'Leather saddle',
                            buttons: [
                                {
                                    type: 'web_url',
                                    title: 'View details',
                                    url: 'https://sfbicycles.myshopify.com/',
                                    webview_height_ratio: 'tall',
                                },
                                {
                                    type: 'element_share',
                                    title: 'test',
                                    url: 'https://sfbicycles.myshopify.com/test',
                                },
                                {
                                    url: 'https://messenger-commerce.shopifyapps.com/',
                                    type: 'web_url',
                                    title: 'Buy now',
                                    webview_height_ratio: 'tall',
                                },
                            ],
                            subtitle: '$75.00',
                            image_url:
                                'https://cdn.shopify.com/s/files/1/1632/0429/',
                        },
                    ],
                    sharable: true,
                    template_type: 'generic',
                },
            },
        ]

        expect(mount(<FacebookCarousel data={data} />)).toMatchSnapshot()
    })

    it('should have two elements', () => {
        const data: ComponentProps<typeof FacebookCarousel>['data'] = [
            {
                type: 'template',
                payload: {
                    elements: [
                        {
                            title: 'Leather saddle',
                            subtitle: '$10',
                            image_url: 'https://gorgias.io',
                        },
                        {
                            title: 'Pepperoni Pizza',
                            subtitle: '$20',
                            image_url: 'https://gorgias.io',
                        },
                    ],
                    sharable: true,
                    template_type: 'generic',
                },
            },
        ]

        expect(
            mount(<FacebookCarousel data={data} />).find('CardBody').length
        ).toBe(2)
    })

    it('should have two buttons', () => {
        const data: ComponentProps<typeof FacebookCarousel>['data'] = [
            {
                type: 'template',
                payload: {
                    elements: [
                        {
                            title: 'Leather saddle',
                            subtitle: '$10',
                            image_url: 'https://gorgias.io',
                            buttons: [
                                {
                                    url: 'https://sfbicycles.myshopify.com/',
                                    type: 'web_url',
                                    title: 'View details',
                                    webview_height_ratio: 'tall',
                                },
                                {
                                    type: 'element_share',
                                    title: 'share',
                                    url: "'https://sfbicycles.myshopify.com/share",
                                },
                            ],
                        },
                    ],
                    sharable: true,
                    template_type: 'generic',
                },
            },
        ]

        expect(
            mount(<FacebookCarousel data={data} />).find(Button).length
        ).toBe(2)
    })
})
