//@flow
import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import type {List, Map} from 'immutable'

import * as IntegrationsActions from '../../../state/integrations/actions.ts'
import {
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch),
    }
}

//$FlowFixMe
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IntegrationListContainer)
