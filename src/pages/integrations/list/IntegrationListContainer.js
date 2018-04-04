import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../../../state/integrations/actions'
import IntegrationList from './components/IntegrationList'
import {planIntegrations, currentPlan} from '../../../state/billing/selectors'

class IntegrationListContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchIntegrations()
    }

    render() {
        const {integrations, actions, allowedIntegrations, currentPlan} = this.props

        const allProps = {
            integrations,
            actions,
            allowedIntegrations,
            currentPlan,
        }

        return <IntegrationList {...allProps} />
    }
}

IntegrationListContainer.propTypes = {
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    allowedIntegrations: PropTypes.number.isRequired,
    currentPlan: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        integrations: state.integrations,
        allowedIntegrations: planIntegrations(state),
        currentPlan: currentPlan(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationListContainer)
