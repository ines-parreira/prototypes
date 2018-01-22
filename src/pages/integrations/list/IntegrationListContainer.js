import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../../../state/integrations/actions'
import IntegrationList from './components/IntegrationList'
import {isAllowedToCreateIntegration} from '../../../state/billing/selectors'

class IntegrationListContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchIntegrations()
    }

    render() {
        const {integrations, actions, isAllowedToCreate} = this.props

        const allProps = {
            integrations,
            actions,
            isAllowedToCreate
        }

        return <IntegrationList {...allProps} />
    }
}

IntegrationListContainer.propTypes = {
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    isAllowedToCreate: PropTypes.bool.isRequired,
}

function mapStateToProps(state) {
    return {
        integrations: state.integrations,
        isAllowedToCreate: isAllowedToCreateIntegration(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationListContainer)
