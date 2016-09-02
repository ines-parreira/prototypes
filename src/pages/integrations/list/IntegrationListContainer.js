import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as IntegrationsActions from '../../../state/integrations/actions'
import {getIntegrationsList} from '../../../state/integrations/utils'
import IntegrationList from './components/IntegrationList'

class IntegrationListContainer extends React.Component {
    componentWillMount() {
        this.props.actions.fetchIntegrations()
    }

    render() {
        const {integrations, actions, settings} = this.props

        if (!settings.get('loaded')) {
            return null
        }

        const allProps = {
            integrationsList: getIntegrationsList(integrations.get('integrations')),
            facebookAppId: settings.getIn(['data', 'facebook_app_id']),
            typeToLoadingStatus: {facebook: integrations.getIn(['state', 'loading', 'facebookLogin'])},
            actions
        }

        return <IntegrationList {...allProps} />
    }
}

IntegrationListContainer.propTypes = {
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        integrations: state.integrations,
        settings: state.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(IntegrationsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IntegrationListContainer)
