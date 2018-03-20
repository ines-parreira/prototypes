import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link, browserHistory, withRouter} from 'react-router'

import ToggleButton from '../../../../common/components/ToggleButton'
import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions'
import {notify} from '../../../../../state/notifications/actions'

@withRouter
@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
    notify,
})
export default class SmoochIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        notify: PropTypes.func.isRequired,
        redirectUri: PropTypes.string.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    _onLogin = () => {
        window.location.href = this.props.redirectUri
    }

    componentDidMount() {
        // display message from url
        const {
            message,
            message_type: status = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                status,
                title: message.replace(/\+/g, ' ')
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <div>
                <b>
                    <a
                        href="https://smooch.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Smooch
                    </a>
                </b> is a messaging platform which enables
                you to interact with your customers across multiple channels, and to build your own bot. You can use
                Gorgias as an interface for your team to respond to Smooch conversations.
                <br /><br />
                You can connect your own Smooch account to Gorgias. When a customer initiates a conversation through
                Smooch, it will create a chat in Gorgias and send a notification.
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const editLink = `/app/settings/integrations/smooch/${int.get('id')}/overview`
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{int.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleButton
                            value={!isDisabled}
                            onChange={toggleIntegration}
                        />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="smooch"
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter((v) => v.get('type') === 'smooch')}
                createIntegration={this._onLogin}
                createIntegrationButtonText="Add my Smooch"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
