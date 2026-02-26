import { useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn, useEffectOnce, useUpdateEffect } from '@repo/hooks'
import { history } from '@repo/routing'
import classNames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Container } from 'reactstrap'
import { bindActionCreators } from 'redux'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import { EmailProvider } from 'models/integration/constants'
import { IntegrationType } from 'models/integration/types'
import {
    fetchNewPhoneNumbers,
    fetchPhoneNumbers,
} from 'models/phoneNumber/resources'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding/hooks/useOnboardingIntegrationRedirection'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { ErrorBoundary } from 'pages/ErrorBoundary'
import { makeHasFeature } from 'state/billing/selectors'
import { AccountFeature } from 'state/currentAccount/types'
import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from 'state/entities/chatInstallationStatus/actions'
import {
    newPhoneNumbersFetched,
    phoneNumbersFetched,
} from 'state/entities/phoneNumbers/actions'
import * as IntegrationsActions from 'state/integrations/actions'
import {
    getEligibleShopifyIntegrationsFor,
    makeGetRedirectUri,
} from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState } from 'state/types'
import { compare } from 'utils'
import { reportError } from 'utils/errors'

import AircallIntegrationCreate from './components/aircall/AircallIntegrationCreate'
import AircallIntegrationList from './components/aircall/AircallIntegrationList'
import BigCommerce from './components/bigcommerce/BigCommerce'
import EmailIntegrationOnboarding from './components/email/CustomerOnboarding/EmailIntegrationOnboarding'
import DEPRECATED_EmailDomainVerificationContainer from './components/email/EmailDomainVerification/DEPRECATED_EmailDomainVerificationContainer'
import EmailDomainVerification from './components/email/EmailDomainVerification/EmailDomainVerification'
import EmailIntegrationCreate from './components/email/EmailIntegrationCreate/EmailIntegrationCreate'
// oxlint-disable-next-line no-named-as-default
import EmailIntegrationCreateForwarding from './components/email/EmailIntegrationCreateForwarding/EmailIntegrationCreateForwarding'
// oxlint-disable-next-line no-named-as-default
import EmailIntegrationCreateVerification from './components/email/EmailIntegrationCreateVerification/EmailIntegrationCreateVerification'
import EmailIntegrationList from './components/email/EmailIntegrationList'
import EmailIntegrationUpdate from './components/email/EmailIntegrationUpdate/EmailIntegrationUpdate'
import EmailIntegrationLayout from './components/email/EmailIntegrationUpdateLayout/EmailIntegrationUpdateLayout'
import EmailMigration from './components/email/EmailMigration/EmailMigration'
import EmailOutboundVerification from './components/email/EmailOutboundVerification/EmailOutboundVerification'
import FacebookIntegrationCustomerChat from './components/facebook/FacebookIntegrationCustomerChat/FacebookIntegrationCustomerChat'
// oxlint-disable-next-line no-named-as-default
import FacebookIntegrationDetail from './components/facebook/FacebookIntegrationDetail'
import FacebookIntegrationList from './components/facebook/FacebookIntegrationList/FacebookIntegrationList'
// oxlint-disable-next-line no-named-as-default
import FacebookIntegrationPreferences from './components/facebook/FacebookIntegrationPreferences'
import FacebookIntegrationSetup from './components/facebook/FacebookIntegrationSetup/FacebookIntegrationSetup'
import { GorgiasAutomateChatIntegration } from './components/gorgias_chat/legacy/GorgiasAutomateChatIntegration'
import GorgiasChatCreationWizard from './components/gorgias_chat/legacy/GorgiasChatCreationWizard'
import GorgiasChatIntegrationAppearance from './components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance'
import GorgiasTranslateText from './components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import GorgiasChatIntegrationCampaigns from './components/gorgias_chat/legacy/GorgiasChatIntegrationCampaigns/GorgiasChatIntegrationCampaigns'
import GorgiasChatIntegrationInstall from './components/gorgias_chat/legacy/GorgiasChatIntegrationInstall'
import GorgiasChatIntegrationLanguages from './components/gorgias_chat/legacy/GorgiasChatIntegrationLanguages'
import GorgiasChatIntegrationList from './components/gorgias_chat/legacy/GorgiasChatIntegrationList/GorgiasChatIntegrationList'
import GorgiasChatIntegrationPreferences from './components/gorgias_chat/legacy/GorgiasChatIntegrationPreferences'
import GorgiasChatIntegrationQuickReplies from './components/gorgias_chat/legacy/GorgiasChatIntegrationQuickReplies'
import useIsQuickRepliesEnabled from './components/gorgias_chat/legacy/GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled'
import useSelfServiceConfiguration from './components/gorgias_chat/legacy/hooks/useSelfServiceConfiguration'
import HTTP from './components/http/HTTP'
import KlaviyoIntegrationDetail from './components/klaviyo/KlaviyoIntegrationDetail'
import KlaviyoIntegrationList from './components/klaviyo/KlaviyoIntegrationList'
import Magento2 from './components/magento2/Magento2'
import Recharge from './components/recharge/Recharge'
import Shopify from './components/shopify/Shopify'
import SmileIntegrationDetail from './components/smile/SmileIntegrationDetail'
import SmileIntegrationList from './components/smile/SmileIntegrationList'
import SmsIntegration from './components/sms/SmsIntegration'
import TwitterIntegrationDetail from './components/twitter/TwitterIntegrationDetail'
// oxlint-disable-next-line no-named-as-default
import TwitterIntegrationList from './components/twitter/TwitterIntegrationList'
import VoiceIntegration from './components/voice/VoiceIntegration'
import WhatsAppIntegration from './components/whatsapp/WhatsAppIntegration'
import YotpoIntegrationDetail from './components/yotpo/YotpoIntegrationDetail'
import YotpoIntegrationList from './components/yotpo/YotpoIntegrationList'
import { Tab } from './types'

