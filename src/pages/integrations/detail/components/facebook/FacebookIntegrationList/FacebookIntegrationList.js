import React from 'react'
import PropTypes from 'prop-types'
import ImmutablePropsTypes from 'react-immutable-proptypes'
import {connect} from 'react-redux'

import {getIconFromUrl} from '../../../../../../state/integrations/helpers'
import IntegrationList from '../../IntegrationList'
import * as integrationsSelectors from '../../../../../../state/integrations/selectors'

import FacebookPageRow from './FacebookPageRow'

import css from './FacebookIntegrationList.less'

@connect((state) => {
    return {
        integrations: integrationsSelectors.getFacebookIntegrations(state),
    }
})
export default class FacebookIntegrationList extends React.Component {
    static propTypes = {
        integrations: ImmutablePropsTypes.list.isRequired,
        loading: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
        redirectUri: PropTypes.string.isRequired,
    }

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
                integrations={integrations}
                longTypeDescription={longTypeDescription}
                createIntegration={this._onLogin}
                createIntegrationButtonContent={
                    <div>
                        <img
                            src={getIconFromUrl(
                                'integrations/facebook-white.png'
                            )}
                            alt="facebook-logo"
                            className={css.facebookLogo}
                        />
                        Login with Facebook
                    </div>
                }
                createIntegrationButtonClassName={css.createIntegrationButton}
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
