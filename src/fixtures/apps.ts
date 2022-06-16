import {appDataToAppDetailMapper} from 'models/integration/resources'
import {
    AppData,
    Category,
    PricingPlan,
    TrialPeriod,
} from 'models/integration/types/app'

export const dummyAppListData = {
    app_icon: 'https://ok.com/1.png',
    app_url: 'https://ok.com',
    headline: 'Some tagline here',
    id: 'someid',
    name: 'My test app',
    is_installed: false,
}

export const dummyAppData: AppData = {
    ...dummyAppListData,
    is_unapproved: false,
    is_installed: false,
    company_url: 'https://www.gomycompany.com/',
    company: 'myCompany',
    pricing_plan: PricingPlan.RECURRING,
    has_free_trial: true,
    privacy_policy: 'https://www.mycompany.com/privacy-policy',
    setup_guide: '',
    pricing_details:
        '<p>They are several options:&nbsp;</p>\n<ul>\n<li>Pay once</li>\n<li>Pay on ticket</li>\n</ul>',
    description:
        '<p>My company is an interactive video platform, helping users create meaningful and personal conversations at scale.</p>\n<p>With the my company app, users can sync their videos and monitor every viewer interaction, while managing leads and audience choices through easy-to-view columns.</p>\n<p>With all of your audience interactions in one place, collecting your insights is a breeze.</p>\n<p>It also has a list:</p>\n<ul>\n<li>In which noting that really matters is said but at least you see it!</li>\n<li>Isn&rsquo;t it nice?</li>\n</ul>',
    free_trial_period: TrialPeriod.FOURTEEN,
    pricing_link: 'https://google.com',
    support_phone: '+33620033659',
    screenshots: [
        'https://screen.com/my1.png',
        'https://screen.com/my2.png',
        'https://screen.com/my3.png',
        'https://screen.com/my4.png',
    ],
    support_email: 'support@gotolstoy.com',
    categories: [Category.ECOMMERCE, Category.REVIEWS],
}

export const dummyAppDetail = appDataToAppDetailMapper(dummyAppData)
