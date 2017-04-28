import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'
import {Link, browserHistory, withRouter} from 'react-router'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
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
            message_type: type = 'info'
        } = this.props.location.query

        if (message) {
            this.props.notify({
                type,
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
                <b><a href="https://smooch.io/" target="_blank">Smooch</a></b> is a messaging platform which enables
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

            const editLink = `/app/integrations/smooch/${int.get('id')}`
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td className="align-middle">
                        <Link to={editLink}>
                            <b>{int.get('name')}</b>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleCheckbox
                            input={{
                                onChange: toggleIntegration,
                                value: !isDisabled,
                            }}
                        />
                    </td>
                    <td className="smallest">
                        <div className="pull-right">
                            <Button
                                tag={Link}
                                color="info"
                                to={editLink}
                            >
                                Edit
                            </Button>
                        </div>
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
