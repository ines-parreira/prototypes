// @flow
import React from 'react'
import {type Map, type List} from 'immutable'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'

import {Button} from 'reactstrap'

import ConfirmButton from '../../../../common/components/ConfirmButton.tsx'
import {MAGENTO2_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'
import history from '../../../../history.ts'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<*, *>>,
    loading: Map<*, *>,
    actions: {
        updateOrCreateIntegration: (
            integration: Map<string, any>
        ) => Promise<void>,
    },
    redirectUri: string,
}

export class Magento2IntegrationList extends React.Component<Props> {
    _onReactivateOneClick = (
        integration: List<Map<*, *>>,
        redirectUri: string
    ) => {
        const adminUrlSuffix = integration.getIn(['meta', 'admin_url_suffix'])
        const url = integration.getIn(['meta', 'store_url'])
        window.location.href = redirectUri.concat(
            `?store_url=${url}&admin_url_suffix=${adminUrlSuffix}`
        )
    }

    render() {
        const {integrations, loading, redirectUri} = this.props

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
            const editLink = `/app/settings/integrations/magento2/${integration.get(
                'id'
            )}`
            const isSubmitting = loading.get('updateIntegration')
            const isDisabled = integration.get('deactivated_datetime')
            const isManual = integration.getIn(['meta', 'is_manual'])
            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    {isDisabled && !isManual ? (
                        <td className="smallest align-middle">
                            <ConfirmButton
                                color="success"
                                loading={isSubmitting}
                                content="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                                confirm={() =>
                                    this._onReactivateOneClick(
                                        integration,
                                        redirectUri
                                    )
                                }
                            >
                                Reconnect
                            </ConfirmButton>
                        </td>
                    ) : null}
                    {isDisabled && isManual ? (
                        <td className="smallest align-middle">
                            <Button color="success" href={editLink}>
                                Reconnect
                            </Button>
                        </td>
                    ) : null}

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
                    history.push('/app/settings/integrations/magento2/new')
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
})(Magento2IntegrationList)
