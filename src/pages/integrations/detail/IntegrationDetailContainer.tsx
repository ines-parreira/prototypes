import React, {useEffect, useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List, Map} from 'immutable'
import {useUpdateEffect, useAsyncFn} from 'react-use'

import useSearch from 'hooks/useSearch'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import * as IntegrationsActions from 'state/integrations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {IntegrationType} from 'models/integration/types'
import {RootState} from 'state/types'
import {
    getEligibleShopifyIntegrationsFor,
    makeGetRedirectUri,
} from 'state/integrations/selectors'
import {fetchPhoneNumbers} from 'models/phoneNumber/resources'
import {phoneNumbersFetched} from 'state/entities/phoneNumbers/actions'
import {compare} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {SMS_INTEGRATION_PREVIEW_ACCOUNTS} from 'models/phoneNumber/constants'

import AircallIntegrationList from './components/aircall/AircallIntegrationList.js'
import AircallIntegrationCreate from './components/aircall/AircallIntegrationCreate.js'

import OutlookIntegrationSetup from './components/email/outlook/OutlookIntegrationSetup/OutlookIntegrationSetup'

import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList/FacebookIntegrationList.js'
import FacebookIntegrationPreferences from './components/facebook/FacebookIntegrationPreferences'
import FacebookIntegrationInstagramAds from './components/facebook/FacebookIntegrationAds/FacebookIntegrationInstagramAds'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup'
import FacebookIntegrationCustomerChat from './components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat'

import GorgiasChatIntegrationAppearance from './components/gorgias_chat/GorgiasChatIntegrationAppearance'
import GorgiasChatCampaignDetail from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatCampaignDetail'
import GorgiasChatIntegrationCampaigns from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns'
import GorgiasChatIntegrationList from './components/gorgias_chat/GorgiasChatIntegrationList'
import GorgiasChatIntegrationInstall from './components/gorgias_chat/GorgiasChatIntegrationInstall'
import GorgiasChatIntegrationPreferences from './components/gorgias_chat/GorgiasChatIntegrationPreferences'
import GorgiasChatIntegrationQuickReplies from './components/gorgias_chat/GorgiasChatIntegrationQuickReplies'
import GorgiasChatIntegrationSelfService from './components/gorgias_chat/GorgiasChatIntegrationSelfService'

import HTTPIntegrationList from './components/http/HTTPIntegrationList'

import Magento2IntegrationDetail from './components/magento2/Magento2IntegrationDetail'
import Magento2IntegrationList from './components/magento2/Magento2IntegrationList'

import SmoochIntegrationDetail from './components/smooch/SmoochIntegrationDetail'
import SmoochIntegrationList from './components/smooch/SmoochIntegrationList'
import SmoochIntegrationPreferences from './components/smooch/SmoochIntegrationPreferences'

import ShopifyIntegrationList from './components/shopify/ShopifyIntegrationList'
import ShopifyIntegrationDetail from './components/shopify/ShopifyIntegrationDetail'

import KlaviyoIntegrationList from './components/klaviyo/KlaviyoIntegrationList'
import KlaviyoIntegrationDetail from './components/klaviyo/KlaviyoIntegrationDetail'

import RechargeIntegrationList from './components/recharge/RechargeIntegrationList'
import RechargeIntegrationDetail from './components/recharge/RechargeIntegrationDetail'

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
import EmailDomainVerification from './components/email/EmailDomainVerification/EmailDomainVerification'

import ChatIntegrationList from './components/chat/ChatIntegrationList'
import ChatIntegrationAppearance from './components/chat/ChatIntegrationAppearance/ChatIntegrationAppearance'
import ChatIntegrationCampaigns from './components/chat/ChatIntegrationCampaigns/ChatIntegrationCampaigns'
import ChatIntegrationQuickReplies from './components/chat/ChatIntegrationQuickReplies/ChatIntegrationQuickReplies'
import ChatIntegrationMigration from './components/chat/ChatIntegrationMigration/ChatIntegrationMigration'
import ChatIntegrationPreferences from './components/chat/ChatIntegrationPreferences/ChatIntegrationPreferences'
import ChatIntegrationInstall from './components/chat/ChatIntegrationInstall/ChatIntegrationInstall'
import CampaignDetail from './components/chat/ChatIntegrationCampaigns/CampaignDetail.js'

