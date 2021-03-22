//@flow
import React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import type {List, Map} from 'immutable'

import * as IntegrationsActions from '../../../state/integrations/actions.ts'
import {
    getBillingState,
    planIntegrations,
    currentPlan,
} from '../../../state/billing/selectors.ts'
import {
    getActiveIntegrations,
    getIntegrations,
    getIntegrationsConfig,
} from '../../../state/integrations/selectors.ts'

import IntegrationList from './components/IntegrationList'

type Props = {
    integrations: List<Map<string, any>>,
    integrationsConfig: List<Map<string, any>>,
    actions: Object,
    allowedIntegrations: number,
    activeIntegrations: number,
    currentPlan: Object,
    plans: Map<any, any>,
}

class IntegrationListContainer extends React.Component<Props> {
    componentWillMount() {
        this.props.actions.fetchIntegrations()
    }

    render() {
        return <IntegrationList {...this.props} />
    }
}

function mapStateToProps(state) {
    return {
        integrations: getIntegrations(state),
        integrationsConfig: getIntegrationsConfig(state),
        allowedIntegrations: planIntegrations(state),
        activeIntegrations: getActiveIntegrations(state).size,
        currentPlan: currentPlan(state),
        plans: getBillingState(state).get('plans'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch),
    }
}

//$FlowFixMe
export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(IntegrationListContainer)
)
