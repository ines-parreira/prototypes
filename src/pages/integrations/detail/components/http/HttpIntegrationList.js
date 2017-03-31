import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
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

            const rowClasses = classNames({
                deactivated: !active
            })

            const editLink = `/app/integrations/http/${int.get('id')}`

            let primaryBtn = (
                <button
                    className="ui basic light blue button"
                    onClick={() => browserHistory.push(editLink)}
                >
                    Edit
                </button>

            )

            let rmBtn = (
                <button
                    className={classNames('ui basic light orange button', {
                        'loading disabled': isRowSubmitting
                    })}
                    onClick={() => !isRowSubmitting && actions.deactivateIntegration(int)}
                >
                    Deactivate
                </button>
            )

            if (!active) {
                primaryBtn = (
                    <button
                        className={classNames('ui basic light blue button', {
                            'loading disabled': isRowSubmitting
                        })}
                        onClick={() => !isRowSubmitting && actions.activateIntegration(int)}
                    >
                        Re-Activate
                    </button>
                )

                rmBtn = (
                    <button
                        className="ui basic light red button"
                        onClick={() => actions.deleteIntegration(int)}
                    >
                        Delete
                    </button>
                )
            }

            return (
                <tr key={int.get('id')} className={rowClasses}>
                    <td>
                        <div className="ui header">
                            <Link className="subject" to={editLink}>
                                {int.get('name')}
                            </Link>
                            <div className="body sub header">
                                {int.get('description')}
                            </div>
                        </div>
                    </td>
                    <td className="eight wide column">
                        <div className="floated right">
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
