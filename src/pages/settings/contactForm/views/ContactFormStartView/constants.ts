import {ProductDetail} from 'pages/common/components/ProductDetail/types'
import {CONTACT_FORM_PAGE_TITLE} from '../../constants'

export const CONTACT_FORM_APP_DETAIL: ProductDetail = {
    title: CONTACT_FORM_PAGE_TITLE,
    description:
        'Create, customize, and embed a contact form to any page on your website.',
    longDescription:
        '<p>Contact Form is a streamlined way for shoppers to submit support requests while on your website. You can customize the subject lines and allow shoppers to attach files to their tickets. Once you set up Contact Form, you can embed it on your Gorgias Help Center or any page of your website via HTML (no-code solution coming soon).</p> <p>Gorgias Contact Form is a much better alternative than your default form or email links on your website.</p> <h2>With a Contact Form, you’ll be able to:</h2><ul><li><b>Reduce spam</b> by replacing the email links on your website with Contact Form</li><li><b>Solve tickets faster</b> by collecting relevant information from your shoppers upfront</li><li><b>Automate support actions</b> by setting up rules & macros for tickets submitted via Contact Form</li></ul>',
    icon: 'wysiwyg',
    screenshots: ['/img/integrations/screenshots/contactform-1.png'],
    infocard: {
        resources: {
            // TODO: update setupGuide link after it's available
            documentationLink:
                'https://docs.gorgias.com/en-US/help-center---contact-form-117132',
        },
        support: {
            email: 'support@gorgias.com',
        },
    },
}
