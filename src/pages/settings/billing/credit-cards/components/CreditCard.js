import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import classnames from 'classnames'
import Card from 'react-credit-card'
import {Button} from 'reactstrap'

import {InputField} from '../../../../common/forms'
import {Loader} from '../../../../common/components/Loader'
import {UPDATE_CREDIT_CARD_FORM} from '../../../../../state/billing/constants'
import {creditCardNormalizer, creditCardCVCNormalizer, creditCardExpDateNormalizer} from '../utils'
import {loadScript} from '../../../../../utils'

import css from './CreditCard.less'
import 'react-credit-card/source/card.css'
import 'react-credit-card/source/card-types.css'

// This component is used as "update" and "add" credit card
// but the logic behind is the same, we just display `add` or `update` on UI
class CreditCard extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        isSubmitting: PropTypes.bool.isRequired,
        updateCreditCard: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        invalid: PropTypes.bool.isRequired,
        pristine: PropTypes.bool.isRequired,
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
        isStripeLoaded: !!window.Stripe
    }

    componentWillMount() {
        // load Stripe.js cause we need it to create token for credit card
        loadScript('https://js.stripe.com/v2/', () => {
            if (window.STRIPE_PUBLIC_KEY) {
                Stripe.setPublishableKey(window.STRIPE_PUBLIC_KEY)
                this.setState({isStripeLoaded: true})
            }
        })
    }

    render() {
        // get url to determine if it is an creation or an update
        // logic behind is the same, we just display `add` or `update` on UI
        let action = 'Add'
        if (/update-credit-card/.test(this.props.location.pathname)) {
            action = 'Update'
        }

        const {
            handleSubmit,
            isSubmitting,
            invalid,
            pristine,
            updateCreditCard,
            number,
            name,
            expDate,
            cvc
        } = this.props
        const {isStripeLoaded} = this.state

        if (!isStripeLoaded) {
            return <Loader />
        }

        return (
            <div>
                <div className="ui large breadcrumb">
                    <Link className="section" to="app/settings/billing/">Billing</Link>
                    <i className="right angle icon divider" />
                    <a className="section">{action} credit card</a>
                </div>
                <h1>{action} credit card</h1>
                <p>Enter the information of the card you'd like to use.</p>
                <div className="ui grid">
                    <div className={`height wide column ${css.formWrapper}`}>
                        <form className="ui form" onSubmit={handleSubmit(updateCreditCard)}>
                            <Field
                                type="text"
                                name="number"
                                label="Card number"
                                placeholder="4657 7894 1234 7895"
                                component={InputField}
                                normalize={creditCardNormalizer}
                            />
                            <Field
                                type="text"
                                name="name"
                                label="Name on the card"
                                placeholder="Marie Curie"
                                component={InputField}
                            />
                            <div className="two fields">
                                <Field
                                    type="text"
                                    name="expDate"
                                    label="Expiration date"
                                    placeholder="05 / 21"
                                    component={InputField}
                                    normalize={creditCardExpDateNormalizer}
                                />
                                <Field
                                    type="text"
                                    name="cvc"
                                    label="CVC"
                                    placeholder="693"
                                    component={InputField}
                                    normalize={creditCardCVCNormalizer}
                                />
                            </div>
                            <div className="field">
                                <Button
                                    type="submit"
                                    color="primary"
                                    className={classnames({
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting || invalid || pristine}
                                >
                                    {action} card
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="height wide column">
                        <div className="mt15">
                            <Card
                                number={number.replace(/ /g, '')}
                                cvc={cvc}
                                expiry={expDate.replace(' / ', '')}
                                name={name}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function validateForm(values) {
    const errors = {}
    // validate card number
    if (!values.number || !Stripe.card.validateCardNumber(values.number)) {
        errors.number = 'Please provide a valid card number'
    }
    // validate name
    if (!values.name) {
        errors.name = 'Please provide owner name of the card'
    }
    // validate expiration date
    if (!values.expDate) {
        errors.expDate = 'Please provide expiration date of the card'
    } else {
        const expiry = values.expDate.split('/')
        if (!Stripe.card.validateExpiry(expiry[0], expiry[1])) {
            errors.expDate = 'Please provide a valid expiration date'
        }
    }
    // validate CVC
    if (!values.cvc || !Stripe.card.validateCVC(values.cvc)) {
        errors.cvc = 'Please provide a valid CVC'
    }
    return errors
}

export default reduxForm({
    form: UPDATE_CREDIT_CARD_FORM,
    validate: validateForm
})(CreditCard)
