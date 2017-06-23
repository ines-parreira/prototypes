import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {Field, reduxForm, formValueSelector} from 'redux-form'
import classNames from 'classnames'
import Card from 'react-credit-card'
import {Breadcrumb, BreadcrumbItem, Button, Form, Row, Col} from 'reactstrap'

import {updateCreditCard} from '../../../../state/billing/actions'
import {currentPlan as currentPlanSelector} from '../../../../state/billing/selectors'

import Loader from '../../../common/components/Loader'
import {creditCardCVCNormalizer, creditCardExpDateNormalizer, creditCardNormalizer} from './utils'
import {loadScript} from '../../../../utils'
import {UPDATE_CREDIT_CARD_FORM} from '../../../../state/billing/constants'

import ReduxFormInputField from '../../../common/forms/ReduxFormInputField'

import 'react-credit-card/source/card.css'
import 'react-credit-card/source/card-types.css'

class CreditCard extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        updateCreditCard: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        invalid: PropTypes.bool.isRequired,
        pristine: PropTypes.bool.isRequired,
        currentPlan: PropTypes.object.isRequired,
        number: PropTypes.string,
        name: PropTypes.string,
        expDate: PropTypes.string,
        cvc: PropTypes.string
    }

    static defaultProps = {
        number: '',
        name: '',
        expDate: '',
        cvc: ''
    }

    state = {
        isSubmitting: false,
        isStripeLoaded: !!window.Stripe
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

    _submit = (formData) => {
        this.setState({
            isSubmitting: true
        })

        return this.props.updateCreditCard(formData).then(() => {
            this.setState({
                isSubmitting: false
            })
        })
    }

    render() {
        const {
            handleSubmit,
            invalid,
            pristine,
            number,
            name,
            expDate,
            cvc,
            currentPlan
        } = this.props
        const isUpdating = /update-credit-card/.test(this.props.location.pathname)
        const action = isUpdating ? 'Update' : 'Add'
        const payment = (isUpdating || currentPlan.get('amount') === 0) ? '' :
            ` and pay ${currentPlan.get('currencySign')}${currentPlan.get('amount')}`

        const {isStripeLoaded} = this.state

        if (!isStripeLoaded) {
            return <Loader />
        }

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link className="section" to="/app/settings/billing/">Billing</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{action} credit card</BreadcrumbItem>
                </Breadcrumb>

                <h1>{action} Credit card</h1>

                <p>Enter the information of the card you'd like to use.</p>

                <Row>
                    <Col>
                        <Form onSubmit={handleSubmit(this._submit)}>
                            <Field
                                type="text"
                                name="number"
                                label="Card number"
                                placeholder="4657 7894 1234 7895"
                                required
                                help={!isUpdating && 'You will be charged for the current period of your plan once you add your Credit Card'}
                                component={ReduxFormInputField}
                                normalize={creditCardNormalizer}
                            />
                            <Field
                                type="text"
                                name="name"
                                label="Name on the card"
                                placeholder="Marie Curie"
                                required
                                component={ReduxFormInputField}
                            />
                            <Row>
                                <Col>
                                    <Field
                                        type="text"
                                        name="expDate"
                                        label="Expiration date"
                                        placeholder="05 / 21"
                                        required
                                        component={ReduxFormInputField}
                                        normalize={creditCardExpDateNormalizer}
                                    />
                                </Col>
                                <Col>
                                    <Field
                                        type="text"
                                        name="cvc"
                                        label="CVC"
                                        placeholder="693"
                                        required
                                        component={ReduxFormInputField}
                                        normalize={creditCardCVCNormalizer}
                                    />
                                </Col>
                            </Row>
                            <div>
                                <Button
                                    color="success"
                                    className={classNames({'btn-loading': this.state.isSubmitting})}
                                    disabled={this.state.isSubmitting || invalid || pristine}
                                >
                                    {action} Credit Card {payment}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                    <Col className="mt-4">
                        <Card
                            number={number.replace(/ /g, '')}
                            cvc={cvc}
                            expiry={expDate.replace(' / ', '')}
                            name={name}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}

function validateForm(values) {
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

function mapStateToProps(state) {
    const selector = formValueSelector(UPDATE_CREDIT_CARD_FORM)
    return {
        currentPlan: currentPlanSelector(state),
        number: selector(state, 'number'),
        name: selector(state, 'name'),
        expDate: selector(state, 'expDate'),
        cvc: selector(state, 'cvc')
    }
}

export default connect(mapStateToProps, {
    updateCreditCard
})(reduxForm({
    form: UPDATE_CREDIT_CARD_FORM,
    validate: validateForm
})(CreditCard))
