import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {Button, Card, CardBody, Col, Row, UncontrolledTooltip} from 'reactstrap'
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
        isTrialing: PropTypes.bool.isRequired,
        currentUserId: PropTypes.number.isRequired,
        currentAccountDomain: PropTypes.string.isRequired,
        shopifyBillingStatus: PropTypes.string,
        shouldPayWithShopify: PropTypes.bool,
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
        const labelPadding = 8
        let creditCardLabel = (
            <div style={{paddingTop: labelPadding}}>No credit card registered</div>
        )

        if (!creditCard.isEmpty()) {
            creditCardLabel = (
                <div style={{paddingTop: labelPadding}}>
                    <span>{creditCard.get('brand')} ending in <strong>{creditCard.get('last4')} </strong></span>
                    <span>will expire on <em>{creditCard.get('exp_month')}/{creditCard.get('exp_year')}</em></span>
                </div>
            )
        }

        return (
            <Card>
                <CardBody>
                    <Row>
                        <Col sm={4}>{creditCardLabel}</Col>
                        <Col
                            sm={{size: 4, offset: 4}}
                            className="text-right"
                        >
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
                                            Add credit card
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
                                        Update credit card
                                    </Button>
                                )
                            }
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        )
    }

    _onActivateShopifyBilling = () => {
        const {currentUserId, currentAccountDomain} = this.props

        segmentTracker.logEvent(segmentTracker.EVENTS.PAYMENT_METHOD_ADD_CLICKED, {
            payment_method: 'shopify',
            user_id: currentUserId,
            account_domain: currentAccountDomain
        })
        this.setState({isActivatingShopifyBilling: true})
    }

    _renderShopify() {
        const {currentPlan, shopifyBillingStatus, subscription} = this.props
        const {isActivatingShopifyBilling} = this.state
        const hasNoSubscription = subscription.isEmpty()
        let content = null

        switch (shopifyBillingStatus) {
            case 'active':
                content = (
                    <p className="mt-2 mb-2">
                        <i className="material-icons text-success md-2">check_circle</i>
                        {' '}
                        Payment with Shopify is active. You're all set.
                    </p>
                )
                break
            case 'canceled':
                content = (
                    <div>
                        <i className="material-icons text-warning md-2">warning</i>
                        {' '}

                        Billing with Shopify is inactive. Please reactivate to avoid account cancellation.
                        {' '}
                        <Button
                            tag="a"
                            color="success"
                            href="/integrations/shopify/billing/activate/"
                            onClick={() => {
                                this.setState({isActivatingShopifyBilling: true})
                            }}
                            className={classNames('float-right', {'btn-loading': isActivatingShopifyBilling})}
                        >
                            Reactivate billing with Shopify
                        </Button>
                    </div>
                )
                break

            case 'inactive': {
                const amount = currentPlan.get('amount')
                let buttonLabel = 'Activate billing with Shopify'

                if (amount && amount !== 0) {
                    buttonLabel += ` and pay ${currentPlan.get('currencySign')}${amount}`
                }

                content = (
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
                break
            }
        }

        return (
            <Card>
                <CardBody>{content}</CardBody>
            </Card>
        )
    }

    render() {
        const {paymentMethod, isTrialing, shouldPayWithShopify} = this.props

        if (this.state.isLoading) {
            return <Loader/>
        }

        if (isTrialing && !shouldPayWithShopify) {
            return null
        }

        return (
            <div className="mb-5">
                <h4><i className="material-icons">credit_card</i> Payment method</h4>
                {paymentMethod === 'stripe' ? this._renderStripe() : this._renderShopify()}
            </div>
        )
    }
}

export default connect((state) => {
    return {
        currentUserId: state.currentUser.get('id'),
        currentAccountDomain: state.currentAccount.get('domain'),
        creditCard: billingSelectors.creditCard(state),
        subscription: currentAccountSelectors.getCurrentSubscription(state),
        currentPlan: billingSelectors.currentPlan(state),
        paymentMethod: currentAccountSelectors.paymentMethod(state),
        shopifyBillingStatus: currentAccountSelectors.getShopifyBillingStatus(state),
        shouldPayWithShopify: currentAccountSelectors.shouldPayWithShopify(state),
        paymentIsActive: currentAccountSelectors.paymentIsActive(state),
        isTrialing: currentAccountSelectors.isTrialing(state),
    }
}, {fetchPaymentMethod, fetchCreditCard})(BillingPaymentMethod)
