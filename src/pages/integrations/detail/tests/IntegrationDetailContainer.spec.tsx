import React from 'react'
import {fromJS} from 'immutable'

import {renderWithRouter} from '../../../../utils/testing'
import {IntegrationType} from '../../../../models/integration/types'
import {IntegrationDetailContainer, Tab} from '../IntegrationDetailContainer'

jest.mock('../components/aircall/AircallIntegrationList.js', () => () => (
    <div>AircallIntegrationList</div>
))
jest.mock('../components/aircall/AircallIntegrationCreate.js', () => () => (
    <div>AircallIntegrationCreate</div>
))

jest.mock('../components/email/EmailIntegrationList.js', () => () => (
    <div>EmailIntegrationList</div>
))
jest.mock(
    '../components/email/EmailIntegrationUpdate/EmailIntegrationUpdate.js',
    () => () => <div>EmailIntegrationUpdate</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreate/EmailIntegrationCreate.js',
    () => () => <div>EmailIntegrationCreate</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding.js',
    () => () => <div>EmailIntegrationCreateForwarding</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification.js',
    () => () => <div>EmailIntegrationCreateVerification</div>
)
jest.mock(
    '../components/email/EmailIntegrationCreateCustom/EmailIntegrationCreateCustom.js',
    () => () => <div>EmailIntegrationCreateCustom</div>
)
jest.mock(
    '../components/email/outlook/OutlookIntegrationSetup/OutlookIntegrationSetup.js',
    () => () => <div>OutlookIntegrationSetup</div>
)

jest.mock('../components/facebook/FacebookIntegrationDetail.js', () => () => (
    <div>FacebookIntegrationDetail</div>
))
jest.mock(
    '../components/facebook/FacebookIntegrationList/FacebookIntegrationList.js',
    () => () => <div>FacebookIntegrationList</div>
)
jest.mock(
    '../components/facebook/FacebookIntegrationPreferences.js',
    () => () => <div>FacebookIntegrationPreferences</div>
)
jest.mock(
    '../components/facebook/FacebookIntegrationAds/FacebookIntegrationInstagramAds.js',
    () => () => <div>FacebookIntegrationInstagramAds</div>
)
jest.mock(
    '../components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup.js',
    () => () => <div>FacebookIntegrationSetup</div>
)
jest.mock(
    '../components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat.js',
    () => () => <div>FacebookIntegrationCustomerChat</div>
)

jest.mock('../components/http/HTTPIntegrationList.js', () => () => (
    <div>HTTPIntegrationList</div>
))
jest.mock(
    '../components/http/HTTPIntegrationOverview/HTTPIntegrationOverview.js',
    () => () => <div>HTTPIntegrationOverview</div>
)
jest.mock(
    '../components/http/HTTPIntegrationEvents/HTTPIntegrationEvents.js',
    () => () => <div>HTTPIntegrationEvents</div>
)
jest.mock(
    '../components/http/HTTPIntegrationEvent/HTTPIntegrationEvent.js',
    () => () => <div>HTTPIntegrationEvent</div>
)

jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationAppearance',
    () => () => <div>GorgiasChatIntegrationAppearance</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatCampaignDetail.js',
    () => () => <div>GorgiasChatCampaignDetail</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns.js',
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
    '../components/gorgias_chat/GorgiasChatIntegrationPreferences.js',
    () => () => <div>GorgiasChatIntegrationPreferences</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationQuickReplies.js',
    () => () => <div>GorgiasChatIntegrationQuickReplies</div>
)
jest.mock(
    '../components/gorgias_chat/GorgiasChatIntegrationSelfService',
    () => () => <div>GorgiasChatIntegrationSelfService</div>
)

jest.mock('../components/phone/PhoneIntegrationList', () => () => (
    <div>PhoneIntegrationList</div>
))
jest.mock('../components/phone/PhoneIntegrationCreate', () => () => (
    <div>PhoneIntegrationCreate</div>
))
jest.mock('../components/phone/PhoneIntegrationPreferences', () => () => (
    <div>PhoneIntegrationPreferences</div>
))
jest.mock('../components/phone/PhoneIntegrationVoicemail', () => () => (
    <div>PhoneIntegrationVoicemail</div>
))

