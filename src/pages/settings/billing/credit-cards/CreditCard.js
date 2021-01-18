// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'
import classNames from 'classnames'
import _pick from 'lodash/pick'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    FormGroup,
    Row,
} from 'reactstrap'

import {fromJS} from 'immutable'

import {setCreditCard} from '../../../../state/billing/actions.ts'
import {currentPlan as currentPlanSelector} from '../../../../state/billing/selectors.ts'

import Loader from '../../../common/components/Loader'
import {loadScript} from '../../../../utils.ts'

import Errors from '../../../common/forms/Errors'
import InputField from '../../../common/forms/InputField'

import * as segmentTracker from '../../../../store/middlewares/segmentTracker'
import PageHeader from '../../../common/components/PageHeader.tsx'
import * as currentAccountSelectors from '../../../../state/currentAccount/selectors.ts'
import {Plan} from '../plans/Plan'

import GorgiasApi from '../../../../services/gorgiasApi.ts'

import {setCurrentSubscription} from '../../../../state/currentAccount/actions.ts'
import {notify} from '../../../../state/notifications/actions.ts'
import {createStripeCardToken} from '../../../../utils/stripe.ts'
import history from '../../../history.ts'

import {
    creditCardCVCNormalizer,
    creditCardExpDateNormalizer,
    creditCardNormalizer,
} from './utils'

declare var Stripe: Object

type Props = {
    location: Object,
    updateCreditCard: () => void,
    setCurrentSubscription: (Object) => void,
    setCreditCard: (Object) => void,
    currentPlan: Object,
    currentUser: Object,
    currentSubscription: Object,
    currentAccount: Object,
    hasCreditCard: boolean,
    number: string,
    name: string,
    expDate: string,
    cvc: string,
    notify: (Object) => Object,
}

type State = {
    isSubmitting: boolean,
    isStripeLoaded: boolean,
    dirty: boolean,
    errors: Object,
    name: string,
    number: string,
    expDate: string,
    cvc: string,
}

export class CreditCard extends Component<Props, State> {
    gorgiasApi = new GorgiasApi()

    static defaultProps = {
        currentSubscription: fromJS({}),
        currentPlan: fromJS({}),
        number: '',
        name: '',
        expDate: '',
        cvc: '',
    }

    state = {
        isSubmitting: false,
        isStripeLoaded: !!window.Stripe,
        dirty: false,
        errors: {},
        name: '',
        number: '',
        expDate: '',
        cvc: '',
    }

