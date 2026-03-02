import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { EmailProvider } from '@gorgias/helpdesk-queries'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { IntegrationType } from 'models/integration/types'
import useIsQuickRepliesEnabled from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { IntegrationDetail } from '../Integration'
import { Tab } from '../types'

jest.mock('@repo/feature-flags')

jest.mock('../components/aircall/AircallIntegrationList.tsx', () => () => (
    <div>AircallIntegrationList</div>
))
jest.mock('../components/aircall/AircallIntegrationCreate.tsx', () => () => (
    <div>AircallIntegrationCreate</div>
))

jest.mock('../components/bigcommerce/BigCommerce', () => () => (
    <div>BigCommerceIntegration</div>
))

jest.mock('../components/email/EmailIntegrationList', () => () => (
    <div>EmailIntegrationList</div>
))
jest.mock(
    '../components/email/EmailDomainVerification/EmailDomainVerification',
    () => () => <div>EmailDomainVerification</div>,
)
jest.mock(
    '../components/email/EmailOutboundVerification/EmailOutboundVerification',
    () => () => <div>EmailOutboundVerification</div>,
)
jest.mock(
    '../components/email/EmailDomainVerification/DEPRECATED_EmailDomainVerificationContainer',
    () => () => <div>DEPRECATED_EmailDomainVerificationContainer</div>,
)

jest.mock(
    '../components/email/EmailIntegrationUpdate/EmailIntegrationUpdate',
    () => () => <div>EmailIntegrationUpdate</div>,
)
jest.mock(
    '../components/email/EmailIntegrationCreate/EmailIntegrationCreate',
    () => () => <div>EmailIntegrationCreate</div>,
)
jest.mock(
    '../components/email/CustomerOnboarding/EmailIntegrationOnboarding',
    () => () => <div>EmailIntegrationOnboarding</div>,
)
jest.mock(
    '../components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding',
    () => () => <div>EmailIntegrationCreateForwarding</div>,
)
jest.mock(
    '../components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification',
    () => () => <div>EmailIntegrationCreateVerification</div>,
)
jest.mock(
    '../components/email/EmailIntegrationUpdateLayout/EmailIntegrationUpdateLayout',
    () =>
        ({ children }: any) => (
            <div>
                EmailIntegrationUpdateLayout
                <div>{children}</div>
            </div>
        ),
)

jest.mock('../components/facebook/FacebookIntegrationDetail', () => () => (
    <div>FacebookIntegrationDetail</div>
))
jest.mock(
    '../components/facebook/FacebookIntegrationList/FacebookIntegrationList',
    () => () => <div>FacebookIntegrationList</div>,
)
jest.mock('../components/facebook/FacebookIntegrationPreferences', () => () => (
    <div>FacebookIntegrationPreferences</div>
))
jest.mock(
    '../components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup',
    () => () => <div>FacebookIntegrationSetup</div>,
)
jest.mock(
    '../components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat',
    () => () => <div>FacebookIntegrationCustomerChat</div>,
)

jest.mock('../components/http/HTTP', () => () => <div>HTTPIntegration</div>)

jest.mock('../components/gorgias_chat/GorgiasAutomateChatIntegration', () => ({
    GorgiasAutomateChatIntegration: () => (
        <div>GorgiasAutomateChatIntegration</div>
    ),
}))
jest.mock('../components/gorgias_chat/GorgiasChatCreationWizard', () => ({
    GorgiasChatCreationWizard: () => <div>GorgiasChatCreationWizard</div>,
}))
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationAppearance',
    () => ({
        GorgiasChatIntegrationAppearance: () => (
            <div>GorgiasChatIntegrationAppearance</div>
        ),
    }),
)
jest.mock(
    '../components/gorgias_chat/legacy/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns',
    () => ({
        __esModule: true,
        default: () => <div>GorgiasChatIntegrationCampaigns</div>,
    }),
)
jest.mock('../components/gorgias_chat/GorgiasChatIntegrationInstall', () => ({
    GorgiasChatIntegrationInstall: () => (
        <div>GorgiasChatIntegrationInstall</div>
    ),
}))
jest.mock('../components/gorgias_chat/GorgiasChatIntegrationLanguages', () => ({
    GorgiasChatIntegrationLanguages: () => (
        <div>GorgiasChatIntegrationLanguages</div>
    ),
}))
jest.mock('../components/gorgias_chat/GorgiasChatIntegrationList', () => ({
    GorgiasChatIntegrationList: () => <div>GorgiasChatIntegrationList</div>,
}))
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationPreferences',
    () => ({
        GorgiasChatIntegrationPreferences: () => (
            <div>GorgiasChatIntegrationPreferences</div>
        ),
    }),
)
jest.mock(
    '../components/gorgias_chat/legacy/GorgiasChatIntegrationQuickReplies/GorgiasChatIntegrationQuickReplies',
    () => ({
        __esModule: true,
        default: () => <div>GorgiasChatIntegrationQuickReplies</div>,
    }),
)

jest.mock('../components/sms/SmsIntegration', () => () => (
    <div>SmsIntegration</div>
))
jest.mock('../components/voice/VoiceIntegration', () => () => (
    <div>VoiceIntegration</div>
))

jest.mock('../components/shopify/Shopify', () => () => (
    <div>ShopifyIntegration</div>
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

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: jest.fn(() => [
        {
            id: 1,
            name: 'Integration 1',
            type: 'shopify',
        },
    ]),
}))
jest.mock('hooks/useAppSelector', () => jest.fn(() => 'mocked'))

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

