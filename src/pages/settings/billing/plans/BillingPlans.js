//@flow

import React from 'react'
import {connect} from 'react-redux'
import {browserHistory, Link} from 'react-router'
import {fromJS} from 'immutable'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    CardDeck,
    Col,
    Container,
    Row,
} from 'reactstrap'

import classnames from 'classnames'

import {notify} from '../../../../state/notifications/actions'
import {updateSubscription} from '../../../../state/currentAccount/actions.ts'
import * as billingSelectors from '../../../../state/billing/selectors.ts'
import * as currentAccountSelectors from '../../../../state/currentAccount/selectors.ts'
import {openChat} from '../../../../utils'
import PageHeader from '../../../common/components/PageHeader'
import {setFutureSubscriptionPlan} from '../../../../state/billing/actions.ts'

import {Plan} from './Plan'

import css from './BillingPlans.less'

type Props = {
    currentPlan: Object,
    plans: Object,
    subscription: Object,
    shouldPayWithShopify: boolean,
    isTrialing: boolean,
    notify: Function,
    isAllowedToChangePlan: Function,
    updateSubscription: Function,
    setFutureSubscriptionPlan: (string) => void,
}

type State = {
    isUpdating: boolean,
    selectedInterval: string,
}

export class BillingPlans extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        const {currentPlan} = props
        this.state = {
            isUpdating: false,
            selectedInterval: currentPlan.get('interval') || 'month',
        }
    }

    _updateSubscription = (planId: string) => {
        const {
            subscription,
            updateSubscription,
            setFutureSubscriptionPlan,
        } = this.props
        const hasNoSubscription = !subscription.get('status')

        if (!this.props.isAllowedToChangePlan(planId)) {
            this.props.notify({
                status: 'error',
                message:
                    'You cannot change your current plan because you have too many active integrations. ' +
                    'Delete or deactivate a few integrations and try again.',
            })
            return
        }

        this.setState({isUpdating: true})

        setFutureSubscriptionPlan(planId)
        updateSubscription({
            plan: planId,
        }).then(() => {
            this.setState({isUpdating: false})

            if (hasNoSubscription || this.props.isTrialing) {
                if (this.props.shouldPayWithShopify) {
                    browserHistory.push('/app/settings/billing')
                } else {
                    browserHistory.push('/app/settings/billing/add-credit-card')
                }
            }
        })
    }

    _toggleInterval = () => {
        this.setState({
            selectedInterval:
                this.state.selectedInterval === 'month' ? 'year' : 'month',
        })
    }

    _renderFAQ = () => (
        <Container fluid className="page-container">
            <div style={{maxWidth: 900}}>
                <h3 className="mb-4">Frequently asked questions</h3>
                <Row className={css.faq}>
                    <Col sm={6}>
                        <dl>
                            <dt>What's a ticket?</dt>
                            <dd>
                                A ticket is a conversation with a customer, on
                                any channel. It can be by email, phone, chat,
                                etc.
                                <br />
                                Usage only includes tickets that contain a
                                response sent from Gorgias.
                            </dd>

                            <dt>Do I need to pay for all tickets received?</dt>
                            <dd>
                                No! You only pay for tickets that contain a
                                response sent from Gorgias.
                            </dd>

                            <dt>Do I need to pay extra for chat?</dt>
                            <dd>
                                No, all channels are included. You can connect
                                as many chat widgets, facebook pages, and email
                                addresses as you want.
                            </dd>

                            <dt>
                                What level of support is included in my plan?
                            </dt>
                            <dd>
                                We provide all our customers with the same level
                                of support. We're available 9am-7pm PST, over
                                live chat & email.
                            </dd>
                        </dl>
                    </Col>
                    <Col sm={6}>
                        <dl>
                            <dt>
                                I don’t know how many tickets I get per month.
                                Can you help?
                            </dt>
                            <dd>
                                Sure. You probably receive about 1,000 tickets
                                for each user in your team. So if you’re paying
                                for 5 seats with your current helpdesk, you’d
                                pay for 5,000 tickets with Gorgias.
                            </dd>

                            <dt>Can I switch between plans?</dt>
                            <dd>
                                Yes you can. Switching between monthly/yearly
                                plans will{' '}
                                <a
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    href="https://stripe.com/docs/subscriptions/upgrading-downgrading#understanding-proration"
                                >
                                    prorate
                                </a>{' '}
                                your subscription. See the question below for
                                switching from yearly to monthly plans.
                            </dd>

                            <dt>
                                Can I switch from an yearly plan to a monthly
                                plan?
                            </dt>
                            <dd>
                                Once you start using our annual plan, you will
                                get a %17 discount (2 months for free). Given
                                this discount, we don't allow switching to
                                monthly plans until the next billing cycle
                                begins. In practice, it means that if you
                                subscribe to a yearly plan on 15 May, you will
                                be able to switch to a monthly plan next year on
                                15 May. Make sure you send us a message before
                                so we can make the switch for you.
                            </dd>
                        </dl>
                    </Col>
                </Row>
            </div>
        </Container>
    )

    _renderPlans = () => {
        const {currentPlan, subscription} = this.props
        const {selectedInterval} = this.state

        const isCustomPlan = currentPlan.get('custom', false)
        let plans = this.props.plans.filter(
            (plan) =>
                plan.get('public') &&
                !plan.get('custom') &&
                plan.get('interval') === selectedInterval
        )
        let i = 0

        if (isCustomPlan) {
            plans = this.props.plans.filter(
                (plan, planId) => planId === subscription.get('plan')
            )
        }

        const enterprisePlan = fromJS({
            name: 'Enterprise',
        })

        return (
            <Container
                fluid
                className={classnames('page-container', css['plans-container'])}
            >
                <div className={css['interval-toggle']}>
                    <ButtonGroup>
                        <Button
                            onClick={this._toggleInterval}
                            color={
                                selectedInterval === 'month'
                                    ? 'primary'
                                    : 'secondary'
                            }
                        >
                            Monthly
                        </Button>
                        <Button
                            onClick={this._toggleInterval}
                            color={
                                selectedInterval === 'year'
                                    ? 'primary'
                                    : 'secondary'
                            }
                        >
                            Yearly
                        </Button>
                    </ButtonGroup>
                </div>
                <CardDeck className={classnames('mb-5', css['plans-cards'])}>
                    {plans
                        .map((plan, planId) => {
                            ++i
                            return (
                                <Plan
                                    className="mt-4"
                                    key={i}
                                    plan={plan}
                                    isCurrentPlan={
                                        planId === subscription.get('plan')
                                    }
                                    isUpdating={this.state.isUpdating}
                                    isTrialing={this.props.isTrialing}
                                    isFeatured={i === 2}
                                    onClick={() =>
                                        this._updateSubscription(planId)
                                    }
                                />
                            )
                        })
                        .toList()}
                    {isCustomPlan || (
                        <Plan
                            className="mt-4"
                            plan={enterprisePlan}
                            features={
                                <ul>
                                    <li>
                                        <i className="material-icons feature-icon">
                                            all_inclusive
                                        </i>{' '}
                                        <strong>Unlimited</strong> users
                                    </li>
                                    <li>
                                        <i className="material-icons feature-icon">
                                            arrow_downward
                                        </i>{' '}
                                        Discounted prices for volumes of{' '}
                                        <strong>
                                            {selectedInterval === 'year'
                                                ? '100,000'
                                                : '10,000'}
                                            +
                                        </strong>{' '}
                                        tickets
                                    </li>
                                    <li>
                                        <i className="material-icons feature-icon">
                                            beach_access
                                        </i>{' '}
                                        Premium support
                                    </li>
                                </ul>
                            }
                            callToAction={
                                <Button color="link" onClick={openChat}>
                                    Contact us
                                </Button>
                            }
                        />
                    )}
                </CardDeck>
            </Container>
        )
    }

    render() {
        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    className="section"
                                    to="/app/settings/billing"
                                >
                                    Billing & Usage
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>Plans</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />
                {this._renderPlans()}
                {this._renderFAQ()}
            </div>
        )
    }
}

export default connect(
    (state) => {
        return {
            currentPlan: billingSelectors.currentPlan(state),
            isAllowedToChangePlan: billingSelectors.makeIsAllowedToChangePlan(
                state
            ),
            isTrialing: currentAccountSelectors.isTrialing(state),
            plans: billingSelectors.plans(state),
            shouldPayWithShopify: currentAccountSelectors.shouldPayWithShopify(
                state
            ),
            subscription: currentAccountSelectors.getCurrentSubscription(state),
        }
    },
    {notify, updateSubscription, setFutureSubscriptionPlan}
)(BillingPlans)
