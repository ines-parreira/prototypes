import React from 'react'
import {List, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'

import {IntegrationType} from '../../../../../models/integration/types'
import IntegrationList from '../IntegrationList'
import history from '../../../../history'
import {RootState} from '../../../../../state/types'
import {getCurrentAccountFeatures} from '../../../../../state/currentAccount/selectors'
import {AccountFeature} from '../../../../../state/currentAccount/types'

import IntegrationListLimitAlert from '../IntegrationListLimitAlert'

import DEPRECATED_PhoneIntegrationListItem from './DEPRECATED_PhoneIntegrationListItem'

type OwnProps = {
    integrations: List<Map<string, any>>
    loading: Map<any, any>
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function DEPRECATED_PhoneIntegrationList({
    integrations,
    loading,
    maxIntegrations,
}: Props): JSX.Element {
    const phoneIntegrations = integrations.filter(
        (integration) => integration?.get('type') === IntegrationType.Phone
    ) as List<Map<any, any>>
    const isLimitReached = phoneIntegrations.size >= maxIntegrations
    const longTypeDescription =
        'Chat with your customers over the phone from Gorgias.'

    const integrationToItemDisplay = (integration: Map<string, any>) => (
        <DEPRECATED_PhoneIntegrationListItem
            key={integration.get('id')}
            integration={integration}
        />
    )

    const alert = (
        <IntegrationListLimitAlert
            totalIntegrations={phoneIntegrations.size}
            maxIntegrations={maxIntegrations}
        />
    )

    return (
        <IntegrationList
            integrationType={IntegrationType.Phone}
            longTypeDescription={longTypeDescription}
            integrations={phoneIntegrations}
            createIntegration={() =>
                history.push(
                    `/app/settings/integrations/${IntegrationType.Phone}/new`
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

export default connector(DEPRECATED_PhoneIntegrationList)
