import {IntegrationType} from '../../../../../models/integration/constants'
import {
    AppDetail,
    PricingPlan,
} from '../../../../../models/integration/types/app'
import {assetsUrl} from '../../../../../utils'
import {CONTACT_FORM_PAGE_TITLE} from '../../constants'

export const CONTACT_FORM_APP_DETAIL: AppDetail = {
    type: IntegrationType.App,
    title: CONTACT_FORM_PAGE_TITLE,
    connectTitle: 'Create Contact Form',
    description:
        'Create, customize, and embed a contact form to any page on your website.',
    longDescription:
        '<p>Contact Form is a streamlined way for shoppers to submit support requests while on your website. You can customize the subject lines and allow shoppers to attach files to their tickets. Once you set up Contact Form, you can embed it on your Gorgias Help Center or any page of your website via HTML (no-code solution coming soon).</p> <p>Gorgias Contact Form is a much better alternative than your default form or email links on your website.</p> <h2>With a Contact Form, you’ll be able to:</h2><ul><li><b>Reduce spam</b> by replacing the email links on your website with Contact Form</li><li><b>Solve tickets faster</b> by collecting relevant information from your shoppers upfront</li><li><b>Automate support actions</b> by setting up rules & macros for tickets submitted via Contact Form</li></ul>',
    connectUrl: '',
    company: 'Gorgias',
    companyUrl: 'https://gorgias.com',
    icon: 'wysiwyg',
    // For the screenshots the correct approach would be to use the relative path and just set it as 'contactform-1.png'.
    // However, because of the way we use Details.tsx in HelpCenter, we need the absolute path.
    // TODO: Fix this, once the Detail component is refactored.
    screenshots: [assetsUrl(`/img/integrations/screenshots/contactform-1.png`)],
    // TODO: update setupGuide link after it's available
    setupGuide:
        'https://docs.gorgias.com/en-US/help-center---contact-form-117132',
    supportEmail: 'support@gorgias.com',
    pricingPlan: PricingPlan.FREE,
    categories: [],
    privacyPolicy: '',
    hasFreeTrial: false,
    freeTrialPeriod: null,
    isConnected: false,
    grantedScopes: [],
    appId: '',
    image: '',
    isUnapproved: false,
    supportPhone: '',
    otherResources: [],
}
