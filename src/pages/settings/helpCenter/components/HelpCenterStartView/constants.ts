import {IntegrationType} from 'models/integration/constants'
import {AppDetail, PricingPlan} from 'models/integration/types/app'
import {assetsUrl} from 'utils'

export const ABOUT_PAGE: AppDetail = {
    type: IntegrationType.App,
    title: 'Help Center',
    connectTitle: 'Create New',
    description:
        'Set up a free Help Center/FAQ site and let your customers find answers.',
    longDescription:
        '<p>With the Gorgias native Help Center, you can set up help articles on your website for free. This is a great way to allow your customers to self serve and get instant answers before reaching out to your Support team. You can add images, videos, and GIFs to help your customers learn about your products and services in-depth!</p><h2>Highlights</h2><p><ul><li>Multilingual, customizable settings to match with your brand;</li><li>Contact cards (including contact form) to direct inquiries to one central location;</li><li>Google Analytics to get insights about your shoppers behavior;</li><li>Internal knowledge base to transfer knowledge with your team.</li></ul></p><p><h2>For Automation Add-on subscribers only:</h2><ul><li>Self-Service flows available in the Help Center to deflect even more tickets;</li><li>Articles recommendations in chat.</li></ul></p>',
    connectUrl: '',
    company: 'Gorgias',
    companyUrl: 'https://gorgias.com',
    icon: 'live_help',
    // For the screenshots the correct approach would be to use the relative path and just set it as 'helpcenter-1.png'.
    // However, because of the way we use Details.tsx in HelpCenter, we need the absolute path.
    // TODO: Fix this, once the Detail component is refactored.
    screenshots: [assetsUrl('/img/integrations/screenshots/helpcenter-1.png')],
    setupGuide: 'https://docs.gorgias.com/en-US/articles/help-center-18396',
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
    otherResources: [
        {
            title: 'Monthly Webinar',
            icon: 'ondemand_video',
            url: 'https://app.livestorm.co/gorgias-1/help-center-on-demand?utm_source=Livestorm+company+page',
        },
    ],
}
