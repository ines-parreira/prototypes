import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classnames from 'classnames'
import {Badge, Button} from 'reactstrap'

import IntegrationList from '../IntegrationList'

export default class SmoochIntegrationList extends React.Component {
    _onLogin = () => {
        window.location.href = this.props.redirectUri
    }

    render() {
        const {integrations, actions, loading} = this.props

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
            const editLink = `/app/integrations/smooch/${int.get('id')}`
            const isLoading = int.get('id') === loading.get('delete')
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td style={{verticalAlign: 'middle'}}>
                        <Link to={editLink}>
                            <b>{int.get('name')}</b>
                        </Link>
                    </td>
                    <td
                        className="smallest"
                        style={{verticalAlign: 'middle'}}
                    >
                        {
                            isDisabled ? (
                                    <Badge color="warning">
                                        Disabled
                                    </Badge>
                                ) : (
                                    <Badge color="success">
                                        Enabled
                                    </Badge>
                                )
                        }
                    </td>
                    <td className="smallest">
                        <div className="pull-right">
                            <Button
                                tag={Link}
                                color="info"
                                className="mr-2"
                                disabled={isLoading}
                                to={editLink}
                            >
                                Edit
                            </Button>
                            <Button
                                color="danger"
                                outline
                                className={classnames({
                                    'btn-loading': isLoading,
                                })}
                                disabled={isLoading}
                                onClick={() => !isLoading && actions.deleteIntegration(int)}
                            >
                                Delete
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

SmoochIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    redirectUri: PropTypes.string.isRequired
}