import HTTPIntegrationOverview from './components/http/HTTPIntegrationOverview/HTTPIntegrationOverview'
import HTTPIntegrationEvents from './components/http/HTTPIntegrationEvents/HTTPIntegrationEvents'
import HTTPIntegrationEvent from './components/http/HTTPIntegrationEvent/HTTPIntegrationEvent'
import HTTPIntegrationLayout from './components/http/HTTPIntegrationLayout/HTTPIntegrationLayout'

import PhoneIntegrationsListContainer from './components/phone/PhoneIntegrationsListContainer'
import PhoneIntegrationCreate from './components/phone/PhoneIntegrationCreate'
import VoiceAppPreferences from './components/phone/VoiceAppPreferences'
import PhoneIntegrationVoicemail from './components/phone/PhoneIntegrationVoicemail'
import PhoneIntegrationGreetingMessage from './components/phone/PhoneIntegrationGreetingMessage'
import PhoneIntegrationIvr from './components/phone/PhoneIntegrationIvr'

import SmsIntegrationsListContainer from './components/sms/SmsIntegrationsListContainer'
import SmsIntegrationCreate from './components/sms/SmsIntegrationCreate'
import SmsAppPreferences from './components/sms/SmsAppPreferences'

import TwitterIntegrationDetail from './components/twitter/TwitterIntegrationDetail'
import TwitterIntegrationList from './components/twitter/TwitterIntegrationList'

export enum Tab {
    EmailForwarding = 'forwarding',
    EmailVerification = 'verification',
    EmailDomainVerification = 'dns',
    EmailCustom = 'custom',
    FacebookCustomerChat = 'customer_chat',
    Preferences = 'preferences',
    FacebookAds = 'ads',
    HttpEvents = 'events',
    Installation = 'installation',
    QuickReplies = 'quick_replies',
    ChatSelfService = 'self_service',
    Campaigns = 'campaigns',
    PhoneVoicemail = 'voicemail',
    PhoneGreetingMessage = 'greeting-message',
    PhoneIvr = 'ivr',
    SmoochInsideMigration = 'migration',
}

