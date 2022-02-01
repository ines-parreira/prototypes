import React, {Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Button, Card, CardBody, Col, Row, UncontrolledTooltip} from 'reactstrap'
import classnames from 'classnames'

import {
    creditCard,
    DEPRECATED_getCurrentPlan,
} from '../../../state/billing/selectors'
import {
    getCurrentSubscription,
    paymentMethod,
    getShopifyBillingStatus,
} from '../../../state/currentAccount/selectors'
import {ShopifyBillingStatus} from '../../../state/currentAccount/types'
import {
    fetchPaymentMethod,
    fetchCreditCard,
} from '../../../state/billing/actions'
import Loader from '../../common/components/Loader/Loader'
import {logEvent, SegmentEvent} from '../../../store/middlewares/segmentTracker'
import {RootState} from '../../../state/types'
import {PaymentMethodType} from '../../../state/billing/types'

import css from './BillingPaymentMethod.less'
import BillingHeader from './common/BillingHeader'

type State = {
    isLoading: boolean
    isActivatingShopifyBilling: boolean
}

export class BillingPaymentMethodContainer extends Component<
    ConnectedProps<typeof connector>,
    State
> {
    state = {
        isLoading: false,
        isActivatingShopifyBilling: false,
    }

    componentWillMount() {
        const {fetchPaymentMethod, fetchCreditCard} = this.props

        this.setState({isLoading: true})
        void fetchPaymentMethod().then(() => {
            void fetchCreditCard().then(() => {
                this.setState({isLoading: false})
            })
        })
    }

    renderStripe() {
        const {creditCard, subscription} = this.props
        const hasNoSubscription = subscription.isEmpty()
        let creditCardLabel: ReactNode = 'No credit card registered'

        if (!creditCard.isEmpty()) {
            creditCardLabel = (
                <span className={css.cardLabel}>
                    {creditCard.get('brand')} ending with{' '}
                    <strong>{creditCard.get('last4')}</strong>
                </span>
            )
        }

        return (
            <Card>
                <CardBody>
                    <Row>
                        <Col className={css.content} sm={8}>
                            {creditCardLabel}
                        </Col>
                        <Col sm={4} className="text-right">
                            {creditCard.isEmpty() ? (
                                <div
                                    id="add-payment-method-button"
                                    style={{
                                        display: 'inline-block',
                                    }}
                                >
                                    <Button
                                        tag={Link}
                                        color="success"
                                        to="/app/settings/billing/add-payment-method"
                                        disabled={hasNoSubscription}
                                    >
                                        Add Payment Method
                                    </Button>
                                    {hasNoSubscription ? (
                                        <UncontrolledTooltip
                                            placement="top"
                                            target="add-payment-method-button"
                                        >
                                            Select a plan before adding a credit
                                            card
                                        </UncontrolledTooltip>
                                    ) : null}
                                </div>
                            ) : (
                                <Button
                                    tag={Link}
                                    to="/app/settings/billing/change-credit-card"
                                >
                                    Change Card
                                </Button>
                            )}
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        )
    }

    onActivateShopifyBilling = () => {
        const {currentUserId, currentAccountDomain} = this.props

        logEvent(SegmentEvent.PaymentMethodAddClicked, {
            payment_method: 'shopify',
            user_id: currentUserId,
            account_domain: currentAccountDomain,
        })
        this.setState({isActivatingShopifyBilling: true})
    }

    renderShopify() {
        const {currentPlan, shopifyBillingStatus, subscription} = this.props
        const {isActivatingShopifyBilling} = this.state
        const hasNoSubscription = subscription.isEmpty()
        let content = null

        switch (shopifyBillingStatus) {
            case ShopifyBillingStatus.Active:
                content = (
                    <div className={css.content}>
                        <i
                            className={classnames(
                                css.statusIcon,
                                'material-icons text-success md-2'
                            )}
                        >
                            check_circle
                        </i>{' '}
                        Payment with Shopify is active. You're all set.
                    </div>
                )
                break
            case ShopifyBillingStatus.Canceled:
                content = (
                    <div className={css.content}>
                        <i
                            className={classnames(
                                css.statusIcon,
                                'material-icons text-warning md-2'
                            )}
                        >
                            warning
                        </i>{' '}
                        Billing with Shopify is inactive. Please reactivate to
                        avoid account cancellation.{' '}
                        <Button
                            tag="a"
                            color="success"
                            href="/integrations/shopify/billing/activate/"
                            onClick={() => {
                                this.setState({
                                    isActivatingShopifyBilling: true,
                                })
                            }}
                            className={classnames('float-right', {
                                'btn-loading': isActivatingShopifyBilling,
                            })}
                        >
                            Reactivate billing with Shopify
                        </Button>
                    </div>
                )
                break

            case ShopifyBillingStatus.Inactive: {
                const amount = currentPlan.get('amount')
                let buttonLabel = 'Activate billing with Shopify'

                if (amount && amount !== 0) {
                    buttonLabel += ` and pay ${
                        currentPlan.get('currencySign') as string
                    }${amount as string}`
                }

                content = (
                    <div
                        id="activate-shopify-billing-button"
                        style={{
                            display: 'inline-block',
                        }}
                    >
                        <Button
                            tag="a"
                            color="success"
                            href="/integrations/shopify/billing/activate/"
                            onClick={this.onActivateShopifyBilling}
                            className={classnames({
                                'btn-loading': isActivatingShopifyBilling,
                            })}
                            disabled={hasNoSubscription}
                        >
                            {buttonLabel}
                        </Button>
                        {hasNoSubscription ? (
                            <UncontrolledTooltip
                                placement="top"
                                target="activate-shopify-billing-button"
                            >
                                Select a plan before activating Shopify billing
                            </UncontrolledTooltip>
                        ) : null}
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
        const {paymentMethod} = this.props
        const {isLoading} = this.state

        if (isLoading) {
            return <Loader />
        }

        return (
            <div className={css.wrapper}>
                <BillingHeader icon="credit_card">Payment method</BillingHeader>
                {paymentMethod === PaymentMethodType.Stripe
                    ? this.renderStripe()
                    : this.renderShopify()}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            currentUserId: state.currentUser.get('id'),
            currentAccountDomain: state.currentAccount.get('domain'),
            creditCard: creditCard(state),
            subscription: getCurrentSubscription(state),
            currentPlan: DEPRECATED_getCurrentPlan(state),
            paymentMethod: paymentMethod(state),
            shopifyBillingStatus: getShopifyBillingStatus(state),
        }
    },
    {fetchPaymentMethod, fetchCreditCard}
)

export default connector(BillingPaymentMethodContainer)
