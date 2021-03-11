import React from 'react'
import {List, Map} from 'immutable'

import {IntegrationType} from '../../../../../models/integration/types'
import IntegrationList from '../IntegrationList.js'
import history from '../../../../history'

import PhoneIntegrationListItem from './PhoneIntegrationListItem'

type Props = {
    integrations: List<Map<string, any>>
    loading: boolean
    activate: (id: number) => void
    deactivate: (id: number) => void
}

export default function PhoneIntegrationList({
    integrations,
    loading,
}: Props): JSX.Element {
    const longTypeDescription =
        'Chat with your customers over the phone from Gorgias.'

    const integrationToItemDisplay = (integration: Map<string, any>) => (
        <PhoneIntegrationListItem
            key={integration.get('id')}
            integration={integration}
        />
    )

    return (
        <IntegrationList
            integrationType={IntegrationType.PhoneIntegrationType}
            longTypeDescription={longTypeDescription}
            integrations={integrations.filter(
                (integration) =>
                    integration?.get('type') ===
                    IntegrationType.PhoneIntegrationType
            )}
            createIntegration={() =>
                history.push(
                    `/app/settings/integrations/${IntegrationType.PhoneIntegrationType}/new`
                )
            }
            createIntegrationButtonContent="Add Phone Number"
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}
