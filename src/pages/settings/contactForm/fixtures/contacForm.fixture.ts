import {ContactForm} from 'models/contactForm/types'
import {CONTACT_FORM_DEFAULT_LOCALE} from 'pages/settings/contactForm/constants'

export const ContactFormFixture: ContactForm = {
    id: 1,
    name: 'SF Bicycles Contact Form',
    default_locale: CONTACT_FORM_DEFAULT_LOCALE,
    source: 'manual',
    subject_lines: {
        options: {
            'en-US': [
                'Track order',
                'Report issue',
                'Return order',
                'Cancel order',
                'Give feedback',
            ],
        },
        allow_other: true,
        created_datetime: '2023-02-21T19:21:06.804Z',
        updated_datetime: '2023-02-21T19:21:06.804Z',
    },
    email_integration: {
        id: 1,
        email: 'princesspolly@gorgias.com',
    },
    uid: '1ABCDE12345',
    code_snippet_template: '<script...></script><div></div>',
    url_template: 'http://contact.gorgias.docker/forms/1ABCDE12345',
}