export const IntegrationDetail = ({
    actions,
    currentUser,
    getRedirectUri,
    hasTwitterFeature,
    integrations,
}: ConnectedProps<typeof connector>) => {
    const { extra, integrationId, integrationType, subId } = useParams<{
        extra: string
        integrationId: string
        integrationType: IntegrationType
        subId: string
    }>()

    const isQuickRepliesEnabled = useIsQuickRepliesEnabled()
    const isNewDomainVerificationEnabled = useFlag(
        FeatureFlagKey.NewDomainVerification,
    )

    const [articleRecommendationEnabled, setArticleRecommendationEnabled] =
        useState(false)
    const { hasAccess } = useAiAgentAccess()

    const isIntegrationId = ![
        'new',
        'connections',
        'integrations',
        'onboard',
        'setup',
        'about',
        'migration',
        'queues',
    ].includes(integrationId)

    const { redirectToOnboardingIfOnboarding } =
        useOnboardingIntegrationRedirection(false)

    const isUpdate = useMemo(
        () => !!integrationId && isIntegrationId,
        [integrationId, isIntegrationId],
    )

    const redirectUri = useMemo(
        () => getRedirectUri(integrationType),
        [getRedirectUri, integrationType],
    )

    useEffectOnce(() => {
        // Redirect to onboarding if the user is onboarding.
        // It's necessary to be in the use effect otherwise it shows an error
        // because the component is not mounted.
        if (isIntegrationId) {
            redirectToOnboardingIfOnboarding(integrationType, integrationId)
        }
    })

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
                    ((b.get('name') || '') as string).toLowerCase(),
                ),
            ) as List<Map<any, any>>,
        [integrations],
    )

    const loading = useMemo(
        () =>
            integrations.getIn(['state', 'loading'], fromJS({})) as Map<
                any,
                any
            >,
        [integrations],
    )

    const editLinkDefaultTab = useMemo(() => {
        return `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}/${Tab.Appearance}`
    }, [integrationId])

    const goToDefaultTab = () => history.replace(editLinkDefaultTab)
    if (
        integrationType === IntegrationType.GorgiasChat &&
        !extra &&
        integrationId
    ) {
        goToDefaultTab()
    }

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
        } catch {
            void dispatch(
                notify({
                    message: 'Failed to fetch phone numbers',
                    status: NotificationStatus.Error,
                }),
            )
        }
    })

    useEffect(() => {
        actions.fetchIntegrations()
        void handleFetchPhoneNumbers()
        // We need this to allow the user to refresh the settings page.
        // If we don't fetch it, the state is empty on refresh.
        if (integrationId && isIntegrationId) {
            actions.fetchIntegration(integrationId, integrationType)
        }
    }, [
        actions,
        integrationId,
        integrationType,
        isIntegrationId,
        handleFetchPhoneNumbers,
    ])

    const chatApplicationIds = useMemo(() => {
        const appId: string = integration.getIn(['meta', 'app_id'])
        if (appId && integrationType === IntegrationType.GorgiasChat) {
            return [appId]
        }
        return []
    }, [integration, integrationType])

    const { applicationsAutomationSettings } =
        useApplicationsAutomationSettings(chatApplicationIds)

    useUpdateEffect(() => {
        const appId = integration.getIn(['meta', 'app_id'])
        if (integrationType === IntegrationType.GorgiasChat) {
            if (appId) {
                void handleFetchGorgiasChatInstallationStatus(appId)
            } else {
                dispatch(resetChatInstallationStatus())
            }
        }
    }, [integration, integrationType])

    const { selfServiceConfiguration, selfServiceConfigurationEnabled } =
        useSelfServiceConfiguration(integration)

    const dispatch = useAppDispatch()

    const [, handleFetchGorgiasChatInstallationStatus] = useAsyncFn(
        async (applicationId: string) => {
            try {
                const installationStatus =
                    await IntegrationsActions.getInstallationStatus(
                        applicationId,
                    )

                if (installationStatus) {
                    dispatch(chatInstallationStatusFetched(installationStatus))
                }
            } catch {
                reportError(
                    new Error(`Failed to fetch chat installation status`),
                    {
                        extra: { applicationId },
                    },
                )
            }
        },
    )

    useEffect(() => {
        const appId = chatApplicationIds[0]
        if (appId) {
            setArticleRecommendationEnabled(
                applicationsAutomationSettings[appId]?.articleRecommendation
                    ?.enabled && hasAccess,
            )
        }
    }, [hasAccess, chatApplicationIds, applicationsAutomationSettings])

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
            return <HTTP />

        case IntegrationType.GorgiasChat:
            if (!!integrationId) {
                if (extra === Tab.CreateWizard) {
                    return (
                        <ErrorBoundary
                            sentryTags={{
                                section: 'chat-wizard',
                                team: SentryTeam.ACTIONS_AND_CHANNELS,
                            }}
                        >
                            <GorgiasChatCreationWizard
                                isUpdate={isUpdate}
                                loading={loading}
                                integration={integration}
                            />
                        </ErrorBoundary>
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
                            currentUser={currentUser}
                            integration={integration}
                            articleRecommendationEnabled={
                                articleRecommendationEnabled
                            }
                            actions={actions}
                            selfServiceConfiguration={selfServiceConfiguration}
                            selfServiceConfigurationEnabled={
                                selfServiceConfigurationEnabled
                            }
                        />
                    )
                }

                if (extra === Tab.QuickReplies && isQuickRepliesEnabled) {
                    return (
                        <GorgiasChatIntegrationQuickReplies
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Campaigns) {
                    return (
                        <GorgiasChatIntegrationCampaigns
                            integration={integration}
                        />
                    )
                }

                if (extra === Tab.Appearance || !extra) {
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

                if (extra === Tab.Languages) {
                    if (subId) {
                        return (
                            <GorgiasTranslateText integration={integration} />
                        )
                    }

                    return (
                        <GorgiasChatIntegrationLanguages
                            integration={integration}
                            loading={loading}
                        />
                    )
                }

                if (extra === Tab.Automate) {
                    return (
                        <GorgiasAutomateChatIntegration
                            integration={integration}
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

        case IntegrationType.Shopify:
            return (
                <Shopify
                    integration={integration}
                    integrations={
                        integrationsProp.filter(
                            (v) => v!.get('type') === IntegrationType.Shopify,
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
                                v!.get('type') === IntegrationType.BigCommerce,
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
                            (v) => v!.get('type') === IntegrationType.Recharge,
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
                            (v) => v!.get('type') === IntegrationType.Magento2,
                        ) as List<Map<any, any>>
                    }
                    loading={loading}
                    redirectUri={redirectUri}
                />
            )

        case IntegrationType.Email:
        default:
            if (!!integrationId) {
                if (integrationId === 'migration') {
                    return <EmailMigration />
                }

                if (isUpdate) {
                    if (
                        integration.get('type') === 'email' &&
                        (integration.getIn(['meta', 'verified']) === false ||
                            (isNewDomainVerificationEnabled &&
                                extra === Tab.EmailOnboarding))
                    ) {
                        return (
                            <EmailIntegrationOnboarding
                                integration={integration.toJS()}
                            />
                        )
                    }

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

                    if (
                        isNewDomainVerificationEnabled &&
                        (extra === Tab.EmailDomainVerification ||
                            extra === Tab.EmailOutboundVerification)
                    ) {
                        return (
                            <EmailIntegrationLayout
                                integration={integration.toJS()}
                            >
                                <EmailDomainVerification
                                    integration={integration.toJS()}
                                />
                            </EmailIntegrationLayout>
                        )
                    }

                    if (extra === Tab.EmailDomainVerification) {
                        return (
                            <EmailIntegrationLayout
                                integration={integration.toJS()}
                            >
                                <DEPRECATED_EmailDomainVerificationContainer
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
                            <EmailIntegrationLayout
                                integration={integration.toJS()}
                            >
                                <EmailOutboundVerification
                                    integration={integration.toJS()}
                                    loading={loading.toJS()}
                                />
                            </EmailIntegrationLayout>
                        )
                    }

                    return (
                        <EmailIntegrationLayout
                            integration={integration.toJS()}
                        >
                            <EmailIntegrationUpdate
                                integration={integration}
                                loading={loading}
                            />
                        </EmailIntegrationLayout>
                    )
                }

                if (extra === Tab.EmailOnboarding) {
                    return <EmailIntegrationOnboarding />
                }

                return <EmailIntegrationCreate />
            }

            return (
                <EmailIntegrationList
                    integrations={integrationsProp}
                    loading={loading}
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
            AccountFeature.TwitterIntegration,
        ),
    }),
    (dispatch) => ({
        actions: bindActionCreators(IntegrationsActions, dispatch),
    }),
)

export default connector(IntegrationDetail)
