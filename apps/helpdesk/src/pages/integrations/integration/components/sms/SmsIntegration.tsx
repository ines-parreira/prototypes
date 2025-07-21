import { Route, Switch, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useSearch from 'hooks/useSearch'
import { IntegrationType, isSmsIntegration } from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import PhoneIntegrationBreadcrumbs from 'pages/integrations/integration/components/phone/PhoneIntegrationBreadcrumbs'
import PhoneIntegrationsList from 'pages/integrations/integration/components/phone/PhoneIntegrationsList'
import SmsIntegrationCreate from 'pages/integrations/integration/components/sms/SmsIntegrationCreate'
import SmsIntegrationPreferences from 'pages/integrations/integration/components/sms/SmsIntegrationPreferences'
import SmsIntegrationSecondaryNavigation from 'pages/integrations/integration/components/sms/SmsIntegrationSecondaryNavigation'
import { getIntegrationConfig } from 'state/integrations/helpers'
import {
    getIntegrationById,
    getSmsIntegrations,
} from 'state/integrations/selectors'

import { getDefaultRoutes } from '../../utils/defaultRoutes'
import SmsIntegrationDetails from './SmsIntegrationDetails'

export default function SmsIntegration() {
    const config = getIntegrationConfig(IntegrationType.Sms)
    const { integrationId } = useParams<{ integrationId: string }>()
    const { phoneNumberId } = useSearch<{
        phoneNumberId: string
    }>()

    const currentIntegration = useAppSelector((state) => {
        if (integrationId) {
            const integration = getIntegrationById(parseInt(integrationId))(
                state,
            )?.toJS()
            if (isSmsIntegration(integration)) {
                return integration
            }
        }
    })
    const smsIntegrations = useAppSelector(getSmsIntegrations)

    const baseURL = `/app/settings/channels/sms`
    const routes = getDefaultRoutes(baseURL, smsIntegrations)

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <PhoneIntegrationBreadcrumbs
                        type={IntegrationType.Sms}
                        integration={currentIntegration}
                    />
                }
            >
                <Route path={routes.integrations} exact>
                    <ConnectLink
                        connectUrl={'/app/settings/channels/sms/new'}
                        integrationTitle={IntegrationType.Sms}
                    >
                        <Button>Add SMS</Button>
                    </ConnectLink>
                </Route>
            </PageHeader>

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
                <Route path={routes.integrations} exact>
                    <PhoneIntegrationsList type={IntegrationType.Sms} />
                </Route>
                <Route path={`${baseURL}/new`} exact>
                    <SmsIntegrationCreate
                        selectedPhoneNumberId={
                            phoneNumberId
                                ? Number.parseInt(phoneNumberId, 10)
                                : undefined
                        }
                        pricingLink={config?.pricingLink}
                    />
                </Route>
                <Route path={routes.about} exact>
                    <SmsIntegrationDetails />
                </Route>
            </Switch>
        </div>
    )
}
