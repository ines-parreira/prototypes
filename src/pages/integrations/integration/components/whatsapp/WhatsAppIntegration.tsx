import React from 'react'
import {useParams, Switch, Route} from 'react-router-dom'

import PageHeader from 'pages/common/components/PageHeader'
import AppDetails from 'pages/common/components/ProductDetail'
import WhatsAppIntegrationSecondaryNavigation from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationSecondaryNavigation'
import WhatsAppIntegrationPreferences from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationPreferences'
import WhatsAppIntegrationOnboarding from 'pages/integrations/integration/components/whatsapp/WhatsAppIntegrationOnboarding'
import {mapAppToDetail} from 'pages/integrations/mappers/appToDetail'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import Button from 'pages/common/components/button/Button'

import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'

import {IntegrationType, isWhatsAppIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {getIntegrationById} from 'state/integrations/selectors'

export default function WhatsAppIntegration() {
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

    if (!config) return null
    const detailProps = mapAppToDetail(config)
    const CTA = (
        <ConnectLink
            connectUrl={
                window.GORGIAS_STATE.integrations.authentication.whatsapp
                    ?.redirect_uri ?? ''
            }
            integrationTitle={IntegrationType.WhatsApp}
            isExternal
        >
            <Button>Add WhatsApp</Button>
        </ConnectLink>
    )
    detailProps.infocard.CTA = CTA

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
                <Route path={`${baseURL}/onboard`} exact>
                    <WhatsAppIntegrationOnboarding />
                </Route>
                <Route path={baseURL} exact>
                    {config && <AppDetails {...detailProps} />}
                </Route>
            </Switch>
        </div>
    )
}
