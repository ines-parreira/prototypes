import {Components} from 'rest_api/help_center_api/client.generated'

export const ShopifyPagesListFixture: Components.Schemas.ShopifyPageDto[] = [
    {
        id: '12345543211',
        title: 'About us',
        handle: 'about-us',
        body_html: '<h1>About us</h1>',
    },
    {
        id: '12345543212',
        title: 'Contact us',
        handle: 'contact-us',
        body_html: '<h1>Contact us</h1>',
    },
    {
        id: '12345543213',
        title: 'Privacy policy',
        handle: 'privacy-policy',
        body_html: '<h1>Privacy policy</h1>',
    },
]

export const ShopifyPagesEmptyListFixture = []

export const ShopifyPagesGeneric500ErrorFixture = {
    error: {
        msg: 'An error occured',
    },
    status: 500,
    code: 'INTERNAL_SERVER_ERROR_EXCEPTION',
    message: 'An error occured',
} as const
