import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions'

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class ShopifyIntegrationList extends React.Component {
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
                <p>Shopify is an e-commerce platform. Connect your Shopify store to Gorgias and:</p>

                <ul>
                    <li>
                        Display <b>Shopify profiles and orders</b> next to support tickets
                    </li>
                    <li>
                        <b>Edit orders, issue refunds</b>, etc. directly from support conversations
                    </li>
                    <li>
                        <b>Sync all your Shopify customers</b> in Gorgias. This way, if a customer contacts you on
                        Facebook, you can match them with the Shopify customer in your records.
                    </li>
                </ul>

                <p>
                    You can <b>connect multiple Shopify stores</b>.
                </p>
            </div>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')
            const editLink = `/app/integrations/shopify/${int.get('id')}`

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
                longTypeDescription={longTypeDescription}
                integrationType="shopify"
                integrations={integrations.filter((v) => v.get('type') === 'shopify')}
                createIntegration={() => browserHistory.push('/app/integrations/shopify/new')}
                createIntegrationButtonText="Add Shopify"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