jest.mock(
    '../components/gorgias_chat/legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled',
    () => ({
        __esModule: true,
        default: jest.fn(),
    }),
)

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({} as RootState)
const useFlagMock = jest.mocked(useFlag)
const useIsQuickRepliesEnabledMock = jest.mocked(useIsQuickRepliesEnabled)

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
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useIsQuickRepliesEnabledMock.mockReturnValue(false)
    })

    it.each([
        [IntegrationType.Aircall],
        [IntegrationType.BigCommerce],
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.GorgiasChat],
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
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it(`should display not available message if ${IntegrationType.Twitter} integration not included in price`, () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <IntegrationDetail
                        {...minProps}
                        hasTwitterFeature={false}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${IntegrationType.Twitter}`,
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
        const { container } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <IntegrationDetail {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${integrationType}/new`,
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([[IntegrationType.Email], [IntegrationType.Facebook]])(
        'should render the setup page for %s',
        (integrationType) => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/setup`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it.each([
        [IntegrationType.Email],
        [IntegrationType.Facebook],
        [IntegrationType.GorgiasChat],
        [IntegrationType.Klaviyo],
        [IntegrationType.Recharge],
        [IntegrationType.Shopify],
        [IntegrationType.Magento2],
        [IntegrationType.Smile],
        [IntegrationType.Yotpo],
    ])(
        'should render the page of a specific integration for %s',
        (integrationType) => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail
                            {...minProps}
                            integrations={fromJS({
                                integration: {
                                    id: 1,
                                },
                            })}
                        />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    fit('should render the installation tab of a specific integration for %s', () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </QueryClientProvider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${IntegrationType.GorgiasChat}/1/${Tab.Installation}`,
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [IntegrationType.Facebook],
        [IntegrationType.GorgiasChat],
        [IntegrationType.Phone],
        [IntegrationType.Sms],
    ])(
        'should render the preferences tab of a specific integrations for %s',
        (integrationType) => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Preferences}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        },
    )

    it('should render the list of campaigns of a specific integration for %s', () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </QueryClientProvider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${IntegrationType.GorgiasChat}/1/${Tab.Campaigns}`,
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the campaign tab of a specific integration for %s', () => {
        const { container } = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>
            </QueryClientProvider>,
            {
                path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${IntegrationType.GorgiasChat}/1/${Tab.Campaigns}/1`,
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    describe(`${IntegrationType.Email}`, () => {
        it('should render the onboarding page', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Email}/new/${Tab.EmailOnboarding}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the forwarding page for a specific integration', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Email}/1/${Tab.EmailForwarding}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the verification page for a specific integration', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Email}/1/${Tab.EmailVerification}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render Domain verification tab when new-domain-verification FF is off and provider is mailgun', () => {
            const { getByText } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail
                            {...minProps}
                            integrations={fromJS({
                                integration: {
                                    meta: {
                                        provider: EmailProvider.Mailgun,
                                    },
                                },
                            })}
                        />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Email}/1/${Tab.EmailDomainVerification}`,
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

            const { getByText } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...props} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Email}/1/${Tab.EmailOutboundVerification}`,
                },
            )

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

                const { getByText } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <IntegrationDetail {...props} />
                        </Provider>
                    </QueryClientProvider>,
                    {
                        path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                        route: `/channels/${IntegrationType.Email}/1/${tab}`,
                    },
                )

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

            const { getByText } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...props} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Email}/1/${Tab.EmailOnboarding}`,
                },
            )

            expect(getByText('EmailIntegrationOnboarding')).toBeInTheDocument()
        })

        describe('new onboarding', () => {
            it('should render the new onboarding for the onboarding route', () => {
                const { getByText } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <IntegrationDetail {...minProps} />
                        </Provider>
                    </QueryClientProvider>,
                    {
                        path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                        route: `/channels/${IntegrationType.Email}/new/${Tab.EmailOnboarding}`,
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
                const { getByText } = renderWithRouter(
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <IntegrationDetail {...props} />
                        </Provider>
                    </QueryClientProvider>,
                    {
                        path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                        route: `/channels/${IntegrationType.Email}/1`,
                    },
                )
                expect(
                    getByText('EmailIntegrationOnboarding'),
                ).toBeInTheDocument()
            })
        })
    })

    describe(`${IntegrationType.Facebook}`, () => {
        it('should render the customer chat tab for a specific integration', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.Facebook}/1/${Tab.FacebookCustomerChat}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.Phone}`, () => {
        it('should render the voicemail tab of a specific integration', () => {
            const { container } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/channels/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/channels/${IntegrationType.Phone}/1/${Tab.PhoneVoicemail}`,
                },
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.GorgiasChat} - QuickReplies tab`, () => {
        it('should render QuickReplies tab when feature is enabled', () => {
            useIsQuickRepliesEnabledMock.mockReturnValue(true)

            const { getByText } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.GorgiasChat}/1/${Tab.QuickReplies}`,
                },
            )

            expect(
                getByText('GorgiasChatIntegrationQuickReplies'),
            ).toBeInTheDocument()
        })

        it('should not render QuickReplies tab when feature is disabled', () => {
            useIsQuickRepliesEnabledMock.mockReturnValue(false)

            const { queryByText } = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <IntegrationDetail {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.GorgiasChat}/1/${Tab.QuickReplies}`,
                },
            )

            expect(
                queryByText('GorgiasChatIntegrationQuickReplies'),
            ).not.toBeInTheDocument()
        })
    })
})
