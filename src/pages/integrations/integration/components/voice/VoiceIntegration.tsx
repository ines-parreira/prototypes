import React from 'react'
import {useParams, Switch, Route} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import AppDetails from 'pages/integrations/components/Detail'
import VoiceIntegrationSecondaryNavigation from 'pages/integrations/integration/components/voice/VoiceIntegrationSecondaryNavigation'
import VoiceIntegrationPreferences from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences'
import VoiceIntegrationVoicemail from 'pages/integrations/integration/components/voice/VoiceIntegrationVoicemail'
import VoiceIntegrationGreetingMessage from 'pages/integrations/integration/components/voice/VoiceIntegrationGreetingMessage'
import VoiceIntegrationIvr from 'pages/integrations/integration/components/voice/VoiceIntegrationIvr'
import VoiceIntegrationCreate from 'pages/integrations/integration/components/voice/VoiceIntegrationCreate'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'

import {IntegrationType, isPhoneIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {getIntegrationById} from 'state/integrations/selectors'

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

    const baseURL = `/app/settings/integrations/phone`

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Phone}
                        integration={currentIntegration}
                    />
                }
            />

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
                            path={`${baseURL}/:integrationId/greeting-message`}
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
                <Route path={`${baseURL}/integrations`} exact>
                    <PhoneIntegrationsList type={IntegrationType.Phone} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    <VoiceIntegrationCreate
                        selectedPhoneNumberId={
                            phoneNumberId
                                ? Number.parseInt(phoneNumberId, 10)
                                : undefined
                        }
                    />
                </Route>
                <Route path={baseURL} exact>
                    {config && (
                        <AppDetails
                            {...config}
                            connectUrl={`${baseURL}/new`}
                            connectTitle="Add Voice"
                            isExternalConnectUrl={false}
                        />
                    )}
                </Route>
            </Switch>
        </div>
    )
}
