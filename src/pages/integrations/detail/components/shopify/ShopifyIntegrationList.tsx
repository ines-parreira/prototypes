import React, {Component, ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Map, List} from 'immutable'

import Button from 'pages/common/components/button/Button'
import {IntegrationType} from 'models/integration/constants'

import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
    redirectUri: string
}

export default class ShopifyIntegrationList extends Component<Props> {
    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <div>
                <p>
                    Shopify is an e-commerce platform used by 500,000+ stores.
                </p>

                <p>How Gorgias works with Shopify:</p>
                <ul>
                    <li>
                        See Shopify profiles, orders & shipping status next to
                        support tickets
                    </li>
                    <li>
                        Edit orders, issue refunds, etc. directly from support
                        conversations
                    </li>
                    <li>
                        Search customers by order number, shipping address...
                        and match anonymous chat tickets with existing Shopify
                        customers
                    </li>
                </ul>

                <h4 className="mt-5">Your Shopify stores</h4>
            </div>
        )
        const isSubmitting: boolean = loading.get('updateIntegration')

        const integrationToItemDisplay: (
            integration: Map<any, any>
        ) => ReactNode = (integration) => {
            const active = !integration.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === integration.get('id')
            const editLink = `/app/settings/integrations/shopify/${
                integration.get('id') as string
            }`
            const activateIntegration = () => {
                const IntegrationName = integration.get('name')
                window.location.href = this.props.redirectUri.replace(
                    '{shop_name}',
                    IntegrationName
                )
            }
            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle p-0">
                        <div>
                            {!active && (
                                <Button
                                    onClick={activateIntegration}
                                    isLoading={isRowSubmitting}
                                >
                                    Reactivate
                                </Button>
                            )}
                        </div>
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType={IntegrationType.Shopify}
                integrations={
                    integrations.filter(
                        (v) => v!.get('type') === 'shopify'
                    ) as List<Map<any, any>>
                }
                createIntegration={() =>
                    window.open('https://apps.shopify.com/helpdesk')
                }
                createIntegrationButtonContent="Add Shopify"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
