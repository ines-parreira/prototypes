import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import IntegrationList from '../IntegrationList'
import classNames from 'classnames'
import {connect} from 'react-redux'
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

            const rowClasses = classNames({
                deactivated: !active
            })

            const editLink = `/app/integrations/shopify/${int.get('id')}`

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
