// @flow
import React from 'react'
import {Link} from 'react-router'
import SecondaryNavbar from '../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: any
}

export default class RealtimeMessagingIntegrationNavigation extends React.Component<Props> {
    _renderChat() {
        const integrationId = this.props.integration.get('id')
        const baseURL = `/app/settings/integrations/smooch_inside/${integrationId}`
        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/appearance`}>
                    Appearance
                </Link>
                <Link to={`${baseURL}/installation`}>
                    Installation
                </Link>
                <Link to={`${baseURL}/preferences`}>
                    Preferences
                </Link>
                <Link to={`${baseURL}/campaigns`}>
                    Campaigns
                </Link>
                <Link to={`${baseURL}/quick-replies`}>
                    Quick replies
                </Link>
            </SecondaryNavbar>
        )
    }

    _renderFacebook() {
        const integrationId = this.props.integration.get('id')
        const baseURL = `/app/settings/integrations/facebook/${integrationId}`
        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/overview`}>
                    Overview
                </Link>
                <Link to={`${baseURL}/customer_chat`}>
                    Customer chat
                </Link>
                <Link to={`${baseURL}/preferences`}>
                    Preferences
                </Link>
            </SecondaryNavbar>
        )
    }

    _renderSmooch() {
        const integrationId = this.props.integration.get('id')
        const baseURL = `/app/settings/integrations/smooch/${integrationId}`
        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/overview`}>
                    Overview
                </Link>
                <Link to={`${baseURL}/preferences`}>
                    Preferences
                </Link>
            </SecondaryNavbar>
        )
    }

    render() {
        const {integration} = this.props

        if (integration.get('type') === 'smooch_inside') {
            return this._renderChat()
        } else if (integration.get('type') === 'facebook') {
            return this._renderFacebook()
        } else if (integration.get('type') === 'smooch') {
            return this._renderSmooch()
        }

        return null
    }
}
