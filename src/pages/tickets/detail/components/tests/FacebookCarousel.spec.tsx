import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'

import FacebookCarousel from '../FacebookCarousel'

describe('FacebookCarousel component', () => {
    const defaultProps: ComponentProps<typeof FacebookCarousel> = {
        data: [],
    }

    it('default props', () => {
        const {container} = render(<FacebookCarousel {...defaultProps} />)

        expect(container.firstChild).toMatchSnapshot()
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

        const {container} = render(<FacebookCarousel data={data} />)

        expect(container.firstChild).toMatchSnapshot()
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

        const {container} = render(<FacebookCarousel data={data} />)

        expect(container.firstChild).toMatchSnapshot()
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
        render(<FacebookCarousel data={data} />)

        const cardBodies = []
        data[0]?.payload?.elements?.forEach((element) => {
            cardBodies.push(screen.getByText(element.title))
        })
        expect(cardBodies.length).toBe(2)
    })

    it('should have two buttons', () => {
        const buttons = [
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
        ]
        const data: ComponentProps<typeof FacebookCarousel>['data'] = [
            {
                type: 'template',
                payload: {
                    elements: [
                        {
                            title: 'Leather saddle',
                            subtitle: '$10',
                            image_url: 'https://gorgias.io',
                            buttons,
                        },
                    ],
                    sharable: true,
                    template_type: 'generic',
                },
            },
        ]
        render(<FacebookCarousel data={data} />)

        const buttonComponents = []
        buttons?.forEach((button) => {
            buttonComponents.push(
                screen.getByText(button.title, {exact: false})
            )
        })

        expect(buttonComponents.length).toBe(2)
    })
})
