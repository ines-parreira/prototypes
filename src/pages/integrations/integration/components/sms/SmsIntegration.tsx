import React from 'react'
import {useParams, Switch, Route} from 'react-router-dom'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {getIntegrationById} from 'state/integrations/selectors'
import PageHeader from 'pages/common/components/PageHeader'

import AppDetails from 'pages/integrations/components/Detail'

import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'

import SmsIntegrationPreferences from 'pages/integrations/integration/components/sms/SmsIntegrationPreferences'
import SmsIntegrationCreate from 'pages/integrations/integration/components/sms/SmsIntegrationCreate'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import SmsIntegrationSecondaryNavigation from 'pages/integrations/integration/components/sms/SmsIntegrationSecondaryNavigation'

import {IntegrationType, isSmsIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'

export default function SmsIntegration() {
    const config = getIntegrationConfig(IntegrationType.Sms)
    const {integrationId} = useParams<{integrationId: string}>()
    const {phoneNumberId} = useSearch<{
        phoneNumberId: string
    }>()

    const currentIntegration = useAppSelector((state) => {
        if (integrationId) {
            const integration = getIntegrationById(parseInt(integrationId))(
                state
            )?.toJS()
            if (isSmsIntegration(integration)) {
                return integration
            }
        }
    })

    const baseURL = `/app/settings/integrations/sms`

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Sms}
                        integration={currentIntegration}
                    />
                }
            />

            <SmsIntegrationSecondaryNavigation
                integration={currentIntegration}
            />

            <Switch>
                {currentIntegration && (
                    <>
                        <Route
                            path={`${baseURL}/:integrationId/preferences`}
                            exact
                        >
                            <SmsIntegrationPreferences
                                integration={currentIntegration}
                            />
                        </Route>
                    </>
                )}
                <Route path={`${baseURL}/integrations`} exact>
                    <PhoneIntegrationsList type={IntegrationType.Sms} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    <SmsIntegrationCreate
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
                            connectTitle="Add SMS"
                            isExternalConnectUrl={false}
                        />
                    )}
                </Route>
            </Switch>
        </div>
    )
}
