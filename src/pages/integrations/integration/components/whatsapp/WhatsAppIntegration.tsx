import React from 'react'
import {useParams, Switch, Route} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

import PageHeader from 'pages/common/components/PageHeader'
import AppDetails from 'pages/integrations/components/Detail'
import WhatsAppIntegrationSecondaryNavigation from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationSecondaryNavigation'
import WhatsAppIntegrationPreferences from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationPreferences'
import WhatsAppIntegrationOnboarding from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationOnboarding'
import NewWhatsAppIntegrationOnboarding from 'pages/integrations/integration/components/whatsapp/NewWhatsAppIntegrationOnboarding'

import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'

import {IntegrationType, isWhatsAppIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {getIntegrationById} from 'state/integrations/selectors'

export default function WhatsAppIntegration() {
    const useNewOnboardingFlow =
        useFlags()[FeatureFlagKey.NewWhatsAppOnboarding]

    const config = getIntegrationConfig(IntegrationType.WhatsApp)
    const {integrationId} = useParams<{integrationId: string}>()

    const currentIntegration = useAppSelector((state) => {
        if (integrationId) {
            const integration = getIntegrationById(parseInt(integrationId))(
                state
            )?.toJS()
            if (isWhatsAppIntegration(integration)) {
                return integration
            }
        }
    })

    const baseURL = `/app/settings/integrations/whatsapp`

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.WhatsApp}
                        integration={currentIntegration}
                    />
                }
            />

            <WhatsAppIntegrationSecondaryNavigation
                integration={currentIntegration}
            />

            <Switch>
                {currentIntegration && (
                    <>
                        <Route
                            path={`${baseURL}/:integrationId/preferences`}
                            exact
                        >
                            <WhatsAppIntegrationPreferences
                                integration={currentIntegration}
                            />
                        </Route>
                    </>
                )}
                <Route path={`${baseURL}/integrations`} exact>
                    <PhoneIntegrationsList type={IntegrationType.WhatsApp} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    <WhatsAppIntegrationOnboarding />
                </Route>
                <Route path={`${baseURL}/onboard`} exact>
                    <NewWhatsAppIntegrationOnboarding />
                </Route>
                <Route path={baseURL} exact>
                    {config && (
                        <AppDetails
                            {...config}
                            connectUrl={
                                useNewOnboardingFlow
                                    ? window.GORGIAS_STATE.integrations
                                          .authentication.whatsapp
                                          ?.redirect_uri ?? ''
                                    : '/app/settings/integrations/whatsapp/new'
                            }
                            connectTitle="Add WhatsApp"
                            isExternalConnectUrl
                        />
                    )}
                </Route>
            </Switch>
        </div>
    )
}
