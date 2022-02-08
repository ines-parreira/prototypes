import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {RootState} from 'state/types'
import {fetchIntegrations} from 'state/integrations/actions'
import {
    DEPRECATED_getBillingState,
    planIntegrations,
    DEPRECATED_getCurrentPlan,
} from 'state/billing/selectors'
import {
    getActiveIntegrations,
    DEPRECATED_getIntegrations,
    getIntegrationsConfig,
} from 'state/integrations/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import IntegrationList from './components/IntegrationList'

export const IntegrationListContainer = ({
    activeIntegrations,
    allowedIntegrations,
    currentPlan,
    currentAccount,
    fetchIntegrations,
    integrations,
    integrationsConfig,
    plans,
}: ConnectedProps<typeof connector>) => {
    useEffect(() => {
        void fetchIntegrations()
    }, [fetchIntegrations])

    return (
        <IntegrationList
            activeIntegrations={activeIntegrations}
            allowedIntegrations={allowedIntegrations}
            currentPlan={currentPlan}
            currentAccount={currentAccount}
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
        currentPlan: DEPRECATED_getCurrentPlan(state),
        currentAccount: getCurrentAccountState(state),
        integrations: DEPRECATED_getIntegrations(state),
        integrationsConfig: getIntegrationsConfig(state),
        plans: DEPRECATED_getBillingState(state).get('plans'),
    }),
    {fetchIntegrations}
)

export default connector(IntegrationListContainer)
