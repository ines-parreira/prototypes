import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {IntegrationType} from 'models/integration/types'
import {Plan} from 'models/billing/types'

import {IntegrationDetail, Tab} from '../Integration'

jest.mock('../components/aircall/AircallIntegrationList.js', () => () => (
    <div>AircallIntegrationList</div>
))
jest.mock('../components/aircall/AircallIntegrationCreate.js', () => () => (
    <div>AircallIntegrationCreate</div>
))

jest.mock('../components/email/EmailIntegrationList', () => () => (
    <div>EmailIntegrationList</div>
))
jest.mock(
    '../components/email/EmailIntegrationUpdate/EmailIntegrationUpdate',
    () => () => <div>EmailIntegrationUpdate</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreate/EmailIntegrationCreate',
    () => () => <div>EmailIntegrationCreate</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding',
    () => () => <div>EmailIntegrationCreateForwarding</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification',
    () => () => <div>EmailIntegrationCreateVerification</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreateCustom/EmailIntegrationCreateCustom',
    () => () => <div>EmailIntegrationCreateCustom</div>
)
jest.mock(
    '../components/email/outlook/OutlookIntegrationSetup/OutlookIntegrationSetup',
    () => () => <div>OutlookIntegrationSetup</div>
)

jest.mock('../components/facebook/FacebookIntegrationDetail', () => () => (
    <div>FacebookIntegrationDetail</div>
))
jest.mock(
    '../components/facebook/FacebookIntegrationList/FacebookIntegrationList.js',
    () => () => <div>FacebookIntegrationList</div>
)
jest.mock('../components/facebook/FacebookIntegrationPreferences', () => () => (
    <div>FacebookIntegrationPreferences</div>
))
jest.mock(
    '../components/facebook/FacebookIntegrationAds/FacebookIntegrationInstagramAds',
    () => () => <div>FacebookIntegrationInstagramAds</div>
)
jest.mock(
    '../components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup',
    () => () => <div>FacebookIntegrationSetup</div>
)
jest.mock(
    '../components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat',
    () => () => <div>FacebookIntegrationCustomerChat</div>
)

jest.mock('../components/http/HTTPIntegrationList', () => () => (
    <div>HTTPIntegrationList</div>
))
jest.mock(
    '../components/http/HTTPIntegrationOverview/HTTPIntegrationOverview',
    () => () => <div>HTTPIntegrationOverview</div>
)
jest.mock(
    '../components/http/HTTPIntegrationEvents/HTTPIntegrationEvents',
    () => () => <div>HTTPIntegrationEvents</div>
)
jest.mock(
    '../components/http/HTTPIntegrationEvent/HTTPIntegrationEvent',
    () => () => <div>HTTPIntegrationEvent</div>
)

jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationAppearance',
    () => () => <div>GorgiasChatIntegrationAppearance</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatCampaignDetail',
    () => () => <div>GorgiasChatCampaignDetail</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns',
    () => () => <div>GorgiasChatIntegrationCampaigns</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationInstall',
    () => () => <div>GorgiasChatIntegrationInstall</div>
)
jest.mock('../components/gorgias_chat/GorgiasChatIntegrationList', () => () => (
    <div>GorgiasChatIntegrationList</div>
))
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationPreferences',
    () => () => <div>GorgiasChatIntegrationPreferences</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationQuickReplies',
    () => () => <div>GorgiasChatIntegrationQuickReplies</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationSelfService',
    () => () => <div>GorgiasChatIntegrationSelfService</div>
)

jest.mock('../components/phone/PhoneIntegrationsListContainer', () => () => (
    <div>PhoneIntegrationsList</div>
))
jest.mock('../components/phone/PhoneIntegrationCreate', () => () => (
    <div>PhoneIntegrationCreate</div>
))
jest.mock('../components/phone/VoiceAppPreferences', () => () => (
    <div>VoiceAppPreferences</div>
))
jest.mock('../components/phone/PhoneIntegrationVoicemail', () => () => (
    <div>PhoneIntegrationVoicemail</div>
))
jest.mock('../components/phone/PhoneIntegrationCreate', () => () => (
    <div>PhoneIntegrationCreate</div>
))

jest.mock('../components/sms/SmsIntegrationsListContainer', () => () => (
    <div>SmsIntegrationsList</div>
))
jest.mock('../components/sms/SmsIntegrationCreate', () => () => (
    <div>SmsIntegrationCreate</div>
))
jest.mock('../components/sms/SmsAppPreferences', () => () => (
    <div>SmsAppPreferences</div>
))

