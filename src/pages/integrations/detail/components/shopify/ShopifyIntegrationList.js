import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'

@connect((state) => {
    return {
        hasIntegration: !integrationsSelectors.getIntegrationsByTypes('shopify')(state).isEmpty(),
    }
}, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class ShopifyIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        hasIntegration: PropTypes.bool.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <div>
                <p>Shopify is an e-commerce platform. By connecting your Shopify store to Gorgias, you can:</p>

                <ul>
                    <li>See Shopify profile and orders & shipping status next to support tickets</li>
                    <li>Edit orders, issue refunds, etc. directly from support conversations</li>
                    <li>Search users by order number, shipping address and match anonymous chat tickets with existing
                        Shopify customers
                    </li>
                </ul>
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
                createIntegrationButtonHidden={this.props.hasIntegration}
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
