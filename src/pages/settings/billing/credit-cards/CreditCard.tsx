import React, {Component, SyntheticEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import _pick from 'lodash/pick'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    FormGroup,
} from 'reactstrap'
import {fromJS, Map} from 'immutable'
import {AxiosError} from 'axios'
import {AnyAction} from 'redux'
import classnames from 'classnames'

import Errors from 'pages/common/forms/Errors'
import {
    fetchContact,
    fetchCreditCard,
    setCreditCard,
    updateContact,
} from 'state/billing/actions'
import {
    DEPRECATED_getCurrentPlan as currentPlanSelector,
    getAddOnAutomationAmountCurrentPlan,
    getAddOnAutomationFullAmountCurrentPlan,
    getContact,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
    hasLegacyPlan as hasLegacyPlanSelector,
    isMissingContactInformation,
} from 'state/billing/selectors'
import Loader from 'pages/common/components/Loader/Loader'
import {loadScript} from 'utils'
import InputField from 'pages/common/forms/input/InputField'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import PageHeader from 'pages/common/components/PageHeader'
import * as currentAccountSelectors from 'state/currentAccount/selectors'
import GorgiasApi from 'services/gorgiasApi'
import {setCurrentSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {createStripeCardToken} from 'utils/stripe'
import history from 'pages/history'
import LegacyPlanBanner from 'pages/common/components/LegacyPlanBanner'
import Alert from 'pages/common/components/Alert/Alert'
import BillingPlanCard from 'pages/settings/billing/plans/BillingPlanCard'
import {RootState} from 'state/types'
import {NotificationStatus} from 'state/notifications/types'
import {BillingContact, CreditCard} from 'state/billing/types'
import BillingAddressInputs from 'pages/settings/billing/common/BillingAddressInputs'
import {UPDATE_BILLING_CONTACT_ERROR} from 'state/billing/constants'
import settingsCss from 'pages/settings/settings.less'
import Button from 'pages/common/components/button/Button'

import AutomationAmount from '../plans/AutomationAmount'
import TotalAmount from '../plans/TotalAmount'

import {
    creditCardCVCNormalizer,
    creditCardExpDateNormalizer,
    creditCardNormalizer,
} from './utils'

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
    isFetchingInfo: boolean
    isSubmitting: boolean
    isStripeLoaded: boolean
    dirty: boolean
    errors: Partial<Record<keyof CreditCard, string> & {global?: string}>
    name: string
    number: string
    expDate: string
    cvc: string
    contactForm: BillingContact
    shouldDisplayBillingAddressForm: boolean
}

export class CreditCardContainer extends Component<Props, State> {
    gorgiasApi = new GorgiasApi()

    static defaultProps = {
        currentSubscription: fromJS({}),
        currentPlan: fromJS({}),
        number: '',
        name: '',
        expDate: '',
        cvc: '',
    }

    state: State = {
        isFetchingInfo: false,
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
        shouldDisplayBillingAddressForm: false,
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

    componentDidMount() {
        const {
            contact,
            fetchContact,
            fetchCreditCard,
            hasCreditCard,
            isMissingContactInformation,
        } = this.props

        if (contact == null || !hasCreditCard || isMissingContactInformation) {
            this.setState({isFetchingInfo: true})
            Promise.all([fetchContact(), fetchCreditCard()]).finally(() => {
                this.setState({isFetchingInfo: false})
            })
        } else {
            this.setState({contactForm: contact.toJS()})
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {
            currentPlan,
            currentSubscription,
            contact,
            hasCreditCard,
            isMissingContactInformation,
        } = this.props
        const {isFetchingInfo, isStripeLoaded} = this.state
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
        if (!isFetchingInfo && prevState.isFetchingInfo !== isFetchingInfo) {
            this.setState({
                shouldDisplayBillingAddressForm:
                    !hasCreditCard || isMissingContactInformation,
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
        const {contactForm, shouldDisplayBillingAddressForm} = this.state

        if (shouldDisplayBillingAddressForm) {
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
            automationAddOnFullAmount,
            location,
            accountHasLegacyPlan,
        } = this.props
        const {
            isStripeLoaded,
            errors,
            contactForm,
            shouldDisplayBillingAddressForm,
        } = this.state

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
                                    Billing & usage
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

                <Container
                    fluid
                    className={classnames(
                        settingsCss.pageContainer,
                        css.container
                    )}
                >
                    <div className={css.form}>
                        {accountHasLegacyPlan && (
                            <LegacyPlanBanner
                                isCustomPlan={currentPlan.get('custom')}
                            />
                        )}
                        {!isUpdating && (
                            <Alert className="mb-3">
                                You will be charged for the current period of
                                your plan once you add your Credit Card
                            </Alert>
                        )}
                        <h3 className="heading-section-semibold">
                            Payment information
                        </h3>
                        <Form onSubmit={this._submit}>
                            <InputField
                                className={settingsCss.mb16}
                                id="name"
                                label="Name on the card"
                                placeholder="Marie Curie"
                                isRequired
                                value={this.state.name}
                                onChange={(name) => this._updateField({name})}
                                error={errors.name}
                            />
                            <div
                                className={classnames(
                                    css.row,
                                    settingsCss.mb32
                                )}
                            >
                                <InputField
                                    className={css.inputRow}
                                    id="number"
                                    label="Card number"
                                    placeholder="4657 7894 1234 7895"
                                    isRequired
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
                                    className={css.inputRow}
                                    id="expDate"
                                    label="Expiry date"
                                    placeholder="05 / 21"
                                    isRequired
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
                                <InputField
                                    className={css.inputRow}
                                    id="cvc"
                                    label="CVC"
                                    placeholder="693"
                                    isRequired
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
                            </div>
                            {shouldDisplayBillingAddressForm && (
                                <>
                                    <h3 className={'heading-section-semibold'}>
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
                            <FormGroup color="danger">
                                <Errors>{this.state.errors.global}</Errors>
                            </FormGroup>

                            <Button
                                type="submit"
                                isLoading={this.state.isSubmitting}
                                isDisabled={
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
                        </Form>
                    </div>
                    {!currentPlan.isEmpty() && regularCurrentPlan && (
                        <BillingPlanCard
                            className={css.plan}
                            plan={regularCurrentPlan.toJS()}
                            featuresPlan={currentPlan.toJS()}
                            isCurrentPlan
                            renderBody={(features) => (
                                <div className={css.planCardBody}>
                                    {features}
                                </div>
                            )}
                            footer={
                                hasAutomationAddOn && (
                                    <>
                                        <AutomationAmount
                                            addOnAmount={automationAddOnAmount}
                                            fullAddOnAmount={
                                                automationAddOnFullAmount
                                            }
                                            plan={regularCurrentPlan.toJS()}
                                            editable={false}
                                        />
                                        <TotalAmount
                                            addOnAmount={automationAddOnAmount}
                                            plan={regularCurrentPlan.toJS()}
                                            isEditable={false}
                                        />
                                    </>
                                )
                            }
                        />
                    )}
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
        automationAddOnFullAmount:
            getAddOnAutomationFullAmountCurrentPlan(state),
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
        fetchCreditCard,
    }
)

export default withRouter(connector(CreditCardContainer))
