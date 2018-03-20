import React from 'react'
import {shallow, mount} from 'enzyme'

import FacebookCarousel from '../FacebookCarousel'

describe('FacebookCarousel component', () => {
    it('default props', () => {
        expect(shallow(
            <FacebookCarousel />
        )).toMatchSnapshot()
    })

    it('should render empty with template_type=button', () => {
        const data = [{
            type: 'template',
            payload: {
                buttons: [
                    {
                        type: 'postback',
                        title: 'What?!😱',
                        payload: 'ACT::3fb3ff8b9e10dcf67efbc0f7943c825f'
                    },
                    {
                        type: 'postback',
                        title: 'I don\'t get scared🙄',
                        payload: 'ACT::8d539d3ba2f4904acf5c54162f06f573'
                    }
                ],
                template_type: 'button'
            }
        }]

        expect(mount(
            <FacebookCarousel data={data} />
        )).toMatchSnapshot()
    })

    it('render generic template', () => {
        const data = [{
            type: 'template',
            payload: {
                elements: [
                    {
                        title: 'Leather saddle',
                        buttons: [
                            {
                                url: 'https:\/\/sfbicycles.myshopify.com\/',
                                type: 'web_url',
                                title: 'View details',
                                webview_height_ratio: 'tall'
                            },
                            {
                                type: 'element_share'
                            },
                            {
                                url: 'https:\/\/messenger-commerce.shopifyapps.com\/',
                                type: 'web_url',
                                title: 'Buy now',
                                webview_height_ratio: 'tall'
                            }
                        ],
                        subtitle: '$75.00',
                        image_url: 'https:\/\/cdn.shopify.com\/s\/files\/1\/1632\/0429\/'
                    },
                ],
                sharable: true,
                template_type: 'generic'
            }
        }]

        expect(mount(
            <FacebookCarousel data={data} />
        )).toMatchSnapshot()
    })

    it('should have two elements', () => {
        const data = [{
            type: 'template',
            payload: {
                elements: [
                    {
                        title: 'Leather saddle',
                        subtitle: '$10',
                        image_url: 'https:\/\/gorgias.io'
                    },
                    {
                        title: 'Pepperoni Pizza',
                        subtitle: '$20',
                        image_url: 'https:\/\/gorgias.io'
                    },
                ],
                sharable: true,
                template_type: 'generic'
            }
        }]

        expect(mount(
            <FacebookCarousel data={data} />
        ).find('CardBody').length).toBe(2)
    })

    it('should have two buttons', () => {
        const data = [{
            type: 'template',
            payload: {
                elements: [
                    {
                        title: 'Leather saddle',
                        subtitle: '$10',
                        image_url: 'https:\/\/gorgias.io',
                        buttons: [
                            {
                                url: 'https:\/\/sfbicycles.myshopify.com\/',
                                type: 'web_url',
                                title: 'View details',
                                webview_height_ratio: 'tall'
                            },
                            {
                                type: 'element_share'
                            },
                        ],
                    },
                ],
                sharable: true,
                template_type: 'generic'
            }
        }]

        expect(mount(
            <FacebookCarousel data={data} />
        ).find('Button').length).toBe(2)
    })
})
