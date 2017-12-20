import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {Button, UncontrolledTooltip} from 'reactstrap'
import * as billingSelectors from '../../../state/billing/selectors'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import {fetchPaymentMethod, fetchCreditCard} from '../../../state/billing/actions'
import Loader from '../../common/components/Loader'
import * as segmentTracker from '../../../store/middlewares/segmentTracker'
import classNames from 'classnames'

export class BillingPaymentMethod extends Component {
    static propTypes = {
        currentPlan: PropTypes.object.isRequired,
        fetchPaymentMethod: PropTypes.func.isRequired,
        fetchCreditCard: PropTypes.func.isRequired,
        creditCard: PropTypes.object.isRequired,
        paymentMethod: PropTypes.string.isRequired,
        paymentIsActive: PropTypes.bool.isRequired,
        currentUserId: PropTypes.number.isRequired,
        currentAccountId: PropTypes.number.isRequired,
        shopifyBillingStatus: PropTypes.string,
        subscription: PropTypes.object.isRequired,
    }

    state = {
        isLoading: false,
        isActivatingShopifyBilling: false
    }

    componentWillMount() {
        this.setState({isLoading: true})
        this.props.fetchPaymentMethod().then(() => {
            this.props.fetchCreditCard().then(() => {
                this.setState({isLoading: false})
            })
        })
    }

    _renderStripe() {
        const {creditCard, subscription} = this.props
        const hasNoSubscription = subscription.isEmpty()
        let creditCardLabel = 'No credit card registered'

        if (!creditCard.isEmpty()) {
            creditCardLabel = (
                <span>
                    {creditCard.get('brand')} ending in <strong>{creditCard.get('last4')} </strong>
                    and expiring on <em>{creditCard.get('exp_month')}/{creditCard.get('exp_year')}</em>
                </span>
            )
        }

        return (
            <div>
                <p className="mt-2 mb-2">{creditCardLabel}</p>
                {
                    creditCard.isEmpty() ? (
                        <div
                            id="add-credit-card-button"
                            style={{
                                display: 'inline-block'
                            }}
                        >
                            <Button
                                tag={Link}
                                color="success"
                                to="/app/settings/billing/add-credit-card"
                                disabled={hasNoSubscription}
                            >
                                Add Credit Card
                            </Button>
                            {
                                hasNoSubscription ? (
                                    <UncontrolledTooltip
                                        placement="top"
                                        target="add-credit-card-button"
                                    >
                                        Select a plan before adding a credit card
                                    </UncontrolledTooltip>
                                ) : null
                            }
                        </div>
                    ) : (
                        <Button
                            tag={Link}
                            to="/app/settings/billing/update-credit-card"
                        >
                            Update Credit Card
                        </Button>
                    )
                }
            </div>
        )
    }

    _onActivateShopifyBilling = () => {
        const {currentUserId, currentAccountId} = this.props

        segmentTracker.logEvent(segmentTracker.EVENTS.PAYMENT_METHOD_ADDED, {
            payment_method: 'shopify',
            user_id: currentUserId,
            account_id: currentAccountId
        })
        this.setState({isActivatingShopifyBilling: true})
    }

    _renderShopify() {
        const {currentPlan, shopifyBillingStatus, subscription} = this.props
        const {isActivatingShopifyBilling} = this.state
        const hasNoSubscription = subscription.isEmpty()

        switch (shopifyBillingStatus) {
            case 'active':
                return (
                    <p className="mt-2 mb-2">
                        Payment with Shopify activated.
                    </p>
                )
            case 'canceled':
                return (
                    <Button
                        tag="a"
                        color="success"
                        href="/integrations/shopify/billing/activate/"
                        onClick={() => {
                            this.setState({isActivatingShopifyBilling: true})
                        }}
                        className={classNames({'btn-loading': isActivatingShopifyBilling})}
                    >
                        Reactivate billing with Shopify
                    </Button>
                )

            case 'inactive': {
                const amount = currentPlan.get('amount')
                let buttonLabel = 'Activate billing with Shopify'

                if (amount && amount !== 0) {
                    buttonLabel += ` and pay ${currentPlan.get('currencySign')}${amount}`
                }

                return (
                    <div
                        id="activate-shopify-billing-button"
                        style={{
                            display: 'inline-block'
                        }}
                    >
                        <Button
                            tag="a"
                            color="success"
                            href="/integrations/shopify/billing/activate/"
                            onClick={this._onActivateShopifyBilling}
                            className={classNames({'btn-loading': isActivatingShopifyBilling})}
                            disabled={hasNoSubscription}
                        >
                            {buttonLabel}
                        </Button>
                        {
                            hasNoSubscription ? (
                                <UncontrolledTooltip
                                    placement="top"
                                    target="activate-shopify-billing-button"
                                >
                                    Select a plan before activating Shopify billing
                                </UncontrolledTooltip>
                            ) : null
                        }
                    </div>
                )
            }
        }
    }

    render() {
        const {paymentMethod} = this.props

        if (this.state.isLoading) {
            return <Loader/>
        }

        return (
            <div className="mb-5">
                <h4>Payment method</h4>
                {paymentMethod === 'stripe' ? this._renderStripe() : this._renderShopify()}
            </div>
        )
    }
}

export default connect((state) => {
    return {
        currentUserId: state.currentUser.get('id'),
        currentAccountId: state.currentAccount.get('id'),
        creditCard: billingSelectors.creditCard(state),
        subscription: currentAccountSelectors.getCurrentSubscription(state),
        currentPlan: billingSelectors.currentPlan(state),
        paymentMethod: currentAccountSelectors.paymentMethod(state),
        shopifyBillingStatus: currentAccountSelectors.getShopifyBillingStatus(state),
        paymentIsActive: currentAccountSelectors.paymentIsActive(state),
    }
}, {fetchPaymentMethod, fetchCreditCard})(BillingPaymentMethod)
