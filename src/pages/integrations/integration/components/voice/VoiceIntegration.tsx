import React from 'react'
import {useParams, Switch, Route} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'
import {IntegrationType, isPhoneIntegration} from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import VoiceIntegrationCreate from 'pages/integrations/integration/components/voice/VoiceIntegrationCreate'
import VoiceIntegrationGreetingMessage from 'pages/integrations/integration/components/voice/VoiceIntegrationGreetingMessage'
import VoiceIntegrationIvr from 'pages/integrations/integration/components/voice/VoiceIntegrationIvr'
import VoiceIntegrationPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences'
import VoiceIntegrationSecondaryNavigation from 'pages/integrations/integration/components/voice/VoiceIntegrationSecondaryNavigation'
import VoiceIntegrationVoicemail from 'pages/integrations/integration/components/voice/VoiceIntegrationVoicemail'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {
    getIntegrationById,
    getPhoneIntegrations,
} from 'state/integrations/selectors'

import {getDefaultRoutes} from '../../utils/defaultRoutes'
import VoiceIntegrationDetails from './VoiceIntegrationDetails'

export default function VoiceIntegration() {
    const config = getIntegrationConfig(IntegrationType.Phone)
    const {integrationId} = useParams<{integrationId: string}>()
    const {phoneNumberId} = useSearch<{
        phoneNumberId: string
    }>()

    const currentIntegration = useAppSelector((state) => {
        if (integrationId) {
            const integration = getIntegrationById(parseInt(integrationId))(
                state
            )?.toJS()
            if (isPhoneIntegration(integration)) {
                return integration
            }
        }
    })
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)

    const baseURL = `/app/settings/channels/phone`
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
                        <Button>Add Voice</Button>
                    </ConnectLink>
                </Route>
            </PageHeader>

            <VoiceIntegrationSecondaryNavigation
                integration={currentIntegration}
            />

            <Switch>
                {currentIntegration && (
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
                        <Route path={`${baseURL}/:integrationId/ivr`} exact>
                            <VoiceIntegrationIvr
                                integration={currentIntegration}
                            />
                        </Route>
                    </>
                )}
                <Route path={routes.integrations} exact>
                    <PhoneIntegrationsList type={IntegrationType.Phone} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    <VoiceIntegrationCreate
                        selectedPhoneNumberId={
                            phoneNumberId
                                ? Number.parseInt(phoneNumberId, 10)
                                : undefined
                        }
                        pricingLink={config?.pricingLink}
                    />
                </Route>
                <Route path={routes.about} exact>
                    <VoiceIntegrationDetails />
                </Route>
            </Switch>
        </div>
    )
}
