import React, {useEffect, useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List, Map} from 'immutable'
import {useUpdateEffect, useAsyncFn} from 'react-use'

import {Container} from 'reactstrap'
import classNames from 'classnames'

import * as IntegrationsActions from 'state/integrations/actions'
import {makeHasFeature} from 'state/billing/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {IntegrationType} from 'models/integration/types'
import {RootState} from 'state/types'

import {
    getEligibleShopifyIntegrationsFor,
    makeGetRedirectUri,
} from 'state/integrations/selectors'
import {
    fetchNewPhoneNumbers,
    fetchPhoneNumbers,
} from 'models/phoneNumber/resources'
import {
    newPhoneNumbersFetched,
    phoneNumbersFetched,
} from 'state/entities/phoneNumbers/actions'
import {AccountFeature} from 'state/currentAccount/types'
import {compare} from 'utils'
import {reportError} from 'utils/errors'
import useAppDispatch from 'hooks/useAppDispatch'

import {EmailProvider} from 'models/integration/constants'

import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from 'state/entities/chatInstallationStatus/actions'
import history from '../../history'

import AircallIntegrationList from './components/aircall/AircallIntegrationList'
import AircallIntegrationCreate from './components/aircall/AircallIntegrationCreate'

import OutlookIntegrationSetup from './components/email/outlook/OutlookIntegrationSetup/OutlookIntegrationSetup'

import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList/FacebookIntegrationList'
import FacebookIntegrationPreferences from './components/facebook/FacebookIntegrationPreferences'
import FacebookIntegrationInstagramAds from './components/facebook/FacebookIntegrationAds/FacebookIntegrationInstagramAds'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup'
import FacebookIntegrationCustomerChat from './components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat'

import GorgiasChatCreationWizard from './components/gorgias_chat/GorgiasChatCreationWizard'
import GorgiasChatIntegrationAppearance from './components/gorgias_chat/GorgiasChatIntegrationAppearance'
import ChatCampaignDetailsFactory from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/containers/CampaignDetailsFactory'
import GorgiasChatIntegrationCampaigns from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns'
import GorgiasChatIntegrationList from './components/gorgias_chat/GorgiasChatIntegrationList'
import GorgiasChatIntegrationInstall from './components/gorgias_chat/GorgiasChatIntegrationInstall'
import GorgiasChatIntegrationPreferences from './components/gorgias_chat/GorgiasChatIntegrationPreferences'
import GorgiasChatIntegrationQuickReplies from './components/gorgias_chat/GorgiasChatIntegrationQuickReplies'

import HTTPIntegrationList from './components/http/HTTPIntegrationList'

import Magento2 from './components/magento2/Magento2'

import Shopify from './components/shopify/Shopify'

import BigCommerce from './components/bigcommerce/BigCommerce'

import KlaviyoIntegrationList from './components/klaviyo/KlaviyoIntegrationList'
import KlaviyoIntegrationDetail from './components/klaviyo/KlaviyoIntegrationDetail'

import Recharge from './components/recharge/Recharge'

import SmileIntegrationList from './components/smile/SmileIntegrationList'
import SmileIntegrationDetail from './components/smile/SmileIntegrationDetail'

import YotpoIntegrationList from './components/yotpo/YotpoIntegrationList'
import YotpoIntegrationDetail from './components/yotpo/YotpoIntegrationDetail'

import EmailIntegrationList from './components/email/EmailIntegrationList'
import EmailIntegrationUpdate from './components/email/EmailIntegrationUpdate/EmailIntegrationUpdate'
import EmailIntegrationCreate from './components/email/EmailIntegrationCreate/EmailIntegrationCreate'
import EmailIntegrationCreateForwarding from './components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding'
import EmailIntegrationCreateVerification from './components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification'
import EmailIntegrationCreateCustom from './components/email/EmailIntegrationCreateCustom/EmailIntegrationCreateCustom'
import EmailIntegrationLayout from './components/email/EmailIntegrationUpdateLayout/EmailIntegrationUpdateLayout'
import EmailDomainVerificationContainer from './components/email/EmailDomainVerification/EmailDomainVerificationContainer'
import EmailOutboundVerification from './components/email/EmailOutboundVerification/EmailOutboundVerification'

import HTTPIntegrationOverview from './components/http/HTTPIntegrationOverview/HTTPIntegrationOverview'
import HTTPIntegrationEvents from './components/http/HTTPIntegrationEvents/HTTPIntegrationEvents'
import HTTPIntegrationEvent from './components/http/HTTPIntegrationEvent/HTTPIntegrationEvent'
import HTTPIntegrationLayout from './components/http/HTTPIntegrationLayout/HTTPIntegrationLayout'