jest.mock('../components/phone/PhoneIntegrationList', () => () => (
    <div>PhoneIntegrationList</div>
))
jest.mock('../components/phone/PhoneIntegrationCreate', () => () => (
    <div>PhoneIntegrationCreate</div>
))
jest.mock('../components/phone/PhoneIntegrationPreferences', () => () => (
    <div>PhoneIntegrationPreferences</div>
))
jest.mock('../components/phone/PhoneIntegrationVoicemail', () => () => (
    <div>PhoneIntegrationVoicemail</div>
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
    '../components/chat/ChatIntegrationQuickReplies/ChatIntegrationQuickReplies.js',
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

jest.mock('../components/smooch/SmoochIntegrationDetail.js', () => () => (
    <div>SmoochIntegrationDetail</div>
))
jest.mock('../components/smooch/SmoochIntegrationList.js', () => () => (
    <div>SmoochIntegrationList</div>
))
jest.mock('../components/smooch/SmoochIntegrationPreferences.js', () => () => (
    <div>SmoochIntegrationPreferences</div>
))

jest.mock('../components/shopify/ShopifyIntegrationList.js', () => () => (
    <div>ShopifyIntegrationList</div>
))
jest.mock('../components/shopify/ShopifyIntegrationDetail.js', () => () => (
    <div>ShopifyIntegrationDetail</div>
))

jest.mock('../components/klaviyo/KlaviyoIntegrationList', () => () => (
    <div>KlaviyoIntegrationList</div>
))
jest.mock('../components/klaviyo/KlaviyoIntegrationDetail', () => () => (
    <div>KlaviyoIntegrationDetail</div>
))

jest.mock('../components/recharge/RechargeIntegrationList.js', () => () => (
    <div>RechargeIntegrationList</div>
))
jest.mock('../components/recharge/RechargeIntegrationDetail.js', () => () => (
    <div>RechargeIntegrationDetail</div>
))

jest.mock('../components/smile/SmileIntegrationList.js', () => () => (
    <div>SmileIntegrationList</div>
))
jest.mock('../components/smile/SmileIntegrationDetail.js', () => () => (
    <div>SmileIntegrationDetail</div>
))

jest.mock('../components/yotpo/YotpoIntegrationList', () => () => (
    <div>YotpoIntegrationList</div>
))
jest.mock('../components/yotpo/YotpoIntegrationDetail', () => () => (
    <div>YotpoIntegrationDetail</div>
))

jest.mock('../components/magento2/Magento2IntegrationDetail.js', () => () => (
    <div>Magento2IntegrationDetail</div>
))
jest.mock('../components/magento2/Magento2IntegrationList.js', () => () => (
    <div>Magento2IntegrationList</div>
))

beforeEach(() => {
    jest.clearAllMocks()
})

describe('<IntegrationDetailContainer />', () => {
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
            onEmailForwardingActivated: jest.fn(),
            verifyEmailIntegration: jest.fn(),
            sendVerificationEmail: jest.fn(),
            verifyEmailIntegrationManually: jest.fn(),
            klaviyoSyncHistoricalEvent: jest.fn(),
        },
        integrations: fromJS([]),
        getEligibleShopifyIntegrationsFor: jest.fn(),
        getRedirectUri: jest.fn(),
        currentUser: fromJS({}),
    }

    it.each([
        [IntegrationType.AircallIntegrationType],
        [IntegrationType.EmailIntegrationType],
        [IntegrationType.FacebookIntegrationType],
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.HttpIntegrationType],
        [IntegrationType.KlaviyoIntegrationType],
        [IntegrationType.PhoneIntegrationType],
        [IntegrationType.Magento2IntegrationType],
        [IntegrationType.RechargeIntegrationType],
        [IntegrationType.ShopifyIntegrationType],
        [IntegrationType.SmileIntegrationType],
        [IntegrationType.SmoochInsideIntegrationType],
        [IntegrationType.SmoochIntegrationType],
        [IntegrationType.YotpoIntegrationType],
    ])('should render the list of integrations for %s', (integrationType) => {
        const {container} = renderWithRouter(
            <IntegrationDetailContainer {...minProps} />,
            {
                path:
                    '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${integrationType}`,
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [IntegrationType.AircallIntegrationType],
        [IntegrationType.EmailIntegrationType],
        [IntegrationType.FacebookIntegrationType],
        [IntegrationType.PhoneIntegrationType],
    ])('should render the creation page for %s', (integrationType) => {
        const {container} = renderWithRouter(
            <IntegrationDetailContainer {...minProps} />,
            {
                path:
                    '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${integrationType}/new`,
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [IntegrationType.EmailIntegrationType],
        [IntegrationType.FacebookIntegrationType],
    ])('should render the setup page for %s', (integrationType) => {
        const {container} = renderWithRouter(
            <IntegrationDetailContainer {...minProps} />,
            {
                path:
                    '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                route: `/integrations/${integrationType}/setup`,
            }
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [IntegrationType.EmailIntegrationType],
        [IntegrationType.FacebookIntegrationType],
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.HttpIntegrationType],
        [IntegrationType.KlaviyoIntegrationType],
        [IntegrationType.Magento2IntegrationType],
        [IntegrationType.RechargeIntegrationType],
        [IntegrationType.ShopifyIntegrationType],
        [IntegrationType.SmileIntegrationType],
        [IntegrationType.SmoochInsideIntegrationType],
        [IntegrationType.SmoochIntegrationType],
        [IntegrationType.YotpoIntegrationType],
    ])(
        'should render the page of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer
                    {...minProps}
                    integrations={fromJS({integration: {id: 1}})}
                />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.SmoochInsideIntegrationType],
    ])(
        'should render the installation tab of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Installation}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.FacebookIntegrationType],
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.PhoneIntegrationType],
        [IntegrationType.SmoochIntegrationType],
    ])(
        'should render the preferences tab of a specific integrations for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Preferences}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.SmoochInsideIntegrationType],
    ])(
        'should render the list of campaigns of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Campaigns}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.SmoochInsideIntegrationType],
    ])(
        'should render the campaign tab of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.Campaigns}/1`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        [IntegrationType.GorgiasChatIntegrationType],
        [IntegrationType.SmoochInsideIntegrationType],
    ])(
        'should render the quick replies tab of a specific integration for %s',
        (integrationType) => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${integrationType}/1/${Tab.QuickReplies}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    describe(`${IntegrationType.EmailIntegrationType}`, () => {
        it('should render the custom creation page', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.EmailIntegrationType}/new/${Tab.EmailCustom}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the forwarding page for a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.EmailIntegrationType}/1/${Tab.EmailForwarding}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the verification page for a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.EmailIntegrationType}/1/${Tab.EmailVerification}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.FacebookIntegrationType}`, () => {
        it('should render the customer chat tab for a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.FacebookIntegrationType}/1/${Tab.FacebookCustomerChat}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the ads tab for a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.FacebookIntegrationType}/1/${Tab.FacebookAds}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.HttpIntegrationType}`, () => {
        it('should render the list of events page for a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer
                    {...minProps}
                    integrations={fromJS({integration: {id: 1}})}
                />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.HttpIntegrationType}/1/${Tab.HttpEvents}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render the page of an event for a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer
                    {...minProps}
                    integrations={fromJS({integration: {id: 1}})}
                />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.HttpIntegrationType}/1/${Tab.HttpEvents}/1`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.GorgiasChatIntegrationType}`, () => {
        it('should render the self service tab of a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.GorgiasChatIntegrationType}/1/${Tab.ChatSelfService}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.PhoneIntegrationType}`, () => {
        it('should render the voicemail tab of a specific integration', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.PhoneIntegrationType}/1/${Tab.PhoceVoicemail}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe(`${IntegrationType.SmoochInsideIntegrationType}`, () => {
        it('should render the migration tab of a specific integrations', () => {
            const {container} = renderWithRouter(
                <IntegrationDetailContainer {...minProps} />,
                {
                    path:
                        '/integrations/:integrationType/:integrationId?/:extra?/:subId?',
                    route: `/integrations/${IntegrationType.SmoochInsideIntegrationType}/1/${Tab.SmoochInsideMigration}`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
