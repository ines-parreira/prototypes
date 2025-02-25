import { Components } from 'rest_api/help_center_api/client.generated'

export const ShopifyPagesListFixture: Components.Schemas.ContactFormPageDto[] =
    [
        {
            external_id: '12345543211',
            title: 'About us',
            url_path: 'about-us',
            body_html: '<h1>About us</h1>',
        },
        {
            external_id: '12345543212',
            title: 'Contact us',
            url_path: 'contact-us',
            body_html: '<h1>Contact us</h1>',
        },
        {
            external_id: '12345543213',
            title: 'Privacy policy',
            url_path: 'privacy-policy',
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
