import React, {useEffect, useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS, List, Map} from 'immutable'
import {useUpdateEffect} from 'react-use'

import * as IntegrationsActions from '../../../state/integrations/actions'
import {IntegrationType} from '../../../models/integration/types'
import {RootState} from '../../../state/types'
import {
    getEligibleShopifyIntegrationsFor,
    makeGetRedirectUri,
} from '../../../state/integrations/selectors'
import {compare} from '../../../utils'

import AircallIntegrationList from './components/aircall/AircallIntegrationList.js'
import AircallIntegrationCreate from './components/aircall/AircallIntegrationCreate.js'

import OutlookIntegrationSetup from './components/email/outlook/OutlookIntegrationSetup/OutlookIntegrationSetup.js'

import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail.js'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList/FacebookIntegrationList.js'
import FacebookIntegrationPreferences from './components/facebook/FacebookIntegrationPreferences.js'
import FacebookIntegrationInstagramAds from './components/facebook/FacebookIntegrationAds/FacebookIntegrationInstagramAds.js'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup.js'
import FacebookIntegrationCustomerChat from './components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat.js'

import GorgiasChatIntegrationAppearance from './components/gorgias_chat/GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance.js'
import GorgiasChatCampaignDetail from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatCampaignDetail.js'
import GorgiasChatIntegrationCampaigns from './components/gorgias_chat/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns.js'
import GorgiasChatIntegrationInstall from './components/gorgias_chat/GorgiasChatIntegrationInstall.js'
import GorgiasChatIntegrationList from './components/gorgias_chat/GorgiasChatIntegrationList.js'
import GorgiasChatIntegrationPreferences from './components/gorgias_chat/GorgiasChatIntegrationPreferences.js'
import GorgiasChatIntegrationQuickReplies from './components/gorgias_chat/GorgiasChatIntegrationQuickReplies.js'
import GorgiasChatIntegrationSelfService from './components/gorgias_chat/GorgiasChatIntegrationSelfService'

import HTTPIntegrationList from './components/http/HTTPIntegrationList.js'

import Magento2IntegrationDetail from './components/magento2/Magento2IntegrationDetail.js'
import Magento2IntegrationList from './components/magento2/Magento2IntegrationList.js'

import SmoochIntegrationDetail from './components/smooch/SmoochIntegrationDetail.js'
import SmoochIntegrationList from './components/smooch/SmoochIntegrationList.js'
import SmoochIntegrationPreferences from './components/smooch/SmoochIntegrationPreferences.js'

import ShopifyIntegrationList from './components/shopify/ShopifyIntegrationList.js'
import ShopifyIntegrationDetail from './components/shopify/ShopifyIntegrationDetail.js'

import KlaviyoIntegrationList from './components/klaviyo/KlaviyoIntegrationList'
import KlaviyoIntegrationDetail from './components/klaviyo/KlaviyoIntegrationDetail'

import RechargeIntegrationList from './components/recharge/RechargeIntegrationList.js'
import RechargeIntegrationDetail from './components/recharge/RechargeIntegrationDetail.js'

import SmileIntegrationList from './components/smile/SmileIntegrationList.js'
import SmileIntegrationDetail from './components/smile/SmileIntegrationDetail.js'

import YotpoIntegrationList from './components/yotpo/YotpoIntegrationList'
import YotpoIntegrationDetail from './components/yotpo/YotpoIntegrationDetail'

import EmailIntegrationList from './components/email/EmailIntegrationList.js'
import EmailIntegrationUpdate from './components/email/EmailIntegrationUpdate/EmailIntegrationUpdate.js'
import EmailIntegrationCreate from './components/email/EmailIntegrationCreate/EmailIntegrationCreate.js'
import EmailIntegrationCreateForwarding from './components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding.js'
import EmailIntegrationCreateVerification from './components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification.js'
import EmailIntegrationCreateCustom from './components/email/EmailIntegrationCreateCustom/EmailIntegrationCreateCustom.js'

import ChatIntegrationList from './components/chat/ChatIntegrationList.js'
import ChatIntegrationAppearance from './components/chat/ChatIntegrationAppearance/ChatIntegrationAppearance.js'
import ChatIntegrationCampaigns from './components/chat/ChatIntegrationCampaigns/ChatIntegrationCampaigns.js'
import ChatIntegrationQuickReplies from './components/chat/ChatIntegrationQuickReplies/ChatIntegrationQuickReplies.js'
import ChatIntegrationMigration from './components/chat/ChatIntegrationMigration/ChatIntegrationMigration.js'
import ChatIntegrationPreferences from './components/chat/ChatIntegrationPreferences/ChatIntegrationPreferences.js'
import ChatIntegrationInstall from './components/chat/ChatIntegrationInstall/ChatIntegrationInstall.js'
import CampaignDetail from './components/chat/ChatIntegrationCampaigns/CampaignDetail.js'

