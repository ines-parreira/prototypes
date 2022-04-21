import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {parse} from 'qs'
import {List, Map} from 'immutable'

import * as integrationsActions from 'state/integrations/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {IntegrationType} from 'models/integration/types'
import ToggleInput from 'pages/common/forms/ToggleInput'

import history from '../../../../history'

import IntegrationList from '../IntegrationList'
import ForwardIcon from '../../../common/components/ForwardIcon'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
    redirectUri: string
} & RouteComponentProps &
    ConnectedProps<typeof connector>

export class SmoochIntegrationList extends Component<Props> {
    _onLogin = () => {
        window.location.href = this.props.redirectUri
    }

    componentDidMount() {
        // display message from url
        const {message, message_type: status = NotificationStatus.Info} = parse(
            this.props.location.search,
            {ignoreQueryPrefix: true}
        ) as {message: string; message_type: NotificationStatus}

        if (message) {
            void this.props.notify({
                status,
                title: message.replace(/\+/g, ' '),
            })
            // remove error from url
            history.push(window.location.pathname)
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
                </b>{' '}
                is a messaging platform which enables you to interact with your
                customers across multiple channels, and to build your own bot.
                You can use Gorgias as an interface for your team to respond to
                Smooch conversations.
                <br />
                <br />
                You can connect your own Smooch account to Gorgias. When a
                customer initiates a conversation through Smooch, it will create
                a chat in Gorgias and send a notification.
            </div>
        )

        const integrationToItemDisplay = (int: Map<any, any>) => {
            const toggleIntegration = (value: boolean) => {
                const integrationId = int.get('id')
                return value
                    ? this.props.activate(integrationId)
                    : this.props.deactivate(integrationId)
            }

            const editLink = `/app/settings/integrations/smooch/${
                int.get('id') as number
            }/overview`
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td className="smallest align-middle">
                        <ToggleInput
                            isToggled={!isDisabled}
                            onClick={toggleIntegration}
                        />
                    </td>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{int.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType={IntegrationType.Smooch}
                longTypeDescription={longTypeDescription}
                integrations={
                    integrations.filter(
                        (v) => v!.get('type') === IntegrationType.Smooch
                    ) as List<Map<any, any>>
                }
                createIntegration={this._onLogin}
                createIntegrationButtonContent="Add a Smooch account"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

const connector = connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
    notify,
})

export default withRouter(connector(SmoochIntegrationList))
