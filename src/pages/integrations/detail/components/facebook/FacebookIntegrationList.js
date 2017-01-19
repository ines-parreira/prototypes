import React, {PropTypes} from 'react'
import IntegrationList from '../../components/IntegrationList'
import FacebookPageRow from './FacebookPageRow'

export default class FacebookIntegrationList extends React.Component {
    _onLogin = () => {
        window.location = this.props.redirectUri
    }

    render() {
        const {integrations, actions, loading} = this.props
        const longTypeDescription = `Facebook is a popular social network where customers can interact with companies.
This integration creates tickets when customers post on your Facebook page or send you a message on Messenger.`

        const integrationToItemDisplay = (int) => (
            <FacebookPageRow
                key={int.get('id')}
                integration={int}
                actions={actions}
            />
        )

        return (
            <IntegrationList
                integrationType="facebook"
                integrations={integrations.filter((v) => v.get('type') === 'facebook')}
                longTypeDescription={longTypeDescription}
                createIntegration={this._onLogin}
                createIntegrationButtonText="Login to Facebook"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}


FacebookIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    redirectUri: PropTypes.string.isRequired,
}
