import React, {PropTypes} from 'react'
import IntegrationsEdit from '../IntegrationsEdit'
import FacebookPage from './FacebookPage'
import WrapInFacebookLogin from './WrapInFacebookLogin'

class FacebookIntegrationsEdit extends React.Component {

    render() {
        const {integrations, actions} = this.props

        const longTypeDescription = 'Facebook is a popular social network where customers can interact with companies. This integration creates tickets when customers post on your Facebook page or send you a message on Messenger.'

        const integrationToItemDisplay = (int) => {
            if (!int.get('deactivated_datetime')) {
                return (
                    <FacebookPage
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
            <IntegrationsEdit
                integrationType="facebook"
                integrations={integrations.filter((v) => v.get('type') === 'facebook')}
                longTypeDescription={longTypeDescription}
                createIntegration={actions.facebookLogin}
                createIntegrationButtonText="ADD PAGE"
                integrationToItemDisplay={integrationToItemDisplay}
            />
        )
    }
}


FacebookIntegrationsEdit.propTypes = {
    // An object that contains the integrations for the relevant type along with display info.
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

// eslint-disable-next-line no-class-assign
export default FacebookIntegrationsEdit = WrapInFacebookLogin(FacebookIntegrationsEdit)
