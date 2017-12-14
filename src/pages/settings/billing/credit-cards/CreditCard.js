import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import classNames from 'classnames'
import Card from 'react-credit-card'
import _pick from 'lodash/pick'
import {Breadcrumb, BreadcrumbItem, Button, Form, Row, Col, FormGroup} from 'reactstrap'

import {updateCreditCard} from '../../../../state/billing/actions'
import {currentPlan as currentPlanSelector} from '../../../../state/billing/selectors'

import Loader from '../../../common/components/Loader'
import {creditCardCVCNormalizer, creditCardExpDateNormalizer, creditCardNormalizer} from './utils'
import {loadScript} from '../../../../utils'

import Errors from '../../../common/forms/Errors'
import InputField from '../../../common/forms/InputField'

import 'react-credit-card/source/card.css'
import 'react-credit-card/source/card-types.css'

class CreditCard extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        updateCreditCard: PropTypes.func.isRequired,
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

    _submit = (e) => {
        e.preventDefault()
        const formData = _pick(this.state, [
            'name',
            'number',
            'expDate',
            'cvc',
        ])

        this.setState({
            isSubmitting: true
        })

        return this.props.updateCreditCard(formData)
        .then(({error} = {}) => {
            const newState = {
                isSubmitting: false,
                errors: {}
            }

            if (error && error.message) {
                newState.errors.global = error.message
            }

            this.setState(newState)
        })
    }

    _validate(values) {
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

    _updateField = (value) => {
        const newState = Object.assign({}, this.state, value)

        this.setState(Object.assign({}, newState, {
            dirty: true,
            errors: this._validate(newState)
        }))
    }

    render() {
        const {
            currentPlan
        } = this.props
        const invalid = Object.keys(this.state.errors).length > 0
        const isUpdating = /update-credit-card/.test(this.props.location.pathname)
        const action = isUpdating ? 'Update' : 'Add'
        const payment = (isUpdating || currentPlan.isEmpty() || currentPlan.get('amount') === 0) ? '' :
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
                        <Form onSubmit={this._submit}>
                            <InputField
                                type="text"
                                name="number"
                                label="Card number"
                                placeholder="4657 7894 1234 7895"
                                required
                                help={!isUpdating && 'You will be charged for the current period of your plan once you add your Credit Card'}
                                value={this.state.number}
                                onChange={number => this._updateField({
                                    number: creditCardNormalizer(number, this.state.number)
                                })}
                                error={this.state.errors.number}
                            />
                            <InputField
                                type="text"
                                name="name"
                                label="Name on the card"
                                placeholder="Marie Curie"
                                required
                                value={this.state.name}
                                onChange={name => this._updateField({name})}
                                error={this.state.errors.name}
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
                                        onChange={expDate => this._updateField({
                                            expDate: creditCardExpDateNormalizer(expDate, this.state.expDate)
                                        })}
                                        error={this.state.errors.expDate}
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
                                        onChange={cvc => this._updateField({
                                            cvc: creditCardCVCNormalizer(cvc, this.state.cvc)
                                        })}
                                        error={this.state.errors.cvc}
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
                                    className={classNames({'btn-loading': this.state.isSubmitting})}
                                    disabled={this.state.isSubmitting || invalid || !this.state.dirty}
                                >
                                    {action} Credit Card {payment}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                    <Col className="mt-4">
                        <Card
                            number={this.state.number.replace(/ /g, '')}
                            cvc={this.state.cvc}
                            expiry={this.state.expDate.replace(' / ', '')}
                            name={this.state.name}
                        />
                    </Col>
                </Row>
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        currentPlan: currentPlanSelector(state)
    }
}

export default connect(mapStateToProps, {
    updateCreditCard
})(CreditCard)
