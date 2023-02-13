import {AppDetail, PricingPlan} from '../../../models/integration/types/app'
import {IntegrationType} from '../../../models/integration/constants'

export const CLICK_TRACKING_BASE_PATH = '/app/settings/revenue/click-tracking'

export const ABOUT_PAGE: AppDetail = {
    type: IntegrationType.App,
    title: 'Click Tracking',
    description: 'Track clicks back to your store.',
    longDescription:
        'With the Gorgias click tracking service you can now track clicks back to your store from short-links sent via help desk conversations. This feature can be used in any channel with standard Gorgias branded links or you can customize your links to match your store’s domain. Simply edit the DNS/custom domain settings in the “manage” section above and the links sent to customers will automatically reference your domain!',
    connectTitle: '',
    connectUrl: '',
    isConnected: false,
    hideInfoCard: true,
    company: 'Gorgias',
    companyUrl: 'https://gorgias.com',
    icon: 'link',
    screenshots: [],
    setupGuide: '',
    supportEmail: '',
    supportPhone: '',
    pricingPlan: PricingPlan.FREE,
    categories: [],
    privacyPolicy: '',
    hasFreeTrial: false,
    freeTrialPeriod: null,
    grantedScopes: [],
    appId: '',
    image: '',
    isUnapproved: false,
    otherResources: [],
}
