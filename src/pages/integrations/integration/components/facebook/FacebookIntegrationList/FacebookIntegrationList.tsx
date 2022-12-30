import React, {Component} from 'react'
import {List, Map} from 'immutable'
import {connect} from 'react-redux'

import {IntegrationType} from 'models/integration/constants'
import {RootState} from 'state/types'
import * as integrationsSelectors from 'state/integrations/selectors'

import IntegrationList from '../../IntegrationList'

import FacebookLoginButton from '../FacebookLoginButton/FacebookLoginButton'
import FacebookPageRow from './FacebookPageRow'

type Props = {
    integrations: List<any>
    loading: Map<any, any>
    redirectUri: string
}

export class FacebookIntegrationListContainer extends Component<Props> {
    _onLogin = () => {
        window.location.href = this.props.redirectUri
    }

    render() {
        const {integrations, loading} = this.props
        const longTypeDescription = `Facebook is a popular social network where customers can interact with companies.
This integration creates tickets when customers post on your Facebook page or send you a message on Messenger.`

        const integrationToItemDisplay = (int: Map<any, any>) => (
            <FacebookPageRow key={int.get('id')} integration={int} />
        )

        return (
            <IntegrationList
                integrationType={IntegrationType.Facebook}
                integrations={integrations}
                longTypeDescription={longTypeDescription}
                createIntegration={this._onLogin}
                createIntegrationButton={<FacebookLoginButton showIcon />}
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

const connector = connect((state: RootState) => {
    return {
        integrations: integrationsSelectors.getFacebookIntegrations(state),
    }
})

export default connector(FacebookIntegrationListContainer)