import VoiceIntegration from './components/voice/VoiceIntegration'
import SmsIntegration from './components/sms/SmsIntegration'
import WhatsAppIntegration from './components/whatsapp/WhatsAppIntegration'

import TwitterIntegrationDetail from './components/twitter/TwitterIntegrationDetail'
import TwitterIntegrationList from './components/twitter/TwitterIntegrationList'
import GorgiasTranslateText from './components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import EmailMigration from './components/email/EmailMigration/EmailMigration'
import SmoochDeprecatedIntegration from './components/deprecated/SmoochDeprecatedIntegration'

export enum Tab {
    EmailForwarding = 'forwarding',
    EmailVerification = 'verification',
    EmailDomainVerification = 'dns',
    EmailOutboundVerification = 'outbound-verification',
    EmailCustom = 'custom',
    FacebookCustomerChat = 'customer_chat',
    Preferences = 'preferences',
    FacebookAds = 'ads',
    HttpEvents = 'events',
    Installation = 'installation',
    QuickReplies = 'quick_replies',
    Campaigns = 'campaigns',
    Appearance = 'appearance',
    PhoneVoicemail = 'voicemail',
    PhoneGreetingMessage = 'greeting-message',
    PhoneIvr = 'ivr',
    CreateWizard = 'create-wizard',
}

