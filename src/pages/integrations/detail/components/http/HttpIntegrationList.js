import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'
import _truncate from 'lodash/truncate'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions'

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class HttpIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    render() {
        const {integrations, loading} = this.props
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

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')

            const editLink = `/app/integrations/http/${int.get('id')}`

            return (
                <tr key={int.get('id')}>
                    <td className="align-center align-middle">
                        <Link to={editLink}>
                            <b>{int.get('name')}</b>
                        </Link>
                        {' '}
                        <span className="text-faded ml-3">
                            {_truncate(int.get('description'), {length: 100})}
                        </span>
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