export const IntegrationDetailContainer = ({
    actions,
    currentUser,
    getEligibleShopifyIntegrationsFor,
    getRedirectUri,
    currentAccount,
    integrations,
}: ConnectedProps<typeof connector>) => {
    const {extra, integrationId, integrationType, subId} = useParams<{
        extra: string
        integrationId: string
        integrationType: IntegrationType
        subId: string
    }>()

    const {phoneNumberId} = useSearch<{
        phoneNumberId: string
    }>()

    const isUpdate = useMemo(
        () => !!integrationId && integrationId !== 'new',
        [integrationId]
    )

    const redirectUri = useMemo(
        () => getRedirectUri(integrationType),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [integrationType]
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

    useEffect(() => {
        actions.fetchIntegrations()
        void handleFetchPhoneNumbers()
        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (integrationId && !['new', 'setup'].includes(integrationId)) {
            actions.fetchIntegration(integrationId, integrationType)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const dispatch = useAppDispatch()
    const [, handleFetchPhoneNumbers] = useAsyncFn(async () => {
        try {
            const res = await fetchPhoneNumbers()
            if (!res) {
                return
            }
            dispatch(phoneNumbersFetched(res.data))
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch phone numbers',
                    status: NotificationStatus.Error,
                })
            )
        }
    })

    useUpdateEffect(() => {
        if (integrationId && !['new', 'setup'].includes(integrationId)) {
            actions.fetchIntegration(integrationId, integrationType)
        }
    }, [integrationId])

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

        case IntegrationType.Email:
            if (!!integrationId) {
                if (integrationId === 'setup') {
                    return <OutlookIntegrationSetup loading={loading} />
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
                                <EmailDomainVerification
                                    actions={actions}
                                    integration={integration}
                                    loading={loading}
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
                        integration={integration}
                        loading={loading}
                    />
                )
            }

            return (
                <FacebookIntegrationList
                    actions={actions}
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
                if (extra === Tab.Installation) {
                    return (
                        <GorgiasChatIntegrationInstall
                            actions={actions}
                            integration={integration}
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

                if (extra === Tab.ChatSelfService) {
                    return (
                        <GorgiasChatIntegrationSelfService
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Campaigns) {
                    if (subId) {
                        return (
                            <GorgiasChatCampaignDetail
                                integration={integration}
                                id={subId}
                            />
                        )
                    }

                    return (
                        <GorgiasChatIntegrationCampaigns
                            integration={integration}
                        />
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

            return (
                <GorgiasChatIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.Phone:
            if (!!integrationId) {
                if (!isUpdate) {
                    return (
                        <PhoneIntegrationCreate
                            selectedPhoneNumberId={parseInt(phoneNumberId)}
                        />
                    )
                }

                if (extra === Tab.Preferences) {
                    return (
                        <VoiceAppPreferences integration={integration.toJS()} />
                    )
                }

                if (extra === Tab.PhoneVoicemail) {
                    return (
                        <PhoneIntegrationVoicemail
                            integration={integration.toJS()}
                        />
                    )
                }

                if (extra === Tab.PhoneGreetingMessage) {
                    return (
                        <PhoneIntegrationGreetingMessage
                            integration={integration.toJS()}
                        />
                    )
                }

                if (extra === Tab.PhoneIvr) {
                    return (
                        <PhoneIntegrationIvr integration={integration.toJS()} />
                    )
                }
            }

            return <PhoneIntegrationsListContainer />

        case IntegrationType.Sms: {
            if (
                !SMS_INTEGRATION_PREVIEW_ACCOUNTS.includes(
                    currentAccount.get('domain')
                )
            ) {
                return null
            }

            if (!!integrationId) {
                if (extra === Tab.Preferences) {
                    return (
                        <SmsAppPreferences integration={integration.toJS()} />
                    )
                }

                return (
                    <SmsIntegrationCreate
                        selectedPhoneNumberId={parseInt(phoneNumberId)}
                    />
                )
            }

            return <SmsIntegrationsListContainer />
        }

        case IntegrationType.SmoochInside:
            if (!!integrationId) {
                if (extra === Tab.SmoochInsideMigration) {
                    return (
                        <ChatIntegrationMigration integration={integration} />
                    )
                }

                if (extra === Tab.Installation) {
                    return <ChatIntegrationInstall integration={integration} />
                }

                if (extra === Tab.Preferences) {
                    return (
                        <ChatIntegrationPreferences integration={integration} />
                    )
                }

                if (extra === Tab.Campaigns) {
                    if (subId) {
                        return (
                            <CampaignDetail
                                integration={integration}
                                id={subId}
                            />
                        )
                    }

                    return (
                        <ChatIntegrationCampaigns integration={integration} />
                    )
                }

                if (extra === Tab.QuickReplies) {
                    return (
                        <ChatIntegrationQuickReplies
                            integration={integration}
                        />
                    )
                }

                return (
                    <ChatIntegrationAppearance
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                        currentUser={currentUser}
                    />
                )
            }

            return (
                <ChatIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.Smooch:
            if (!!integrationId) {
                if (extra === Tab.Preferences) {
                    return (
                        <SmoochIntegrationPreferences
                            integration={integration}
                        />
                    )
                }

                return (
                    <SmoochIntegrationDetail
                        integration={integration}
                        loading={loading}
                    />
                )
            }

            return (
                <SmoochIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Shopify:
            if (!!integrationId) {
                return (
                    <ShopifyIntegrationDetail
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <ShopifyIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Twitter:
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
            if (!!integrationId) {
                return (
                    <RechargeIntegrationDetail
                        integration={integration}
                        shopifyIntegrations={getEligibleShopifyIntegrationsFor(
                            IntegrationType.Recharge
                        )}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <RechargeIntegrationList
                    integrations={integrationsProp}
                    shopifyIntegrations={getEligibleShopifyIntegrationsFor(
                        IntegrationType.Recharge
                    )}
                    loading={loading}
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
            if (!!integrationId) {
                return (
                    <Magento2IntegrationDetail
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <Magento2IntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        default:
            return null
    }
}

const connector = connect(
    (state: RootState) => ({
        integrations: state.integrations,
        getEligibleShopifyIntegrationsFor:
            getEligibleShopifyIntegrationsFor(state),
        getRedirectUri: makeGetRedirectUri(state),
        currentAccount: getCurrentAccountState(state),
        currentUser: state.currentUser,
    }),
    (dispatch) => ({
        actions: bindActionCreators(IntegrationsActions, dispatch),
    })
)

export default connector(IntegrationDetailContainer)
