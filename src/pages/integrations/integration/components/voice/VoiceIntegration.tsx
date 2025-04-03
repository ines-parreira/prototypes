import { LocationState } from 'history'
import {
    matchPath,
    Route,
    Switch,
    useLocation,
    useParams,
} from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'
import {
    IntegrationType,
    isPhoneIntegration,
    isStandardPhoneIntegration,
} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import DEPRECATED_VoiceIntegrationCreate from 'pages/integrations/integration/components/voice/DEPRECATED_VoiceIntegrationCreate'
import VoiceIntegrationGreetingMessage from 'pages/integrations/integration/components/voice/VoiceIntegrationGreetingMessage'
import VoiceIntegrationIvr from 'pages/integrations/integration/components/voice/VoiceIntegrationIvr'
import VoiceIntegrationPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences'
import VoiceIntegrationSecondaryNavigation from 'pages/integrations/integration/components/voice/VoiceIntegrationSecondaryNavigation'
import VoiceIntegrationVoicemail from 'pages/integrations/integration/components/voice/VoiceIntegrationVoicemail'
import { getIntegrationConfig } from 'state/integrations/helpers'
import {
    getIntegrationById,
    getPhoneIntegrations,
} from 'state/integrations/selectors'

import { getDefaultRoutes } from '../../utils/defaultRoutes'
import { PHONE_INTEGRATION_BASE_URL as baseURL } from './constants'
import VoiceIntegrationDetails from './VoiceIntegrationDetails'
import VoiceIntegrationOnboarding from './VoiceIntegrationOnboarding/VoiceIntegrationOnboarding'
import VoiceIntegrationQueueRoutes from './VoiceIntegrationQueueRoutes'
import VoiceIntegrationSettingsPage from './VoiceIntegrationSettingsPage'

export default function VoiceIntegration() {
    const config = getIntegrationConfig(IntegrationType.Phone)
    const { integrationId } = useParams<{ integrationId: string }>()
    const { phoneNumberId } = useSearch<{
        phoneNumberId: string
    }>()
    const { pathname: path } = useLocation<LocationState>()
    const queuePathMatch = matchPath<{ queueId?: string }>(path, {
        path: `${baseURL}/queues/:queueId`,
        exact: false,
        strict: false,
    })

    const exposeQueues = useFlag(FeatureFlagKey.ExposeVoiceQueues)

    const currentIntegration = useAppSelector((state) => {
        if (integrationId) {
            const integration = getIntegrationById(parseInt(integrationId))(
                state,
            )?.toJS()
            if (isPhoneIntegration(integration)) {
                return integration
            }
        }
    })
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const isStandardIntegration = isStandardPhoneIntegration(currentIntegration)
    const showNewSettingsPage = exposeQueues && isStandardIntegration
    const isQueuePage = !!queuePathMatch?.params.queueId

    const routes = getDefaultRoutes(baseURL, phoneIntegrations)

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Phone}
                        integration={currentIntegration}
                    />
                }
            >
                <Route path={routes.integrations} exact>
                    <ConnectLink
                        connectUrl={'/app/settings/channels/phone/new'}
                        integrationTitle={IntegrationType.Phone}
                    >
                        <Button>Add Voice Integration</Button>
                    </ConnectLink>
                </Route>
                {exposeQueues && (
                    <Route path={`${baseURL}/queues`} exact>
                        <ConnectLink
                            connectUrl={`${baseURL}/queues/new`}
                            integrationTitle={IntegrationType.Phone}
                        >
                            <Button>Create queue</Button>
                        </ConnectLink>
                    </Route>
                )}
            </PageHeader>

            {!showNewSettingsPage && !isQueuePage && (
                <VoiceIntegrationSecondaryNavigation
                    integration={currentIntegration}
                />
            )}

            <Switch>
                {currentIntegration && (
                    <>
                        {showNewSettingsPage ? (
                            <Route
                                path={`${baseURL}/:integrationId/preferences`}
                                exact
                            >
                                <VoiceIntegrationSettingsPage />
                            </Route>
                        ) : (
                            <>
                                <Route
                                    path={`${baseURL}/:integrationId/preferences`}
                                    exact
                                >
                                    <VoiceIntegrationPreferences
                                        integration={currentIntegration}
                                    />
                                </Route>
                                <Route
                                    path={`${baseURL}/:integrationId/voicemail`}
                                    exact
                                >
                                    <VoiceIntegrationVoicemail
                                        integration={currentIntegration}
                                    />
                                </Route>
                                <Route
                                    path={`${baseURL}/:integrationId/greetings-music`}
                                    exact
                                >
                                    <VoiceIntegrationGreetingMessage
                                        integration={currentIntegration}
                                    />
                                </Route>
                                <Route
                                    path={`${baseURL}/:integrationId/ivr`}
                                    exact
                                >
                                    <VoiceIntegrationIvr
                                        integration={currentIntegration}
                                    />
                                </Route>
                            </>
                        )}
                    </>
                )}
                <Route path={routes.integrations} exact>
                    <PhoneIntegrationsList type={IntegrationType.Phone} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    {exposeQueues ? (
                        <VoiceIntegrationOnboarding />
                    ) : (
                        <DEPRECATED_VoiceIntegrationCreate
                            selectedPhoneNumberId={
                                phoneNumberId
                                    ? Number.parseInt(phoneNumberId, 10)
                                    : undefined
                            }
                            pricingLink={config?.pricingLink}
                        />
                    )}
                </Route>
                <Route path={routes.about} exact>
                    <VoiceIntegrationDetails />
                </Route>
                {exposeQueues && <VoiceIntegrationQueueRoutes />}
            </Switch>
        </div>
    )
}
