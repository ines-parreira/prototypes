import React, {Component, ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link} from 'react-router-dom'
import {Card, CardBody, Col, Row, UncontrolledTooltip} from 'reactstrap'
import classnames from 'classnames'

import {creditCard, DEPRECATED_getCurrentPlan} from 'state/billing/selectors'
import {
    getCurrentSubscription,
    getShopifyBillingStatus,
    paymentMethod,
} from 'state/currentAccount/selectors'
import {ShopifyBillingStatus} from 'state/currentAccount/types'
import {fetchCreditCard, fetchPaymentMethod} from 'state/billing/actions'
import Loader from 'pages/common/components/Loader/Loader'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {RootState} from 'state/types'
import {PaymentMethodType} from 'state/billing/types'
import Button from 'pages/common/components/button/Button'

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
                                    <Link
                                        to="/app/settings/billing/add-payment-method"
                                        className={classnames({
                                            [css.disabledLink]:
                                                hasNoSubscription,
                                        })}
                                    >
                                        <Button isDisabled={hasNoSubscription}>
                                            Add payment method
                                        </Button>
                                    </Link>
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
                                <Link to="/app/settings/billing/change-credit-card">
                                    <Button intent="secondary">
                                        Change card
                                    </Button>
                                </Link>
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
                        <a
                            href="/integrations/shopify/billing/activate/"
                            className={classnames('float-right', {
                                [css.disabledLink]: isActivatingShopifyBilling,
                            })}
                        >
                            <Button
                                isLoading={isActivatingShopifyBilling}
                                onClick={() => {
                                    this.setState({
                                        isActivatingShopifyBilling: true,
                                    })
                                }}
                            >
                                Reactivate billing with Shopify
                            </Button>
                        </a>
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
                        <a
                            href="/integrations/shopify/billing/activate/"
                            className={classnames({
                                [css.disabledLink]:
                                    isActivatingShopifyBilling ||
                                    hasNoSubscription,
                            })}
                        >
                            <Button
                                onClick={this.onActivateShopifyBilling}
                                isLoading={isActivatingShopifyBilling}
                                isDisabled={hasNoSubscription}
                            >
                                {buttonLabel}
                            </Button>
                        </a>
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
