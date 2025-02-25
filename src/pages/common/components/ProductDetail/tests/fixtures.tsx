import React from 'react'

import { Infocard, ProductDetail } from '../types'

export const infoCardBannerText = 'I am a banner, trust me.'

export const dummyInfocard: Infocard = {
    isHidden: false,
    banner: <p>{infoCardBannerText}</p>,
    CTA: <a href="https://dummy.com">click me</a>,
    pricing: {
        detail: '<p>Some description with HTML markup</p>',
        link: 'https://dummy.com',
    },
    resources: {
        documentationLink: 'https://dummydoc.com',
        privacyPolicyLink: 'https://dummyprivacy.com',
        others: [
            {
                title: 'Monthly Webinar 1',
                icon: 'ondemand_video',
                url: 'https://youtube.com',
            },
            {
                title: 'Monthly Webinar 2',
                icon: 'ondemand_video',
                url: 'https://youtube.com',
            },
        ],
    },
    support: {
        email: 'support@gorgias.com',
        phone: '+33620033669',
    },
}

export const dummyProduct: ProductDetail = {
    title: 'Some title',
    description:
        'Create, customize, and embed a contact form to any page on your website.',
    longDescription: '<p>Some long long description with HTML markup</p>',
    icon: 'wysiwyg',
    company: {
        name: 'Gorgias',
        url: 'https://gorgias.com',
    },
    screenshots: [
        'https://screen.com/my2.png',
        'https://screen.com/my3.png',
        'https://screen.com/my4.png',
    ],
    alertBanner: {
        message: 'Beware!',
    },
    categories: ['My category', { label: 'Wow', type: 'success' }],
    infocard: dummyInfocard,
}
