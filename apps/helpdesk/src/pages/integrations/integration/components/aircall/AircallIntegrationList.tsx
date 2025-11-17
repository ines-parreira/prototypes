import { history } from '@repo/routing'
import type { List, Map } from 'immutable'

import { IntegrationType } from 'models/integration/constants'

import IntegrationList from '../IntegrationList'
import AircallIntegrationListItem from './AircallIntegrationListItem'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}
export default function AircallIntegrationList({
    integrations,
    loading,
}: Props) {
    const longTypeDescription = (
        <span>
            Aircall is a phone app that helps you set up a call center in
            minutes. Connect Aircall to Gorgias and create tickets when
            customers call you.
        </span>
    )

    const integrationToItemDisplay = (integration: Map<any, any>) => {
        return (
            <AircallIntegrationListItem
                key={integration.get('id')}
                integration={integration.toJS()}
            />
        )
    }

    return (
        <IntegrationList
            integrationType={IntegrationType.Aircall}
            longTypeDescription={longTypeDescription}
            integrations={
                integrations.filter(
                    (integration) =>
                        integration!.get('type') === IntegrationType.Aircall,
                ) as List<Map<any, any>>
            }
            createIntegration={() =>
                history.push('/app/settings/integrations/aircall/new')
            }
            createIntegrationButtonLabel="Connect Aircall"
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}
