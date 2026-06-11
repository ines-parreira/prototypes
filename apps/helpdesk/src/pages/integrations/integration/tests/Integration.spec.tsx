import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'

import { EmailProvider } from '@gorgias/helpdesk-queries'

import { IntegrationType } from 'models/integration/types'
import type { RootState, StoreDispatch } from 'state/types'

import { IntegrationDetail } from '../Integration'
import { Tab } from '../types'

jest.mock('@repo/feature-flags')
jest.mock('../components/aircall/AircallIntegrationList.tsx', () => ({
    AircallIntegrationList: () => <div>AircallIntegrationList</div>,
}))
jest.mock('../components/aircall/AircallIntegrationCreate.tsx', () => ({
    DefaultExportAircallIntegrationCreate: () => (
        <div>AircallIntegrationCreate</div>
    ),
}))
jest.mock('../components/bigcommerce/BigCommerce', () => ({
    BigCommerce: () => <div>BigCommerceIntegration</div>,
}))
jest.mock('../components/email/EmailIntegrationList', () => ({
    EmailIntegrationList: () => <div>EmailIntegrationList</div>,
}))
jest.mock(
    '../components/email/EmailDomainVerification/EmailDomainVerification',
    () => ({
        EmailDomainVerification: () => <div>EmailDomainVerification</div>,
    }),
)
jest.mock(
    '../components/email/EmailOutboundVerification/EmailOutboundVerification',
    () => ({
        EmailOutboundVerification: () => <div>EmailOutboundVerification</div>,
    }),
)
jest.mock(
    '../components/email/EmailDomainVerification/DEPRECATED_EmailDomainVerificationContainer',
    () => ({
        DEPRECATED_EmailDomainVerificationContainer: () => (
            <div>DEPRECATED_EmailDomainVerificationContainer</div>
        ),
    }),
)
jest.mock(
    '../components/email/EmailIntegrationUpdate/EmailIntegrationUpdate',
    () => ({ EmailIntegrationUpdate: () => <div>EmailIntegrationUpdate</div> }),
)
jest.mock(
    '../components/email/EmailIntegrationCreate/EmailIntegrationCreate',
    () => ({ EmailIntegrationCreate: () => <div>EmailIntegrationCreate</div> }),
)
jest.mock(
    '../components/email/CustomerOnboarding/EmailIntegrationOnboarding',
    () => ({
        EmailIntegrationOnboarding: () => <div>EmailIntegrationOnboarding</div>,
    }),
)
jest.mock(
    '../components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding',
    () => ({
        DefaultExportEmailIntegrationCreateForwarding: () => (
            <div>EmailIntegrationCreateForwarding</div>
        ),
    }),
)
jest.mock(
    '../components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification',
    () => ({
        DefaultExportEmailIntegrationCreateVerification: () => (
            <div>EmailIntegrationCreateVerification</div>
        ),
    }),
)
jest.mock(
    '../components/email/EmailIntegrationUpdateLayout/EmailIntegrationUpdateLayout',
    () => ({
        EmailIntegrationUpdateLayout: ({ children }: any) => (
            <div>
                EmailIntegrationUpdateLayout
                <div>{children}</div>
            </div>
        ),
    }),
)
jest.mock('../components/facebook/FacebookIntegrationDetail', () => ({
    DefaultExportFacebookIntegrationDetail: () => (
        <div>FacebookIntegrationDetail</div>
    ),
}))
jest.mock(
    '../components/facebook/FacebookIntegrationList/FacebookIntegrationList',
    () => ({
        FacebookIntegrationList: () => <div>FacebookIntegrationList</div>,
    }),
)
jest.mock('../components/facebook/FacebookIntegrationPreferences', () => ({
    DefaultExportFacebookIntegrationPreferences: () => (
        <div>FacebookIntegrationPreferences</div>
    ),
}))
jest.mock(
    '../components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup',
    () => ({
        DefaultExportFacebookIntegrationSetup: () => (
            <div>FacebookIntegrationSetup</div>
        ),
    }),
)
jest.mock(
    '../components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat',
    () => ({
        FacebookIntegrationCustomerChat: () => (
            <div>FacebookIntegrationCustomerChat</div>
        ),
    }),
)
jest.mock('../components/http/HTTP', () => ({
    Http: () => <div>HTTPIntegration</div>,
}))
jest.mock('../components/gorgias_chat/GorgiasChatIntegration', () => ({
    GorgiasChatIntegration: () => <div>GorgiasChatIntegration</div>,
}))
jest.mock('../components/sms/SmsIntegration', () => ({
    SmsIntegration: () => <div>SmsIntegration</div>,
}))
jest.mock('../components/voice/VoiceIntegration', () => ({
    VoiceIntegration: () => <div>VoiceIntegration</div>,
}))
jest.mock('../components/shopify/Shopify', () => ({
    Shopify: () => <div>ShopifyIntegration</div>,
}))
jest.mock('../components/klaviyo/KlaviyoIntegrationList', () => ({
    KlaviyoIntegrationList: () => <div>KlaviyoIntegrationList</div>,
}))
jest.mock('../components/klaviyo/KlaviyoIntegrationDetail', () => ({
    KlaviyoIntegrationDetail: () => <div>KlaviyoIntegrationDetail</div>,
}))
jest.mock('../components/recharge/Recharge', () => ({
    Recharge: () => <div>RechargeIntegration</div>,
}))
jest.mock('../components/smile/SmileIntegrationList', () => ({
    SmileIntegrationList: () => <div>SmileIntegrationList</div>,
}))
jest.mock('../components/smile/SmileIntegrationDetail', () => ({
    DefaultExportSmileIntegrationDetail: () => (
        <div>SmileIntegrationDetail</div>
    ),
}))
jest.mock('../components/yotpo/YotpoIntegrationList', () => ({
    YotpoIntegrationList: () => <div>YotpoIntegrationList</div>,
}))
jest.mock('../components/yotpo/YotpoIntegrationDetail', () => ({
    DefaultExportYotpoIntegrationDetail: () => (
        <div>YotpoIntegrationDetail</div>
    ),
}))
jest.mock('../components/magento2/Magento2', () => ({
    Magento2: () => <div>Magento2Integration</div>,
}))
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)
const useFlagMock = jest.mocked(useFlag)
describe('<IntegrationDetail />', () => {
    const minProps = {
        actions: {
            fetchIntegrations: jest.fn(),
            fetchOnboardingIntegrations: jest.fn(),
            fetchFacebookOnboardingIntegrations: jest.fn(),
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
            onVerifyMigrationForwarding: jest.fn(),
            onVerifyMigrationForwardingFailure: jest.fn(),
            fetchEmailDomain: jest.fn(),
            createEmailDomain: jest.fn(),
            deleteEmailDomain: jest.fn(),
            onEmailForwardingActivated: jest.fn(),
            verifyEmailIntegration: jest.fn(),
            sendVerificationEmail: jest.fn(),
            verifyEmailIntegrationManually: jest.fn(),
            klaviyoSyncHistoricalEvent: jest.fn(),
            createGorgiasChatIntegration: jest.fn(),
            fetchChatIntegrationStatus: jest.fn(),
            getTranslations: jest.fn(),
            getApplicationTexts: jest.fn(),
            updateApplicationTexts: jest.fn(),
            getInstallationStatus: jest.fn(),
            getInstallationStatuses: jest.fn(),
            fetchEmailMigrationStatus: jest.fn(),
            hideShopifyCheckoutChatBanner: jest.fn(),
        },
        integrations: fromJS([]),
        hasTwitterFeature: true,
        getEligibleShopifyIntegrationsFor: jest.fn(),
        getRedirectUri: jest.fn(),
        currentUser: fromJS({}),
        currentAccount: fromJS({
            domain: 'acme',
        }),
    }
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })
    it.each([
        [IntegrationType.Aircall],
        [IntegrationType.BigCommerce],
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.Http],
        [IntegrationType.Klaviyo],
        [IntegrationType.Phone],
        [IntegrationType.Sms],
        [IntegrationType.Magento2],
        [IntegrationType.Recharge],
        [IntegrationType.Shopify],
        [IntegrationType.Smile],
        [IntegrationType.Yotpo],
    ])(
        'should render the list or detail page of integrations for %s',
        (integrationType) => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [`/integrations/${integrationType}`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        },
    )
    it(`should display not available message if ${IntegrationType.Twitter} integration not included in price`, () => {
        const { container } = render(
            <IntegrationDetail {...minProps} hasTwitterFeature={false} />,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [`/integrations/${IntegrationType.Twitter}`],
                storeState: store.getState() as object,
            },
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
        const { container } = render(<IntegrationDetail {...minProps} />, {
            path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
            initialEntries: [`/integrations/${integrationType}/new`],
            storeState: store.getState() as object,
        })
        expect(container.firstChild).toMatchSnapshot()
    })
    it.each([[IntegrationType.Email], [IntegrationType.Facebook]])(
        'should render the setup page for %s',
        (integrationType) => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [`/integrations/${integrationType}/setup`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        },
    )
    it.each([
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.Klaviyo],
        [IntegrationType.Recharge],
        [IntegrationType.Shopify],
        [IntegrationType.Magento2],
        [IntegrationType.Smile],
        [IntegrationType.Yotpo],
    ])(
        'should render the page of a specific integration for %s',
        (integrationType) => {
            const { container } = render(
                <IntegrationDetail
                    {...minProps}
                    integrations={fromJS({
                        integration: {
                            id: 1,
                        },
                    })}
                />,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    initialEntries: [`/integrations/${integrationType}/1`],
                    storeState: store.getState() as object,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )
    it.each([
        [IntegrationType.Facebook],
        [IntegrationType.Phone],
        [IntegrationType.Sms],
    ])(
        'should render the preferences tab of a specific integrations for %s',
        (integrationType) => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/integrations/${integrationType}/1/${Tab.Preferences}`,
                ],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        },
    )
    describe(`${IntegrationType.Email}`, () => {
        it('should render the onboarding page', () => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/channels/${IntegrationType.Email}/new/${Tab.EmailOnboarding}`,
                ],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render the forwarding page for a specific integration', () => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/channels/${IntegrationType.Email}/1/${Tab.EmailForwarding}`,
                ],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render the verification page for a specific integration', () => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/channels/${IntegrationType.Email}/1/${Tab.EmailVerification}`,
                ],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render Domain verification tab when new-domain-verification FF is off and provider is mailgun', () => {
            const { getByText } = render(
                <IntegrationDetail
                    {...minProps}
                    integrations={fromJS({
                        integration: {
                            meta: {
                                provider: EmailProvider.Mailgun,
                            },
                        },
                    })}
                />,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    initialEntries: [
                        `/channels/${IntegrationType.Email}/1/${Tab.EmailDomainVerification}`,
                    ],
                    storeState: store.getState() as object,
                },
            )
            expect(
                getByText('DEPRECATED_EmailDomainVerificationContainer'),
            ).toBeInTheDocument()
        })
        it('should render Outbound verification tab when new-domain-verification FF is off and provider is Sendgrid', () => {
            const props = {
                ...minProps,
                integrations: fromJS({
                    integration: {
                        id: 1,
                        type: 'email',
                        meta: {
                            verified: true,
                            provider: EmailProvider.Sendgrid,
                        },
                    },
                }),
            }
            const { getByText } = render(<IntegrationDetail {...props} />, {
                path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/channels/${IntegrationType.Email}/1/${Tab.EmailOutboundVerification}`,
                ],
                storeState: store.getState() as object,
            })
            expect(getByText('EmailOutboundVerification')).toBeInTheDocument()
        })
        it.each([
            {
                provider: EmailProvider.Mailgun,
                tab: Tab.EmailDomainVerification,
            },
            {
                provider: EmailProvider.Sendgrid,
                tab: Tab.EmailOutboundVerification,
            },
        ])(
            'should render the domain verification tab when new-domain-verification FF is on',
            ({ provider, tab }) => {
                useFlagMock.mockReturnValue(true)
                const props = {
                    ...minProps,
                    integrations: fromJS({
                        integration: {
                            id: 1,
                            type: 'email',
                            meta: { verified: true, provider },
                        },
                    }),
                }
                const { getByText } = render(<IntegrationDetail {...props} />, {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    initialEntries: [
                        `/channels/${IntegrationType.Email}/1/${tab}`,
                    ],
                    storeState: store.getState() as object,
                })
                expect(getByText('EmailDomainVerification')).toBeInTheDocument()
            },
        )
        it('should render the onboarding tab when domain verification FF is on and tab is Onboarding', () => {
            useFlagMock.mockReturnValue(true)
            const props = {
                ...minProps,
                integrations: fromJS({
                    integration: {
                        id: 1,
                        type: 'email',
                        meta: { verified: true },
                    },
                }),
            }
            const { getByText } = render(<IntegrationDetail {...props} />, {
                path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/channels/${IntegrationType.Email}/1/${Tab.EmailOnboarding}`,
                ],
                storeState: store.getState() as object,
            })
            expect(getByText('EmailIntegrationOnboarding')).toBeInTheDocument()
        })
        describe('new onboarding', () => {
            it('should render the new onboarding for the onboarding route', () => {
                const { getByText } = render(
                    <IntegrationDetail {...minProps} />,
                    {
                        path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                        initialEntries: [
                            `/channels/${IntegrationType.Email}/new/${Tab.EmailOnboarding}`,
                        ],
                        storeState: store.getState() as object,
                    },
                )
                expect(
                    getByText('EmailIntegrationOnboarding'),
                ).toBeInTheDocument()
            })
            it('should render the new onboarding for the update route when an email integration is unverified', () => {
                const props = {
                    ...minProps,
                    integrations: fromJS({
                        integration: {
                            id: 1,
                            type: 'email',
                            meta: { verified: false },
                        },
                    }),
                }
                const { getByText } = render(<IntegrationDetail {...props} />, {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    initialEntries: [`/channels/${IntegrationType.Email}/1`],
                    storeState: store.getState() as object,
                })
                expect(
                    getByText('EmailIntegrationOnboarding'),
                ).toBeInTheDocument()
            })
        })
    })
    describe(`${IntegrationType.Facebook}`, () => {
        it('should render the customer chat tab for a specific integration', () => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/integrations/${IntegrationType.Facebook}/1/${Tab.FacebookCustomerChat}`,
                ],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe(`${IntegrationType.Phone}`, () => {
        it('should render the voicemail tab of a specific integration', () => {
            const { container } = render(<IntegrationDetail {...minProps} />, {
                path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/channels/${IntegrationType.Phone}/1/${Tab.PhoneVoicemail}`,
                ],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe(`${IntegrationType.GorgiasChat}`, () => {
        it('should render GorgiasChatIntegration', () => {
            const { getByText } = render(<IntegrationDetail {...minProps} />, {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                initialEntries: [
                    `/integrations/${IntegrationType.GorgiasChat}`,
                ],
                storeState: store.getState() as object,
            })
            expect(getByText('GorgiasChatIntegration')).toBeInTheDocument()
        })
    })
})