export const IntegrationDetail = ({
    actions,
    currentUser,
    getRedirectUri,
    hasTwitterFeature,
    integrations,
}: ConnectedProps<typeof connector>) => {
    const {extra, integrationId, integrationType, subId} = useParams<{
        extra: string
        integrationId: string
        integrationType: IntegrationType
        subId: string
    }>()

    const isIntegrationId = ![
        'new',
        'connections',
        'integrations',
        'onboard',
        'setup',
        'about',
        'migration',
    ].includes(integrationId)

    const isUpdate = useMemo(
        () => !!integrationId && isIntegrationId,
        [integrationId, isIntegrationId]
    )

    const redirectUri = useMemo(
        () => getRedirectUri(integrationType),
        [getRedirectUri, integrationType]
    )

    const integration = useMemo(() => {
        // clear cached integration
        if (
            (
                integrations.getIn(['integration', 'id'], '') as string
            ).toString() !== integrationId
        ) {
            return fromJS({}) as Map<any, any>
        }
        return integrations.get('integration', fromJS({})) as Map<any, any>
    }, [integrationId, integrations])

    const integrationsProp = useMemo(
        () =>
            (
                integrations.get('integrations', fromJS([])) as List<
                    Map<any, any>
                >
            ).sort((a: Map<any, any>, b: Map<any, any>) =>
                compare(
                    ((a.get('name') || '') as string).toLowerCase(),
                    ((b.get('name') || '') as string).toLowerCase()
                )
            ) as List<Map<any, any>>,
        [integrations]
    )

    const loading = useMemo(
        () =>
            integrations.getIn(['state', 'loading'], fromJS({})) as Map<
                any,
                any
            >,
        [integrations]
    )

    const editLinkDefaultTab = `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}/${Tab.Campaigns}`

    const goToDefaultTab = () => history.replace(editLinkDefaultTab)

    useEffect(() => {
        if (
            integrationType === IntegrationType.GorgiasChat &&
            !extra &&
            integrationId
        ) {
            goToDefaultTab()
        }
        actions.fetchIntegrations()
        void handleFetchPhoneNumbers()
        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (integrationId && isIntegrationId) {
            actions.fetchIntegration(integrationId, integrationType)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useUpdateEffect(() => {
        const appId = integration.getIn(['meta', 'app_id'])
        if (integrationType === IntegrationType.GorgiasChat) {
            if (appId) {
                void handleFetchGorgiasChatInstallationStatus(appId)
            } else {
                dispatch(resetChatInstallationStatus())
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [integration, integrationType])

    const dispatch = useAppDispatch()

    const [, handleFetchPhoneNumbers] = useAsyncFn(async () => {
        try {
            const numbers = await fetchPhoneNumbers()
            if (numbers) {
                dispatch(phoneNumbersFetched(numbers.data))
            }
            const newNumbers = await fetchNewPhoneNumbers()
            if (newNumbers) {
                dispatch(newPhoneNumbersFetched(newNumbers.data))
            }
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch phone numbers',
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    const [, handleFetchGorgiasChatInstallationStatus] = useAsyncFn(
        async (applicationId: string) => {
            try {
                const installationStatus =
                    await IntegrationsActions.getInstallationStatus(
                        applicationId
                    )

                if (installationStatus) {
                    dispatch(chatInstallationStatusFetched(installationStatus))
                }
            } catch (error) {
                reportError(
                    new Error(`Failed to fetch chat installation status`),
                    {
                        extra: {applicationId},
                    }
                )
            }
        }
    )

    useUpdateEffect(() => {
        if (integrationId && isIntegrationId) {
            actions.fetchIntegration(integrationId, integrationType)
        }
    }, [integrationId, isIntegrationId])

    const integrationProvider = integration.getIn(['meta', 'provider'])

    switch (integrationType) {
        case IntegrationType.Aircall:
            if (!!integrationId) {
                return <AircallIntegrationCreate />
            }
            return (
                <AircallIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.Facebook:
            if (!!integrationId) {
                if (integrationId === 'setup') {
                    return <FacebookIntegrationSetup loading={loading} />
                }

                if (extra === Tab.FacebookCustomerChat) {
                    return (
                        <FacebookIntegrationCustomerChat
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Preferences) {
                    return (
                        <FacebookIntegrationPreferences
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.FacebookAds) {
                    return (
                        <FacebookIntegrationInstagramAds
                            integrations={integrationsProp}
                            integration={integration}
                        />
                    )
                }

                return (
                    <FacebookIntegrationDetail
                        integration={integration.toJS()}
                        loading={loading}
                    />
                )
            }

            return (
                <FacebookIntegrationList
                    redirectUri={redirectUri}
                    loading={loading}
                />
            )

        case IntegrationType.Http:
            if (!!integrationId) {
                if (extra === Tab.HttpEvents) {
                    if (subId) {
                        return (
                            <HTTPIntegrationLayout
                                integration={integration}
                                isUpdate={isUpdate}
                            >
                                <HTTPIntegrationEvent
                                    integrationId={parseInt(integrationId)}
                                    eventId={parseInt(subId)}
                                />
                            </HTTPIntegrationLayout>
                        )
                    }

                    return (
                        <HTTPIntegrationLayout
                            integration={integration}
                            isUpdate={isUpdate}
                        >
                            <HTTPIntegrationEvents
                                integrationId={integrationId}
                            />
                        </HTTPIntegrationLayout>
                    )
                }

                return (
                    <HTTPIntegrationLayout
                        integration={integration}
                        isUpdate={isUpdate}
                    >
                        <HTTPIntegrationOverview
                            integration={integration}
                            isUpdate={isUpdate}
                            loading={loading}
                        />
                    </HTTPIntegrationLayout>
                )
            }

            return (
                <HTTPIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.GorgiasChat:
            if (!!integrationId) {
                if (extra === Tab.CreateWizard) {
                    return (
                        <GorgiasChatCreationWizard
                            isUpdate={isUpdate}
                            loading={loading}
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Installation) {
                    return (
                        <GorgiasChatIntegrationInstall
                            actions={actions}
                            integration={integration}
                            isUpdate={isUpdate}
                        />
                    )
                }

                if (extra === Tab.Preferences) {
                    return (
                        <GorgiasChatIntegrationPreferences
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.QuickReplies) {
                    return (
                        <GorgiasChatIntegrationQuickReplies
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Campaigns || !extra) {
                    if (subId) {
                        return (
                            <ChatCampaignDetailsFactory
                                integration={integration}
                                id={subId}
                            />
                        )
                    }

                    return (
                        <GorgiasChatIntegrationCampaigns
                            integration={integration}
                            currentUser={currentUser}
                        />
                    )
                }

                if (extra === Tab.Appearance) {
                    if (subId) {
                        return (
                            <GorgiasTranslateText integration={integration} />
                        )
                    }

                    return (
                        <GorgiasChatIntegrationAppearance
                            actions={actions}
                            integration={integration}
                            isUpdate={isUpdate}
                            loading={loading}
                            currentUser={currentUser}
                        />
                    )
                }
            }

            return (
                <GorgiasChatIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.Phone:
            return <VoiceIntegration />

        case IntegrationType.WhatsApp: {
            return <WhatsAppIntegration />
        }

        case IntegrationType.Sms: {
            return <SmsIntegration />
        }

        case IntegrationType.SmoochInside:
        case IntegrationType.Smooch:
            return (
                <SmoochDeprecatedIntegration
                    loading={loading.get('integrations', false)}
                />
            )

        case IntegrationType.Shopify:
            return (
                <Shopify
                    integration={integration}
                    integrations={
                        integrationsProp.filter(
                            (v) => v!.get('type') === IntegrationType.Shopify
                        ) as List<Map<any, any>>
                    }
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.BigCommerce:
            return (
                <BigCommerce
                    integration={integration}
                    integrations={
                        integrationsProp.filter(
                            (v) =>
                                v!.get('type') === IntegrationType.BigCommerce
                        ) as List<Map<any, any>>
                    }
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Twitter:
            if (!hasTwitterFeature) {
                // TODO: This should be replaced with a Paywall component when design available
                return (
                    <Container fluid>
                        <h3 className={classNames('text-center', 'mt-5')}>
                            Feature not available on your current plan.
                        </h3>
                    </Container>
                )
            }

            if (!!integrationId) {
                return (
                    <TwitterIntegrationDetail
                        actions={actions}
                        integration={integration}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <TwitterIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Klaviyo:
            if (!!integrationId) {
                return (
                    <KlaviyoIntegrationDetail
                        actions={actions}
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                    />
                )
            }
            return (
                <KlaviyoIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )
        case IntegrationType.Recharge:
            return (
                <Recharge
                    integration={integration}
                    integrations={
                        integrationsProp.filter(
                            (v) => v!.get('type') === IntegrationType.Recharge
                        ) as List<Map<any, any>>
                    }
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Smile:
            if (!!integrationId) {
                return (
                    <SmileIntegrationDetail
                        integration={integration}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <SmileIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Yotpo:
            if (!!integrationId) {
                return (
                    <YotpoIntegrationDetail
                        actions={actions}
                        integration={integration}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <YotpoIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Magento2:
            return (
                <Magento2
                    integration={integration}
                    integrations={
                        integrationsProp.filter(
                            (v) => v!.get('type') === IntegrationType.Magento2
                        ) as List<Map<any, any>>
                    }
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Email:
        default:
            if (!!integrationId) {
                if (integrationId === 'setup') {
                    return <OutlookIntegrationSetup loading={loading} />
                }

                if (integrationId === 'migration') {
                    return <EmailMigration />
                }

                if (isUpdate) {
                    if (extra === Tab.EmailForwarding) {
                        return (
                            <EmailIntegrationCreateForwarding
                                integration={integration}
                            />
                        )
                    }

                    if (extra === Tab.EmailVerification) {
                        return (
                            <EmailIntegrationCreateVerification
                                integration={integration}
                            />
                        )
                    }

                    if (extra === Tab.EmailDomainVerification) {
                        return (
                            <EmailIntegrationLayout integration={integration}>
                                <EmailDomainVerificationContainer
                                    integration={integration.toJS()}
                                    loading={loading.toJS()}
                                />
                            </EmailIntegrationLayout>
                        )
                    }

                    if (
                        extra === Tab.EmailOutboundVerification &&
                        integrationProvider === EmailProvider.Sendgrid
                    ) {
                        return (
                            <EmailIntegrationLayout integration={integration}>
                                <EmailOutboundVerification
                                    integration={integration.toJS()}
                                    loading={loading.toJS()}
                                />
                            </EmailIntegrationLayout>
                        )
                    }

                    return (
                        <EmailIntegrationLayout integration={integration}>
                            <EmailIntegrationUpdate
                                integration={integration}
                                loading={loading}
                            />
                        </EmailIntegrationLayout>
                    )
                }

                if (extra === Tab.EmailCustom) {
                    return <EmailIntegrationCreateCustom loading={loading} />
                }

                return <EmailIntegrationCreate />
            }

            return (
                <EmailIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    gmailRedirectUri={getRedirectUri(IntegrationType.Gmail)}
                    outlookRedirectUri={getRedirectUri(IntegrationType.Outlook)}
                />
            )
    }
}

const connector = connect(
    (state: RootState) => ({
        integrations: state.integrations,
        getEligibleShopifyIntegrationsFor:
            getEligibleShopifyIntegrationsFor(state),
        getRedirectUri: makeGetRedirectUri(state),
        currentUser: state.currentUser,
        hasTwitterFeature: makeHasFeature(state)(
            AccountFeature.TwitterIntegration
        ),
    }),
    (dispatch) => ({
        actions: bindActionCreators(IntegrationsActions, dispatch),
    })
)

export default connector(IntegrationDetail)
