import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {RootState} from '../../../state/types'
import {fetchIntegrations} from '../../../state/integrations/actions'
import {
    getBillingState,
    planIntegrations,
    getCurrentPlan,
} from '../../../state/billing/selectors'
import {
    getActiveIntegrations,
    getIntegrations,
    getIntegrationsConfig,
} from '../../../state/integrations/selectors'

import IntegrationList from './components/IntegrationList.js'

export const IntegrationListContainer = ({
    activeIntegrations,
    allowedIntegrations,
    currentPlan,
    fetchIntegrations,
    integrations,
    integrationsConfig,
    plans,
}: ConnectedProps<typeof connector>) => {
    useEffect(() => {
        void fetchIntegrations()
    }, [])

    return (
        <IntegrationList
            activeIntegrations={activeIntegrations}
            allowedIntegrations={allowedIntegrations}
            currentPlan={currentPlan}
            integrations={integrations}
            integrationsConfig={integrationsConfig}
            plans={plans}
        />
    )
}

const connector = connect(
    (state: RootState) => ({
        activeIntegrations: getActiveIntegrations(state).size,
        allowedIntegrations: planIntegrations(state),
        currentPlan: getCurrentPlan(state),
        integrations: getIntegrations(state),
        integrationsConfig: getIntegrationsConfig(state),
        plans: getBillingState(state).get('plans'),
    }),
    {fetchIntegrations}
)

export default connector(IntegrationListContainer)