    componentWillMount() {
        // load Stripe.js cause we need it to create token for credit card
        if (typeof Stripe === 'undefined') {
            loadScript('https://js.stripe.com/v2/', () => {
                if (window.STRIPE_PUBLIC_KEY) {
                    Stripe.setPublishableKey(window.STRIPE_PUBLIC_KEY)
                    this.setState({isStripeLoaded: true})
                }
            })
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {currentPlan, currentSubscription} = this.props
        const {isStripeLoaded} = this.state
        const noSubscriptionNorPlan =
            currentSubscription.isEmpty() || currentPlan.isEmpty()

        if (
            isStripeLoaded &&
            !prevState.isStripeLoaded &&
            noSubscriptionNorPlan
        ) {
            history.push('/app/settings/billing/')
        }
    }

    /**
     * Update the credit card of the account,
     * and start the subscription if this one is trialing or incomplete.
     *
     * @param event
     * @returns - A promise when the transaction is finished.
     */
    _submit = (event: SyntheticEvent<*>): Promise<any> => {
        event.preventDefault()
        const {
            currentAccount,
            currentUser,
            hasCreditCard,
            currentSubscription,
            notify,
        } = this.props
        const hasSubscription = !!currentSubscription.get('status')
        const cardToEncode = _pick(this.state, ['name', 'number', 'cvc'])
        const [expMonth, expYear] = this.state.expDate.split('/')
        cardToEncode.exp_month = expMonth.trim()
        cardToEncode.exp_year = expYear.trim()

        this.setState({isSubmitting: true})
        segmentTracker.logEvent(
            segmentTracker.EVENTS.PAYMENT_METHOD_ADD_CLICKED,
            {
                payment_method: 'stripe',
                user_id: currentUser.get('id'),
                account_domain: currentAccount.get('domain'),
            }
        )

        return new Promise(async (resolve) => {
            let creditCard = null
            let subscription = currentSubscription
            let payment = null
            try {
                const creditCardToken = await createStripeCardToken(
                    cardToEncode
                )
                creditCard = await this.gorgiasApi.updateCreditCard(
                    fromJS({token: creditCardToken.id})
                )
            } catch (exception) {
                let errorMsg =
                    'Failed to update credit card. Please try again in a few seconds.'
                if (exception.response && exception.response.data.error) {
                    // Gorgias API error
                    errorMsg = exception.response.data.error.msg
                } else if (exception.error && exception.error.message) {
                    // Stripe API error
                    errorMsg = exception.error.message
                }
                this.props.notify({status: 'error', title: errorMsg})
                this.setState({isSubmitting: false})
                return resolve()
            }

            this.props.setCreditCard(creditCard)

            if (!hasCreditCard) {
                segmentTracker.logEvent(
                    segmentTracker.EVENTS.PAYMENT_METHOD_ADDED,
                    {
                        payment_method: 'stripe',
                        user_id: currentUser.get('id'),
                        account_domain: currentAccount.get('domain'),
                    }
                )
            }

            if (hasSubscription && subscription.get('status') !== 'trialing') {
                // The subscription is already started.
                history.push('/app/settings/billing/')
                return resolve()
            }

            try {
                const response = await this.gorgiasApi.startSubscription()
                subscription = response.get('subscription')
                payment = response.get('payment')
            } catch (exception) {
                const errorMsg =
                    exception.response && exception.response.data.error
                        ? exception.response.data.error.msg
                        : 'Failed to update credit card. Please try again in a few seconds.'
                this.props.notify({status: 'error', title: errorMsg})
                return resolve()
            }
            this.props.setCurrentSubscription(subscription)

            if (payment.get('confirmation_url')) {
                notify({
                    status: 'info',
                    message:
                        'In order to activate your subscription, we need you to confirm this payment to your bank.' +
                        'You will be redirected in a few seconds to a secure page.',
                    dismissAfter: 5000,
                    dismissible: false,
                })

                setTimeout(() => {
                    // $FlowFixMe
                    window.location.href = payment.get('confirmation_url')
                }, 4500)
                return resolve()
            }

            if (payment.get('error')) {
                notify({
                    status: 'error',
                    message:
                        payment.get('error') +
                        ' ' +
                        'Please update your payment method and retry to pay your invoice.',
                })
            }

            this.setState({isSubmitting: false})
            history.push('/app/settings/billing/')
            resolve()
        })
    }

    _validate(values: Object) {
        const errors = {}

        if (typeof Stripe === 'undefined') {
            return errors
        }

        // validate card number
        if (values.number && !Stripe.card.validateCardNumber(values.number)) {
            errors.number = 'Please provide a valid card number'
        }

        // validate expiration date
        if (values.expDate) {
            const expiry = values.expDate.split('/')
            if (!Stripe.card.validateExpiry(expiry[0], expiry[1])) {
                errors.expDate = 'Please provide a valid expiration date'
            }
        }

        // validate CVC
        if (values.cvc && !Stripe.card.validateCVC(values.cvc)) {
            errors.cvc = 'Please provide a valid CVC'
        }

        return errors
    }

    _updateField = (value: Object) => {
        const newState = Object.assign({}, this.state, value)

        this.setState(
            Object.assign({}, newState, {
                dirty: true,
                errors: this._validate(newState),
            })
        )
    }

    render() {
        const {currentPlan, currentSubscription, location} = this.props
        const {isStripeLoaded, errors} = this.state

        const invalid = Object.keys(errors).length > 0
        const isUpdating = /update-credit-card/.test(
            location ? location.pathname : ''
        )
        const action = isUpdating ? 'Update' : 'Add'
        const payment =
            isUpdating ||
            currentPlan.isEmpty() ||
            currentPlan.get('amount') === 0
                ? ''
                : ` and pay ${currentPlan.get('currencySign')}${currentPlan.get(
                      'amount'
                  )}`

        if (!isStripeLoaded) {
            return <Loader />
        }

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    className="section"
                                    to="/app/settings/billing/"
                                >
                                    Billing & Usage
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {action} credit card
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className="page-container">
                    <p>Enter the information of the card you'd like to use.</p>

                    <Row>
                        {currentSubscription.get('status') !== 'active' &&
                            !currentPlan.isEmpty() && (
                                <Col sm={3}>
                                    <Plan
                                        plan={currentPlan}
                                        showFooter={false}
                                    />
                                </Col>
                            )}
                        <Col sm={4}>
                            <Form onSubmit={this._submit}>
                                <InputField
                                    type="text"
                                    name="number"
                                    label="Card number"
                                    placeholder="4657 7894 1234 7895"
                                    required
                                    help={
                                        !isUpdating &&
                                        'You will be charged for the current period of your plan once you add your Credit Card'
                                    }
                                    value={this.state.number}
                                    onChange={(number) =>
                                        this._updateField({
                                            number: creditCardNormalizer(
                                                number,
                                                this.state.number
                                            ),
                                        })
                                    }
                                    error={errors.number}
                                />
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Name on the card"
                                    placeholder="Marie Curie"
                                    required
                                    value={this.state.name}
                                    onChange={(name) =>
                                        this._updateField({name})
                                    }
                                    error={errors.name}
                                />
                                <Row>
                                    <Col>
                                        <InputField
                                            type="text"
                                            name="expDate"
                                            label="Expiration date"
                                            placeholder="05 / 21"
                                            required
                                            value={this.state.expDate}
                                            onChange={(expDate) =>
                                                this._updateField({
                                                    expDate: creditCardExpDateNormalizer(
                                                        expDate,
                                                        this.state.expDate
                                                    ),
                                                })
                                            }
                                            error={errors.expDate}
                                        />
                                    </Col>
                                    <Col>
                                        <InputField
                                            type="text"
                                            name="cvc"
                                            label="CVC"
                                            placeholder="693"
                                            required
                                            value={this.state.cvc}
                                            onChange={(cvc) =>
                                                this._updateField({
                                                    cvc: creditCardCVCNormalizer(
                                                        cvc,
                                                        this.state.cvc
                                                    ),
                                                })
                                            }
                                            error={errors.cvc}
                                        />
                                    </Col>
                                </Row>
                                <div>
                                    <FormGroup color="danger">
                                        <Errors>
                                            {this.state.errors.global}
                                        </Errors>
                                    </FormGroup>

                                    <Button
                                        color="success"
                                        className={classNames({
                                            'btn-loading': this.state
                                                .isSubmitting,
                                        })}
                                        disabled={
                                            this.state.isSubmitting ||
                                            invalid ||
                                            !this.state.dirty
                                        }
                                    >
                                        {action} credit card {payment}
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentPlan: currentPlanSelector(state),
        currentUser: state.currentUser,
        currentSubscription: currentAccountSelectors.getCurrentSubscription(
            state
        ),
        currentAccount: state.currentAccount,
        hasCreditCard: !!state.billing.get('creditCard'),
    }
}

const actions = {setCurrentSubscription, notify, setCreditCard}

export default withRouter(connect(mapStateToProps, actions)(CreditCard))
