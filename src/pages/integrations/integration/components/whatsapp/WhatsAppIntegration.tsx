import React from 'react'

import { Route, Switch, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import {
    IntegrationType,
    isWhatsAppIntegration,
} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import WhatsAppIntegrationConnectButton from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationConnectButton'
import WhatsAppIntegrationDetails from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationDetails'
import WhatsAppIntegrationMigration from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationMigration'
import WhatsAppIntegrationOnboarding from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationOnboarding'
import WhatsAppIntegrationPreferences from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationPreferences'
import WhatsAppIntegrationSecondaryNavigation from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationSecondaryNavigation'
import { getIntegrationById } from 'state/integrations/selectors'

import WhatsappBusinessManagerLinkButton from './WhatsappBusinessManagerLinkButton'
import WhatsAppMessageTemplatesList from './WhatsAppMessageTemplatesList'

export default function WhatsAppIntegration() {
    const { integrationId } = useParams<{ integrationId: string }>()

    const currentIntegration = useAppSelector((state) => {
        if (integrationId) {
            const integration = getIntegrationById(parseInt(integrationId))(
                state,
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
                <Route path={`${baseURL}/:integrationId/templates`} exact>
                    <WhatsappBusinessManagerLinkButton />
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
                        <Route
                            path={`${baseURL}/:integrationId/templates`}
                            exact
                        >
                            <WhatsAppMessageTemplatesList
                                phoneNumberId={
                                    currentIntegration.meta.phone_number_id
                                }
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
                <Route path={`${baseURL}/migration`} exact>
                    <WhatsAppIntegrationMigration />
                </Route>
                <Route path={baseURL} exact>
                    <WhatsAppIntegrationDetails />
                </Route>
            </Switch>
        </div>
    )
}
