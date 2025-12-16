import type { LocationState } from 'history'
import {
    matchPath,
    Route,
    Switch,
    useLocation,
    useParams,
} from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import {
    IntegrationType,
    isPhoneIntegration,
    isStandardPhoneIntegration,
} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import VoiceIntegrationIvr from 'pages/integrations/integration/components/voice/VoiceIntegrationIvr'
import VoiceIntegrationIVRPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationIVRPreferences'
import VoiceIntegrationSecondaryNavigation from 'pages/integrations/integration/components/voice/VoiceIntegrationSecondaryNavigation'
import VoiceIntegrationVoicemail from 'pages/integrations/integration/components/voice/VoiceIntegrationVoicemail'
import {
    getIntegrationById,
    getPhoneIntegrations,
} from 'state/integrations/selectors'

import { getDefaultRoutes } from '../../utils/defaultRoutes'
import { PHONE_INTEGRATION_BASE_URL as baseURL } from './constants'
import VoiceIntegrationDetails from './VoiceIntegrationDetails'
import VoiceIntegrationFlowPage from './VoiceIntegrationFlowPage'
import VoiceIntegrationOnboarding from './VoiceIntegrationOnboarding/VoiceIntegrationOnboarding'
import VoiceIntegrationQueueRoutes from './VoiceIntegrationQueueRoutes'
import VoiceIntegrationSettingsPage from './VoiceIntegrationSettingsPage'

export default function VoiceIntegration() {
    const { integrationId } = useParams<{ integrationId: string }>()

    const { pathname: path } = useLocation<LocationState>()
    const queuePathMatch = matchPath<{ queueId?: string }>(path, {
        path: `${baseURL}/queues/:queueId`,
        exact: false,
        strict: false,
    })

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
    const isQueuePage = !!queuePathMatch?.params.queueId

    const routes = getDefaultRoutes(baseURL, phoneIntegrations)

    const integrationOldRoutes = currentIntegration && (
        <>
            {isStandardIntegration ? (
                <Route path={`${baseURL}/:integrationId/preferences`} exact>
                    <VoiceIntegrationSettingsPage />
                </Route>
            ) : (
                <>
                    <Route path={`${baseURL}/:integrationId/preferences`} exact>
                        <VoiceIntegrationIVRPreferences
                            integration={currentIntegration}
                        />
                    </Route>
                    <Route path={`${baseURL}/:integrationId/voicemail`} exact>
                        <VoiceIntegrationVoicemail
                            integration={currentIntegration}
                        />
                    </Route>
                    <Route path={`${baseURL}/:integrationId/ivr`} exact>
                        <VoiceIntegrationIvr integration={currentIntegration} />
                    </Route>
                </>
            )}
        </>
    )
    const integrationNewRoutes = currentIntegration && (
        <>
            <Route path={`${baseURL}/:integrationId/preferences`} exact>
                <VoiceIntegrationSettingsPage />
            </Route>
            <Route path={`${baseURL}/:integrationId/flow`} exact>
                <VoiceIntegrationFlowPage />
            </Route>
        </>
    )
    const shouldUseNewRoutes = !!currentIntegration?.meta?.flow

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
                <Route path={`${baseURL}/queues`} exact>
                    <ConnectLink
                        connectUrl={`${baseURL}/queues/new`}
                        integrationTitle={IntegrationType.Phone}
                    >
                        <Button>Create queue</Button>
                    </ConnectLink>
                </Route>
            </PageHeader>

            {(!isStandardIntegration || shouldUseNewRoutes) && !isQueuePage && (
                <VoiceIntegrationSecondaryNavigation
                    integration={currentIntegration}
                    shouldUseNewRoutes={shouldUseNewRoutes}
                />
            )}

            <Switch>
                {shouldUseNewRoutes
                    ? integrationNewRoutes
                    : integrationOldRoutes}
                <Route path={routes.integrations} exact>
                    <PhoneIntegrationsList type={IntegrationType.Phone} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    <VoiceIntegrationOnboarding />
                </Route>
                <Route path={routes.about} exact>
                    <VoiceIntegrationDetails />
                </Route>
                <VoiceIntegrationQueueRoutes />
            </Switch>
        </div>
    )
}
