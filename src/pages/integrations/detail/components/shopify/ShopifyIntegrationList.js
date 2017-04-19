import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {Badge, Button} from 'reactstrap'
import classNames from 'classnames'

import IntegrationList from '../IntegrationList'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'

class ShopifyIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props

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
        const isSubmitting = loading.get('updateIntegration')

        const integrationToItemDisplay = (int) => {
            const active = !int.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === int.get('id')
            const isDisabled = int.get('deactivated_datetime')

            const editLink = `/app/integrations/shopify/${int.get('id')}`

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

ShopifyIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    hasIntegration: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => ({
    hasIntegration: !integrationsSelectors.getIntegrationsByTypes('shopify')(state).isEmpty(),
})

export default connect(mapStateToProps)(ShopifyIntegrationList)
