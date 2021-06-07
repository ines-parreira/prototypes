import React from 'react'
import {List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {IntegrationType} from '../../../../../models/integration/types'
import IntegrationList from '../IntegrationList.js'
import history from '../../../../history'
import {RootState} from '../../../../../state/types'
import {getCurrentAccountFeatures} from '../../../../../state/currentAccount/selectors'
import {AccountFeature} from '../../../../../state/currentAccount/types'

import PhoneIntegrationListItem from './PhoneIntegrationListItem'
import PhoneIntegrationListAlert from './PhoneIntegrationListAlert'

type OwnProps = {
    integrations: List<Map<string, any>>
    loading: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function PhoneIntegrationList({
    integrations,
    loading,
    maxIntegrations,
}: Props): JSX.Element {
    const phoneIntegrations = integrations.filter(
        (integration) =>
            integration?.get('type') === IntegrationType.PhoneIntegrationType
    )
    const isLimitReached = phoneIntegrations.size >= maxIntegrations
    const longTypeDescription =
        'Chat with your customers over the phone from Gorgias.'

    const integrationToItemDisplay = (integration: Map<string, any>) => (
        <PhoneIntegrationListItem
            key={integration.get('id')}
            integration={integration}
        />
    )

    const alert = (
        <PhoneIntegrationListAlert
            totalIntegrations={phoneIntegrations.size}
            maxIntegrations={maxIntegrations}
        />
    )

    return (
        <IntegrationList
            integrationType={IntegrationType.PhoneIntegrationType}
            longTypeDescription={longTypeDescription}
            integrations={phoneIntegrations}
            createIntegration={() =>
                history.push(
                    `/app/settings/integrations/${IntegrationType.PhoneIntegrationType}/new`
                )
            }
            createIntegrationButtonContent="Add Phone Number"
            createIntegrationButtonHidden={isLimitReached}
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
            alert={alert}
        />
    )
}

const mapStateToProps = (state: RootState) => ({
    maxIntegrations: getCurrentAccountFeatures(state).getIn([
        AccountFeature.PhoneIntegration,
        'limit',
    ]),
})

const connector = connect(mapStateToProps)

export default connector(PhoneIntegrationList)