import HTTPIntegrationOverview from './components/http/HTTPIntegrationOverview/HTTPIntegrationOverview.js'
import HTTPIntegrationEvents from './components/http/HTTPIntegrationEvents/HTTPIntegrationEvents.js'
import HTTPIntegrationEvent from './components/http/HTTPIntegrationEvent/HTTPIntegrationEvent.js'
import HTTPIntegrationLayout from './components/http/HTTPIntegrationLayout/HTTPIntegrationLayout.js'

import PhoneIntegrationList from './components/phone/PhoneIntegrationList'
import PhoneIntegrationCreate from './components/phone/PhoneIntegrationCreate'
import PhoneIntegrationPreferences from './components/phone/PhoneIntegrationPreferences'
import PhoneIntegrationVoicemail from './components/phone/PhoneIntegrationVoicemail'

export enum Tab {
    EmailForwarding = 'forwarding',
    EmailVerification = 'verification',
    EmailCustom = 'custom',
    FacebookCustomerChat = 'customer_chat',
    Preferences = 'preferences',
    FacebookAds = 'ads',
    HttpEvents = 'events',
    Installation = 'installation',
    QuickReplies = 'quick_replies',
    ChatSelfService = 'self_service',
    Campaigns = 'campaigns',
    PhoceVoicemail = 'voicemail',
    SmoochInsideMigration = 'migration',
}