jest.mock('../components/chat/ChatIntegrationList', () => () => (
    <div>ChatIntegrationList</div>
))
jest.mock(
    '../components/chat/ChatIntegrationAppearance/ChatIntegrationAppearance',
    () => () => <div>ChatIntegrationAppearance</div>
)
jest.mock(
    '../components/chat/ChatIntegrationCampaigns/ChatIntegrationCampaigns',
    () => () => <div>ChatIntegrationCampaigns</div>
)
jest.mock(
    '../components/chat/ChatIntegrationQuickReplies/ChatIntegrationQuickReplies',
    () => () => <div>ChatIntegrationQuickReplies</div>
)
jest.mock(
    '../components/chat/ChatIntegrationMigration/ChatIntegrationMigration',
    () => () => <div>ChatIntegrationMigration</div>
)
jest.mock(
    '../components/chat/ChatIntegrationPreferences/ChatIntegrationPreferences',
    () => () => <div>ChatIntegrationPreferences</div>
)
jest.mock(
    '../components/chat/ChatIntegrationInstall/ChatIntegrationInstall',
    () => () => <div>ChatIntegrationInstall</div>
)
jest.mock(
    '../components/chat/ChatIntegrationCampaigns/CampaignDetail.js',
    () => () => <div>CampaignDetail</div>
)

jest.mock('../components/smooch/SmoochIntegrationDetail', () => () => (
    <div>SmoochIntegrationDetail</div>
))
jest.mock('../components/smooch/SmoochIntegrationList', () => () => (
    <div>SmoochIntegrationList</div>
))
jest.mock('../components/smooch/SmoochIntegrationPreferences', () => () => (
    <div>SmoochIntegrationPreferences</div>
))

jest.mock('../components/shopify/ShopifyIntegrationList', () => () => (
    <div>ShopifyIntegrationList</div>
))
jest.mock('../components/shopify/ShopifyIntegrationDetail', () => () => (
    <div>ShopifyIntegrationDetail</div>
))

jest.mock('../components/klaviyo/KlaviyoIntegrationList', () => () => (
    <div>KlaviyoIntegrationList</div>
))
jest.mock('../components/klaviyo/KlaviyoIntegrationDetail', () => () => (
    <div>KlaviyoIntegrationDetail</div>
))

jest.mock('../components/recharge/Recharge', () => () => (
    <div>RechargeIntegration</div>
))

jest.mock('../components/smile/SmileIntegrationList', () => () => (
    <div>SmileIntegrationList</div>
))
jest.mock('../components/smile/SmileIntegrationDetail', () => () => (
    <div>SmileIntegrationDetail</div>
))

jest.mock('../components/yotpo/YotpoIntegrationList', () => () => (
    <div>YotpoIntegrationList</div>
))
jest.mock('../components/yotpo/YotpoIntegrationDetail', () => () => (
    <div>YotpoIntegrationDetail</div>
))

jest.mock('../components/magento2/Magento2', () => () => (
    <div>Magento2Integration</div>
))

