import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import _truncate from 'lodash/truncate'

import ToggleButton from '../../../../common/components/ToggleButton'
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
                        href="http://docs.gorgias.io/integrations/http-integrations#Connecting_your_own_back-office"
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
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b className="mr-2">{int.get('name')}</b>
                                <span className="text-faded hidden-sm-down">
                                    {_truncate(int.get('description'), {length: 100})}
                                </span>
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
