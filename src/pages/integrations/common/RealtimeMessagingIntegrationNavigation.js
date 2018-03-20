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
        const linkProps = {
            className: 'nav-link',
            activeClassName: 'disabled'

        }
        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/appearance`} {...linkProps}>
                    Appearance
                </Link>
                <Link to={`${baseURL}/installation`} {...linkProps}>
                    Installation
                </Link>
                <Link to={`${baseURL}/preferences`} {...linkProps}>
                    Preferences
                </Link>
                <Link to={`${baseURL}/campaigns`} {...linkProps}>
                    Campaigns
                </Link>
            </SecondaryNavbar>
        )
    }

    _renderFacebook() {
        const integrationId = this.props.integration.get('id')
        const baseURL = `/app/settings/integrations/facebook/${integrationId}`
        const linkProps = {
            className: 'nav-link',
            activeClassName: 'disabled'

        }
        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/overview`} {...linkProps}>
                    Overview
                </Link>
                <Link to={`${baseURL}/customer_chat`} {...linkProps}>
                    Customer chat
                </Link>
                <Link to={`${baseURL}/preferences`} {...linkProps}>
                    Preferences
                </Link>
            </SecondaryNavbar>
        )
    }

    _renderSmooch() {
        const integrationId = this.props.integration.get('id')
        const baseURL = `/app/settings/integrations/smooch/${integrationId}`
        const linkProps = {
            className: 'nav-link',
            activeClassName: 'disabled'

        }
        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/overview`} {...linkProps}>
                    Overview
                </Link>
                <Link to={`${baseURL}/preferences`} {...linkProps}>
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
