import {ContactForm} from 'models/contactForm/types'
import {CONTACT_FORM_DEFAULT_LOCALE} from 'pages/settings/contactForm/constants'

import {Components} from '../../../../rest_api/help_center_api/client.generated'
import {ContactFormDisplayMode} from '../types/formDisplayMode.enum'

export const ContactFormFixture: ContactForm = {
    id: 1,
    integration_id: null,
    account_id: 1,
    help_center_id: null,
    name: 'SF Bicycles Contact Form',
    default_locale: CONTACT_FORM_DEFAULT_LOCALE,
    source: 'manual',
    subject_lines: {
        options: [
            'Track order',
            'Report issue',
            'Return order',
            'Cancel order',
            'Give feedback',
        ],
        allow_other: true,
    },
    email_integration: {
        id: 1,
        email: 'princesspolly@gorgias.com',
    },
    uid: '1ABCDE12345',
    code_snippet_template: '<script...></script><div></div>',
    url_template: 'http://contact.gorgias.docker/forms/1ABCDE12345',
    created_datetime: '2023-02-21T19:21:06.804Z',
    updated_datetime: '2023-02-21T19:21:06.804Z',
    deactivated_datetime: null,
    shop_name: null,
    automation_settings_id: null,
    form_display_mode: ContactFormDisplayMode.SHOW_IMMEDIATELY,
}

export const getContactFormForHelpCenterFixture = (
    newParams: Pick<ContactForm, 'id' | 'help_center_id'>
) => ({
    ...ContactFormFixture,
    ...newParams,
    email_integration: null,
    source: 'help_center',
    uid: `linked-to-help-center-${JSON.stringify(newParams.help_center_id)}`,
})

export const ContactFormListFixtures: Components.Schemas.ContactFormsListPageDto =
    {
        object: 'list',
        meta: {
            current_page: '/contact-forms?page=1&per_page=20',
            item_count: 3,
            nb_pages: 1,
            page: 1,
            per_page: 20,
        },
        data: [
            {
                ...ContactFormFixture,
                name: 'Standalone Contact Form',
                uid: 'abcd1234',
                source: 'manual',
            },
            {
                ...ContactFormFixture,
                name: 'Standalone Contact Form connected to a shop',
                uid: 'abcd4321',
                source: 'manual',
                shop_name: 'test-shop.myshopify.com',
            },
            {
                ...ContactFormFixture,
                name: 'Help Center Contact Form',
                uid: '1234abcd',
                help_center_id: 1,
                source: 'help_center',
            },
        ],
    }

export const ContactFormEmptyListFixture: Components.Schemas.ContactFormsListPageDto =
    {
        ...ContactFormListFixtures,
        data: [],
        meta: {
            current_page: '/contact-forms?page=1&per_page=20',
            item_count: 0,
            nb_pages: 1,
            page: 1,
            per_page: 20,
        },
        object: 'list',
    }

export const ContactFormGeneric500ErrorFixture = {
    error: {
        msg: 'An error occured',
    },
    status: 500,
    code: 'INTERNAL_SERVER_ERROR_EXCEPTION',
    message: 'An error occured',
} as const