export const IntegrationDetailContainer = ({
    actions,
    currentUser,
    getEligibleShopifyIntegrationsFor,
    getRedirectUri,
    integrations,
}: ConnectedProps<typeof connector>) => {
    const {extra, integrationId, integrationType, subId} = useParams<{
        extra: string
        integrationId: string
        integrationType: IntegrationType
        subId: string
    }>()

    const isUpdate = useMemo(() => !!integrationId && integrationId !== 'new', [
        integrationId,
    ])

    const redirectUri = useMemo(() => getRedirectUri(integrationType), [
        integrationType,
    ])

    const integration = useMemo(() => {
        // clear cached integration
        if (
            (integrations.getIn(
                ['integration', 'id'],
                ''
            ) as string).toString() !== integrationId
        ) {
            return fromJS({}) as Map<any, any>
        }
        return integrations.get('integration', fromJS({})) as Map<any, any>
    }, [integrationId, integrations])

    const integrationsProp = useMemo(
        () =>
            (integrations.get('integrations', fromJS([])) as List<
                Map<any, any>
            >).sort((a: Map<any, any>, b: Map<any, any>) =>
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

        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (integrationId && !['new', 'setup'].includes(integrationId)) {
            actions.fetchIntegration(integrationId, integrationType)
        }
    }, [])

    useUpdateEffect(() => {
        if (integrationId && !['new', 'setup'].includes(integrationId)) {
            actions.fetchIntegration(integrationId, integrationType)
        }
    }, [integrationId])

    switch (integrationType) {
        case IntegrationType.AircallIntegrationType:
            if (!!integrationId) {
                return <AircallIntegrationCreate />
            }
            return (
                <AircallIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.EmailIntegrationType:
            if (!!integrationId) {
                if (integrationId === 'setup') {
                    return (
                        <OutlookIntegrationSetup
                            actions={actions}
                            loading={loading}
                        />
                    )
                }

                if (isUpdate) {
                    if (extra === Tab.EmailForwarding) {
                        return (
                            <EmailIntegrationCreateForwarding
                                actions={actions}
                                integration={integration}
                            />
                        )
                    }

                    if (extra === Tab.EmailVerification) {
                        return (
                            <EmailIntegrationCreateVerification
                                actions={actions}
                                integration={integration}
                            />
                        )
                    }

                    return (
                        <EmailIntegrationUpdate
                            actions={actions}
                            integration={integration}
                            loading={loading}
                        />
                    )
                }

                if (extra === Tab.EmailCustom) {
                    return (
                        <EmailIntegrationCreateCustom
                            actions={actions}
                            loading={loading}
                        />
                    )
                }

                return (
                    <EmailIntegrationCreate
                        actions={actions}
                        loading={loading}
                    />
                )
            }

            return (
                <EmailIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                    gmailRedirectUri={getRedirectUri(
                        IntegrationType.GmailIntegrationType
                    )}
                    outlookRedirectUri={getRedirectUri(
                        IntegrationType.OutlookIntegrationType
                    )}
                />
            )

        case IntegrationType.FacebookIntegrationType:
            if (!!integrationId) {
                if (integrationId === 'setup') {
                    return (
                        <FacebookIntegrationSetup
                            actions={actions}
                            loading={loading}
                        />
                    )
                }

                if (extra === Tab.FacebookCustomerChat) {
                    return (
                        <FacebookIntegrationCustomerChat
                            actions={actions}
                            loading={loading}
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Preferences) {
                    return (
                        <FacebookIntegrationPreferences
                            actions={actions}
                            loading={loading}
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
                        actions={actions}
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

        case IntegrationType.HttpIntegrationType:
            if (!!integrationId) {
                if (extra === Tab.HttpEvents) {
                    if (subId) {
                        return (
                            <HTTPIntegrationLayout
                                integration={integration}
                                isUpdate={isUpdate}
                                urlParams={{
                                    extra,
                                    integrationId,
                                    integrationType,
                                    subId,
                                }}
                            >
                                <HTTPIntegrationEvent
                                    integrationId={integrationId}
                                    eventId={subId}
                                />
                            </HTTPIntegrationLayout>
                        )
                    }

                    return (
                        <HTTPIntegrationLayout
                            integration={integration}
                            isUpdate={isUpdate}
                            urlParams={{
                                extra,
                                integrationId,
                                integrationType,
                                subId,
                            }}
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
                        urlParams={{
                            extra,
                            integrationId,
                            integrationType,
                            subId,
                        }}
                    >
                        <HTTPIntegrationOverview
                            actions={actions}
                            integration={integration}
                            isUpdate={isUpdate}
                            loading={loading}
                        />
                    </HTTPIntegrationLayout>
                )
            }

            return (
                <HTTPIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.GorgiasChatIntegrationType:
            if (!!integrationId) {
                if (extra === Tab.Installation) {
                    return (
                        <GorgiasChatIntegrationInstall
                            actions={actions}
                            loading={loading}
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Preferences) {
                    return (
                        <GorgiasChatIntegrationPreferences
                            actions={actions}
                            loading={loading}
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

        case IntegrationType.PhoneIntegrationType:
            if (!!integrationId) {
                if (!isUpdate) {
                    return <PhoneIntegrationCreate actions={actions} />
                }

                if (extra === Tab.Preferences) {
                    return (
                        <PhoneIntegrationPreferences
                            actions={actions}
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.PhoceVoicemail) {
                    return (
                        <PhoneIntegrationVoicemail integration={integration} />
                    )
                }
            }

            return (
                <PhoneIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.SmoochInsideIntegrationType:
            if (!!integrationId) {
                if (extra === Tab.SmoochInsideMigration) {
                    return (
                        <ChatIntegrationMigration
                            actions={actions}
                            loading={loading}
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Installation) {
                    return (
                        <ChatIntegrationInstall
                            actions={actions}
                            loading={loading}
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Preferences) {
                    return (
                        <ChatIntegrationPreferences
                            actions={actions}
                            loading={loading}
                            integration={integration}
                        />
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
                        actions={actions}
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                        currentUser={currentUser}
                    />
                )
            }

            return (
                <ChatIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        case IntegrationType.SmoochIntegrationType:
            if (!!integrationId) {
                if (extra === Tab.Preferences) {
                    return (
                        <SmoochIntegrationPreferences
                            actions={actions}
                            loading={loading}
                            integration={integration}
                        />
                    )
                }

                return (
                    <SmoochIntegrationDetail
                        integration={integration}
                        actions={actions}
                        loading={loading}
                    />
                )
            }

            return (
                <SmoochIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.ShopifyIntegrationType:
            if (!!integrationId) {
                return (
                    <ShopifyIntegrationDetail
                        actions={actions}
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <ShopifyIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )
        case IntegrationType.KlaviyoIntegrationType:
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
        case IntegrationType.RechargeIntegrationType:
            if (!!integrationId) {
                return (
                    <RechargeIntegrationDetail
                        actions={actions}
                        integration={integration}
                        shopifyIntegrations={getEligibleShopifyIntegrationsFor(
                            IntegrationType.RechargeIntegrationType
                        )}
                        isUpdate={isUpdate}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <RechargeIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    shopifyIntegrations={getEligibleShopifyIntegrationsFor(
                        IntegrationType.RechargeIntegrationType
                    )}
                    loading={loading}
                />
            )

        case IntegrationType.SmileIntegrationType:
            if (!!integrationId) {
                return (
                    <SmileIntegrationDetail
                        actions={actions}
                        integration={integration}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <SmileIntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.YotpoIntegrationType:
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

        case IntegrationType.Magento2IntegrationType:
            if (!!integrationId) {
                return (
                    <Magento2IntegrationDetail
                        actions={actions}
                        integration={integration}
                        isUpdate={isUpdate}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            }

            return (
                <Magento2IntegrationList
                    actions={actions}
                    integrations={integrationsProp}
                    loading={loading}
                />
            )

        default:
            return null
    }
}

const connector = connect(
    (state: RootState) => ({
        integrations: state.integrations,
        getEligibleShopifyIntegrationsFor: getEligibleShopifyIntegrationsFor(
            state
        ),
        getRedirectUri: makeGetRedirectUri(state),
        currentUser: state.currentUser,
    }),
    (dispatch) => ({
        actions: bindActionCreators(IntegrationsActions, dispatch),
    })
)

export default connector(IntegrationDetailContainer)
