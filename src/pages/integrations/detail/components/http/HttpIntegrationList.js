import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import {Badge, Button} from 'reactstrap'
import _truncate from 'lodash/truncate'

import IntegrationList from '../IntegrationList'

export default class HttpIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props
        const longTypeDescription = (
            <div>
                <p>
                    HTTP integrations allow you to connect any application to Gorgias. For example, when a customer
                    creates a ticket, you can fetch their last orders from your back-office app, and display them
                    next to the ticket.
                </p>
                <p>
                    <a
                        href="http://help.gorgias.io/en/latest/src/helpdesk/01-integrations.html#your-custom-back-office-app"
                        target="_blank"
                    >
                        Learn more
                    </a> about how to connect apps in our docs, or contact our support through the chat.
                </p>
            </div>
        )

        const isSubmitting = loading.get('updateIntegration')

        const integrationToItemDisplay = (int) => {
            const active = !int.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === int.get('id')
            const isDisabled = int.get('deactivated_datetime')

            const editLink = `/app/integrations/http/${int.get('id')}`

            let primaryBtn = (
                <Button
                    tag={Link}
                    color="info"
                    to={editLink}
                >
                    Edit
                </Button>
            )

            let rmBtn = (
                <Button
                    color="warning"
                    outline
                    className={classNames('ml-2', {
                        'btn-loading': isRowSubmitting,
                    })}
                    disabled={isRowSubmitting}
                    onClick={() => actions.deactivateIntegration(int)}
                >
                    Deactivate
                </Button>
            )

            if (!active) {
                primaryBtn = (
                    <Button
                        color="success"
                        className={classNames('mr-2', {
                            'btn-loading': isRowSubmitting,
                        })}
                        disabled={isRowSubmitting}
                        onClick={() => actions.activateIntegration(int)}
                    >
                        Re-activate
                    </Button>
                )

                rmBtn = (
                    <Button
                        color="danger"
                        outline
                        onClick={() => actions.deleteIntegration(int)}
                    >
                        Delete
                    </Button>
                )
            }

            return (
                <tr key={int.get('id')}>
                    <td style={{verticalAlign: 'middle'}}>
                        <Link to={editLink}>
                            <b>{int.get('name')}</b>
                        </Link>
                        {' '}
                        <span className="text-faded ml-3">
                            {_truncate(int.get('description'), {length: 100})}
                        </span>

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
                            {primaryBtn}
                            {rmBtn}
                        </div>
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="http"
                integrations={integrations.filter((v) => v.get('type') === 'http')}
                longTypeDescription={longTypeDescription}
                createIntegration={() => browserHistory.push('/app/integrations/http/new')}
                createIntegrationButtonText="Add HTTP integration"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

HttpIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
