import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {Button} from 'reactstrap'
import * as billingSelectors from '../../../state/billing/selectors'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import {fetchPaymentMethod, fetchCreditCard} from '../../../state/billing/actions'
import Loader from '../../common/components/Loader'
import * as segmentTracker from '../../../store/middlewares/segmentTracker'

export class BillingPaymentMethod extends Component {
    static propTypes = {
        fetchPaymentMethod: PropTypes.func.isRequired,
        fetchCreditCard: PropTypes.func.isRequired,
        creditCard: PropTypes.object.isRequired,
        paymentMethod: PropTypes.string.isRequired,
        paymentIsActive: PropTypes.bool.isRequired,
        currentUserId: PropTypes.number.isRequired,
        currentAccountId: PropTypes.number.isRequired,
    }

    state = {
        isLoading: false,
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
        const {creditCard} = this.props

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
                        <Button
                            tag={Link}
                            color="success"
                            to="/app/settings/billing/add-credit-card"
                        >
                            Add Credit Card
                        </Button>
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

    _renderShopify() {
        const {paymentIsActive, currentUserId, currentAccountId} = this.props
        return (
            <div>
                {paymentIsActive ? (
                    <p className="mt-2 mb-2">Payment with Shopify activated.</p>
                ) : (
                    <Button
                        tag="a"
                        color="success"
                        href="/integrations/shopify/billing/activate/"
                        onClick={() => segmentTracker.logEvent(segmentTracker.EVENTS.PAYMENT_METHOD_ADDED, {
                            payment_method: 'shopify',
                            user_id: currentUserId,
                            account_id: currentAccountId
                        })}
                    >
                        Activate billing with Shopify
                    </Button>
                )}
            </div>
        )
    }

    render() {
        const {paymentMethod} = this.props

        if (this.state.isLoading) {
            return <Loader />
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
        paymentMethod: currentAccountSelectors.paymentMethod(state),
        paymentIsActive: currentAccountSelectors.paymentIsActive(state),
    }
}, {fetchPaymentMethod, fetchCreditCard})(BillingPaymentMethod)
