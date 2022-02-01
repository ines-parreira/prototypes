import React, {Component, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import classnames from 'classnames'
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
import {fromJS, Map} from 'immutable'
import {AxiosError} from 'axios'
import {AnyAction} from 'redux'

import Errors from 'pages/common/forms/Errors'
import {
    fetchContact,
    setCreditCard,
    updateContact,
} from '../../../../state/billing/actions'
import {
    getAddOnAutomationAmountCurrentPlan,
    getContact,
    DEPRECATED_getCurrentPlan as currentPlanSelector,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
    hasLegacyPlan as hasLegacyPlanSelector,
    isMissingContactInformation,
} from '../../../../state/billing/selectors'
import Loader from '../../../common/components/Loader/Loader'
import {loadScript} from '../../../../utils'
import InputField from '../../../common/forms/InputField'
import {
    logEvent,
    SegmentEvent,
} from '../../../../store/middlewares/segmentTracker'
import PageHeader from '../../../common/components/PageHeader'
import * as currentAccountSelectors from '../../../../state/currentAccount/selectors'
import GorgiasApi from '../../../../services/gorgiasApi'
import {setCurrentSubscription} from '../../../../state/currentAccount/actions'
import {notify} from '../../../../state/notifications/actions'
import {createStripeCardToken} from '../../../../utils/stripe'
import history from '../../../history'
import LegacyPlanBanner from '../../../common/components/LegacyPlanBanner'
import Alert from '../../../common/components/Alert/Alert'
import BillingPlanCard from '../plans/BillingPlanCard'
import {RootState} from '../../../../state/types'
import {NotificationStatus} from '../../../../state/notifications/types'
import {BillingContact, CreditCard} from '../../../../state/billing/types'
import RecurringPrices from '../plans/RecurringPrices'
import BillingAddressInputs from '../common/BillingAddressInputs'
import {UPDATE_BILLING_CONTACT_ERROR} from '../../../../state/billing/constants'
import settingsCss from '../../settings.less'

import {
    creditCardCVCNormalizer,
    creditCardExpDateNormalizer,
    creditCardNormalizer,
} from './utils.js'
import css from './CreditCard.less'

type Props = {
    updateCreditCard: () => void
    number: string
    name: string
    expDate: string
    cvc: string
} & RouteComponentProps &
    ConnectedProps<typeof connector>

type State = {
    isSubmitting: boolean
    isStripeLoaded: boolean
    dirty: boolean
    errors: Partial<Record<keyof CreditCard, string> & {global?: string}>
    name: string
    number: string
    expDate: string
    cvc: string
    contactForm: BillingContact
}

export class CreditCardContainer extends Component<Props, State> {
    gorgiasApi = new GorgiasApi()

    shouldDisplayBillingAddressForm = false

    static defaultProps = {
        currentSubscription: fromJS({}),
        currentPlan: fromJS({}),
        number: '',
        name: '',
        expDate: '',
        cvc: '',
    }

    state: State = {
        isSubmitting: false,
        isStripeLoaded: !!window.Stripe,
        dirty: false,
        errors: {},
        name: '',
        number: '',
        expDate: '',
        cvc: '',
        contactForm: {
            email: '',
            shipping: {
                name: '',
                phone: '',
                address: {
                    line1: '',
                    line2: '',
                    country: '',
                    postal_code: '',
                    city: '',
                    state: '',
                },
            },
        },
    }

    componentWillMount() {
        const {hasCreditCard, isMissingContactInformation} = this.props
        this.shouldDisplayBillingAddressForm =
            !hasCreditCard || isMissingContactInformation

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

    componentDidMount() {
        const {contact, fetchContact} = this.props

        if (contact == null) {
            void fetchContact()
        } else {
            this.setState({contactForm: contact.toJS()})
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {currentPlan, currentSubscription, contact} = this.props
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

        if (prevProps.contact !== contact && contact) {
            this.setState({
                contactForm: contact.toJS(),
            })
        }
    }

    /**
     * Update the credit card of the account,
     * and start the subscription if this one is trialing or incomplete.
     */
    _submit = async (event: SyntheticEvent) => {
        event.preventDefault()
        const {
            currentAccount,
            currentUser,
            hasCreditCard,
            currentSubscription,
            notify,
            updateContact,
        } = this.props
        const {contactForm} = this.state

        if (this.shouldDisplayBillingAddressForm) {
            const response = (await updateContact(
                fromJS(contactForm)
            )) as AnyAction

            if (response.type === UPDATE_BILLING_CONTACT_ERROR) {
                return
            }
        }
        const hasSubscription = !!currentSubscription.get('status')
        const cardToEncode: stripe.StripeCardTokenData = _pick(this.state, [
            'name',
            'number',
            'cvc',
        ])
        const [expMonth, expYear] = this.state.expDate.split('/')
        cardToEncode.exp_month = expMonth.trim() as any
        cardToEncode.exp_year = expYear.trim() as any

        this.setState({isSubmitting: true})
        logEvent(SegmentEvent.PaymentMethodAddClicked, {
            payment_method: 'stripe',
            user_id: currentUser.get('id'),
            account_domain: currentAccount.get('domain'),
        })

        // eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-misused-promises
        return new Promise<void>(async (resolve) => {
            let creditCard = null
            let subscription = currentSubscription
            let payment: Map<any, any> | null = null
            try {
                const creditCardToken = await createStripeCardToken(
                    cardToEncode
                )
                creditCard = await this.gorgiasApi.updateCreditCard(
                    fromJS({token: creditCardToken.id})
                )
            } catch (exception) {
                const error: AxiosError<{error: {msg: string}}> &
                    stripe.StripeCardTokenResponse = exception
                let errorMsg =
                    'Failed to update credit card. Please try again in a few seconds.'
                if (error.response && error.response.data.error) {
                    // Gorgias API error
                    errorMsg = error.response.data.error.msg
                } else if (error.error && error.error.message) {
                    // Stripe API error
                    errorMsg = error.error.message
                }
                void this.props.notify({
                    status: NotificationStatus.Error,
                    title: errorMsg,
                })
                this.setState({isSubmitting: false})
                return resolve()
            }

            this.props.setCreditCard(creditCard)

            if (!hasCreditCard) {
                logEvent(SegmentEvent.PaymentMethodAdded, {
                    payment_method: 'stripe',
                    user_id: currentUser.get('id'),
                    account_domain: currentAccount.get('domain'),
                })
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
                const error: AxiosError<{error?: {msg: string}}> = exception
                const errorMsg =
                    error.response && error.response.data.error
                        ? error.response.data.error.msg
                        : 'Failed to update credit card. Please try again in a few seconds.'
                void this.props.notify({
                    status: NotificationStatus.Error,
                    title: errorMsg,
                })
                return resolve()
            }
            this.props.setCurrentSubscription(subscription)

            if (payment!.get('confirmation_url')) {
                void notify({
                    status: NotificationStatus.Info,
                    message:
                        'In order to activate your subscription, we need you to confirm this payment to your bank.' +
                        'You will be redirected in a few seconds to a secure page.',
                    dismissAfter: 5000,
                    dismissible: false,
                })

                setTimeout(() => {
                    window.location.href = payment!.get('confirmation_url')
                }, 4500)
                return resolve()
            }

            if (payment!.get('error')) {
                void notify({
                    status: NotificationStatus.Error,
                    message: `${
                        payment!.get('error') as string
                    } Please update your payment method and retry to pay your invoice.`,
                })
            }

            this.setState({isSubmitting: false})
            history.push('/app/settings/billing/')
            resolve()
        })
    }

    _validate(values: CreditCard) {
        const errors: State['errors'] = {}

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

    _updateField = (value: Partial<State>) => {
        const newState = Object.assign({}, this.state, value)

        this.setState(
            Object.assign({}, newState, {
                dirty: true,
                errors: this._validate(newState),
            })
        )
    }

    render() {
        const {
            currentPlan,
            hasAutomationAddOn,
            regularCurrentPlan,
            automationAddOnAmount,
            location,
            accountHasLegacyPlan,
        } = this.props
        const {isStripeLoaded, errors, contactForm} = this.state

        const invalid =
            Object.keys(errors).length > 0 ||
            Object.values(
                _pick(this.state, ['name', 'number', 'expDate', 'cvc'])
            ).some((value) => !value)
        const isUpdating = /change-credit-card/.test(location.pathname)
        const payment =
            isUpdating ||
            currentPlan.isEmpty() ||
            currentPlan.get('amount') === 0
                ? ''
                : ` and pay ${currentPlan.get('currencySign') as string}${
                      currentPlan.get('amount') as number
                  }`

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
                                {isUpdating
                                    ? 'Change credit card'
                                    : 'Add payment method'}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <Container fluid className={settingsCss.pageContainer}>
                    <Row>
                        <Col className={css.paymentInformationColumn} sm={7}>
                            {accountHasLegacyPlan && (
                                <LegacyPlanBanner
                                    isCustomPlan={currentPlan.get('custom')}
                                />
                            )}
                            {!isUpdating && (
                                <Alert className="mb-3">
                                    You will be charged for the current period
                                    of your plan once you add your Credit Card
                                </Alert>
                            )}
                            <h3>Payment information</h3>
                            <Form onSubmit={this._submit}>
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
                                <Row className={css.formRow}>
                                    <Col className={css.formColumn} sm={7}>
                                        <InputField
                                            type="text"
                                            name="number"
                                            label="Card number"
                                            placeholder="4657 7894 1234 7895"
                                            required
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
                                    </Col>
                                    <Col className={css.formColumn}>
                                        <InputField
                                            type="text"
                                            name="expDate"
                                            label="Expiry date"
                                            placeholder="05 / 21"
                                            required
                                            value={this.state.expDate}
                                            onChange={(expDate) =>
                                                this._updateField({
                                                    expDate:
                                                        creditCardExpDateNormalizer(
                                                            expDate,
                                                            this.state.expDate
                                                        ),
                                                })
                                            }
                                            error={errors.expDate}
                                        />
                                    </Col>
                                    <Col className={css.formColumn}>
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
                                {this.shouldDisplayBillingAddressForm && (
                                    <>
                                        <h3
                                            className={css.billingAddressHeader}
                                        >
                                            Billing address
                                        </h3>
                                        <BillingAddressInputs
                                            onChange={(contactForm) =>
                                                this.setState({contactForm})
                                            }
                                            value={contactForm}
                                        />
                                    </>
                                )}
                                <div className={css.formFooter}>
                                    <FormGroup color="danger">
                                        <Errors>
                                            {this.state.errors.global}
                                        </Errors>
                                    </FormGroup>

                                    <Button
                                        color={
                                            isUpdating ? 'primary' : 'success'
                                        }
                                        className={classnames({
                                            'btn-loading':
                                                this.state.isSubmitting,
                                        })}
                                        disabled={
                                            this.state.isSubmitting ||
                                            invalid ||
                                            !this.state.dirty
                                        }
                                    >
                                        {isUpdating
                                            ? 'Update card'
                                            : 'Add payment method'}{' '}
                                        {payment}
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                        {!currentPlan.isEmpty() && regularCurrentPlan && (
                            <Col className={css.planCardColumn} sm={4}>
                                <BillingPlanCard
                                    plan={regularCurrentPlan.toJS()}
                                    isCurrentPlan
                                    renderBody={(features) => (
                                        <div className={css.planCardBody}>
                                            {features}
                                        </div>
                                    )}
                                    footer={
                                        hasAutomationAddOn && (
                                            <RecurringPrices
                                                addOnAmount={
                                                    automationAddOnAmount
                                                }
                                                plan={regularCurrentPlan.toJS()}
                                                editable={false}
                                            />
                                        )
                                    }
                                />
                            </Col>
                        )}
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        currentPlan: currentPlanSelector(state),
        hasAutomationAddOn: getHasAutomationAddOn(state),
        regularCurrentPlan: getEquivalentRegularCurrentPlan(state),
        automationAddOnAmount: getAddOnAutomationAmountCurrentPlan(state),
        currentUser: state.currentUser,
        currentSubscription:
            currentAccountSelectors.getCurrentSubscription(state),
        currentAccount: state.currentAccount,
        hasCreditCard: !!state.billing.get('creditCard'),
        isMissingContactInformation: isMissingContactInformation(state),
        accountHasLegacyPlan: hasLegacyPlanSelector(state),
        contact: getContact(state),
    }),
    {
        setCurrentSubscription,
        notify,
        setCreditCard,
        updateContact,
        fetchContact,
    }
)

export default withRouter(connector(CreditCardContainer))