beforeEach(() => {
    jest.clearAllMocks()
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)

describe('<IntegrationDetail />', () => {
    const minProps = {
        actions: {
            fetchIntegrations: jest.fn(),
            fetchOnboardingIntegrations: jest.fn(),
            fetchFacebookOnboardingIntegrations: jest.fn(),
            fetchOutlookOnboardingIntegrations: jest.fn(),
            activateOnboardingIntegrations: jest.fn(),
            onCreateSuccess: jest.fn(),
            triggerCreateSuccess: jest.fn(),
            onUpdateSuccess: jest.fn(),
            fetchIntegration: jest.fn(),
            deleteIntegration: jest.fn(),
            updateOrCreateIntegrationRequest: jest.fn(),
            createImportIntegration: jest.fn(),
            deactivateIntegration: jest.fn(),
            activateIntegration: jest.fn(),
            updateOrCreateIntegration: jest.fn(),
            importEmails: jest.fn(),
            onVerify: jest.fn(),
            fetchEmailDomain: jest.fn(),
            createEmailDomain: jest.fn(),
            deleteEmailDomain: jest.fn(),
            onEmailForwardingActivated: jest.fn(),
            verifyEmailIntegration: jest.fn(),
            sendVerificationEmail: jest.fn(),
            verifyEmailIntegrationManually: jest.fn(),
            klaviyoSyncHistoricalEvent: jest.fn(),
        },
        integrations: fromJS([]),
        currentPlan: {
            features: {
                twitter_integration: {
                    enabled: true,
                },
            },
        } as Plan,
        getEligibleShopifyIntegrationsFor: jest.fn(),
        getRedirectUri: jest.fn(),
        currentUser: fromJS({}),
        currentAccount: fromJS({
            domain: 'acme',
        }),
    }

    it.each([
        [IntegrationType.Aircall],
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.GorgiasChat],
        [IntegrationType.Http],
        [IntegrationType.Klaviyo],
        [IntegrationType.Phone],
        [IntegrationType.Sms],
        [IntegrationType.Magento2],
        [IntegrationType.Shopify],
        [IntegrationType.Smile],
        [IntegrationType.SmoochInside],
        [IntegrationType.Smooch],
        [IntegrationType.Yotpo],
    ])('should render the list of integrations for %s', (integrationType) => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <IntegrationDetail {...minProps} />
            </Provider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${integrationType}`,
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it(`should display not available message if ${IntegrationType.Twitter} integration not included in plan`, () => {
        const basicPlan = {
            features: {
                twitter_integration: {
                    enabled: false,
                },
            },
        }
        const {container} = renderWithRouter(
            <Provider store={store}>
                <IntegrationDetail
                    {...minProps}
                    currentPlan={basicPlan as Plan}
                />
            </Provider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${IntegrationType.Twitter}`,
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [IntegrationType.Aircall],
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.Phone],
        [IntegrationType.Sms],
    ])('should render the creation page for %s', (integrationType) => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <IntegrationDetail {...minProps} />
            </Provider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${integrationType}/new`,
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([[IntegrationType.Email], [IntegrationType.Facebook]])(
        'should render the setup page for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/setup`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.GorgiasChat],
        [IntegrationType.Http],
        [IntegrationType.Klaviyo],
        [IntegrationType.Recharge],
        [IntegrationType.Shopify],
        [IntegrationType.Smile],
        [IntegrationType.SmoochInside],
        [IntegrationType.Smooch],
        [IntegrationType.Yotpo],
    ])(
        'should render the page of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail
                        {...minProps}
                        integrations={fromJS({integration: {id: 1}})}
                    />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([[IntegrationType.GorgiasChat], [IntegrationType.SmoochInside]])(
        'should render the installation tab of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Installation}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.Facebook],
        [IntegrationType.GorgiasChat],
        [IntegrationType.Phone],
        [IntegrationType.Sms],
        [IntegrationType.Smooch],
    ])(
        'should render the preferences tab of a specific integrations for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Preferences}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([[IntegrationType.GorgiasChat], [IntegrationType.SmoochInside]])(
        'should render the list of campaigns of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Campaigns}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([[IntegrationType.GorgiasChat], [IntegrationType.SmoochInside]])(
        'should render the campaign tab of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Campaigns}/1`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([[IntegrationType.GorgiasChat], [IntegrationType.SmoochInside]])(
        'should render the quick replies tab of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.QuickReplies}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    describe(`${IntegrationType.Email}`, () => {
        it('should render the custom creation page', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Email}/new/${Tab.EmailCustom}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the forwarding page for a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Email}/1/${Tab.EmailForwarding}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the verification page for a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Email}/1/${Tab.EmailVerification}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.Facebook}`, () => {
        it('should render the customer chat tab for a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Facebook}/1/${Tab.FacebookCustomerChat}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the ads tab for a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Facebook}/1/${Tab.FacebookAds}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.Http}`, () => {
        it('should render the list of events page for a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail
                        {...minProps}
                        integrations={fromJS({integration: {id: 1}})}
                    />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Http}/1/${Tab.HttpEvents}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the page of an event for a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail
                        {...minProps}
                        integrations={fromJS({integration: {id: 1}})}
                    />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Http}/1/${Tab.HttpEvents}/1`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.GorgiasChat}`, () => {
        it('should render the self service tab of a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.GorgiasChat}/1/${Tab.ChatSelfService}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.Phone}`, () => {
        it('should render the voicemail tab of a specific integration', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Phone}/1/${Tab.PhoneVoicemail}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.SmoochInside}`, () => {
        it('should render the migration tab of a specific integrations', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.SmoochInside}/1/${Tab.SmoochInsideMigration}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
