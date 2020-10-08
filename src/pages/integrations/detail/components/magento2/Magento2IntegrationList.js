// @flow
import React from 'react'
import {type Map, type List} from 'immutable'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'

import {MAGENTO2_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'
import ToggleButton from '../../../../common/components/ToggleButton'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<*, *>>,
    loading: Map<*, *>,
    activate: (number) => Promise<*>,
    deactivate: (number) => Promise<*>,
}

export class Magento2IntegrationList extends React.Component<Props> {
    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <div>
                <p>
                    Magento 2 is an e-commerce platform used by 200,000+ stores.
                </p>

                <p>How Gorgias works with Magento 2:</p>
                <ul>
                    <li>
                        See Magento 2 profiles, orders & shipping status next to
                        support tickets
                    </li>
                    {/*
                        todo(@martin): uncomment when doing Magento2 improvements
                        <li>
                            Edit orders, issue refunds, etc. directly from support conversations
                        </li>
                        */}
                    <li>
                        Search customers by order number, shipping address...
                        and match anonymous chat tickets with existing Magento 2
                        customers
                    </li>
                </ul>

                <h4>Your Magento 2 stores</h4>
            </div>
        )

        const integrationToItemDisplay = (integration) => {
            const toggleIntegration = (value) => {
                const integrationId = integration.get('id')
                return value
                    ? this.props.activate(integrationId)
                    : this.props.deactivate(integrationId)
            }

            const isDisabled = integration.get('deactivated_datetime')
            const editLink = `/app/settings/integrations/magento2/${integration.get(
                'id'
            )}`

            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleButton
                            value={!isDisabled}
                            onChange={toggleIntegration}
                        />
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        const magento2Integrations = integrations.filter(
            (integration) =>
                integration.get('type') === MAGENTO2_INTEGRATION_TYPE
        )

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType={MAGENTO2_INTEGRATION_TYPE}
                integrations={magento2Integrations}
                createIntegration={() =>
                    browserHistory.push(
                        '/app/settings/integrations/magento2/new'
                    )
                }
                createIntegrationButtonContent="Add Magento 2 store"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

export default connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})(Magento2IntegrationList)
