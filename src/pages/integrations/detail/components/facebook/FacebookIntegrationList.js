import React, {PropTypes} from 'react'
import IntegrationList from '../../components/IntegrationList'
import FacebookPageRow from './FacebookPageRow'
import WrapInFacebookLogin from './WrapInFacebookLogin'

class FacebookIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props
        const longTypeDescription = 'Facebook is a popular social network where customers can interact with companies. This integration creates tickets when customers post on your Facebook page or send you a message on Messenger.'

        const integrationToItemDisplay = (int) => {
            if (!int.get('deactivated_datetime')) {
                return (
                    <FacebookPageRow
                        key={int.get('id')}
                        facebookIntegration={int}
                        actions={actions}
                        allowEdit
                    />
                )
            }

            return null
        }

        return (
            <IntegrationList
                integrationType="facebook"
                integrations={integrations.filter((v) => v.get('type') === 'facebook')}
                longTypeDescription={longTypeDescription}
                createIntegration={actions.facebookLogin}
                createIntegrationButtonText="Add Facebook page"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}


FacebookIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

// eslint-disable-next-line no-class-assign
export default FacebookIntegrationList = WrapInFacebookLogin(FacebookIntegrationList)
