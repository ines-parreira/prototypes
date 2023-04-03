import React from 'react'
import {useParams, Switch, Route} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import PageHeader from 'pages/common/components/PageHeader'
import WhatsAppIntegrationSecondaryNavigation from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationSecondaryNavigation'
import WhatsAppIntegrationDetails from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationDetails'
import WhatsAppIntegrationPreferences from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationPreferences'
import WhatsAppIntegrationOnboarding from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationOnboarding'
import WhatsAppIntegrationMigration from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationMigration'
import WhatsAppIntegrationConnectButton from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationConnectButton'

import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'

import {IntegrationType, isWhatsAppIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'

import {getIntegrationById} from 'state/integrations/selectors'

export default function WhatsAppIntegration() {
    const {integrationId} = useParams<{integrationId: string}>()
    const enableMigration = useFlags()[FeatureFlagKey.EnableWhatsAppMigrations]

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
            >
                <Route path={`${baseURL}/integrations`} exact>
                    <WhatsAppIntegrationConnectButton isHorizontal />
                </Route>
            </PageHeader>

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
                <Route path={`${baseURL}/onboard`} exact>
                    <WhatsAppIntegrationOnboarding />
                </Route>
                {enableMigration && (
                    <Route path={`${baseURL}/migration`} exact>
                        <WhatsAppIntegrationMigration />
                    </Route>
                )}
                <Route path={baseURL} exact>
                    <WhatsAppIntegrationDetails />
                </Route>
            </Switch>
        </div>
    )
}
