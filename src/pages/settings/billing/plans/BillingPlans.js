import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link, browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Button, CardDeck, Container, Col, Row} from 'reactstrap'

import {notify} from '../../../../state/notifications/actions'
import {updateSubscription} from '../../../../state/currentAccount/actions'
import * as billingSelectors from '../../../../state/billing/selectors'
import * as currentAccountSelectors from '../../../../state/currentAccount/selectors'
import {openChat} from '../../../../utils'
import PageHeader from '../../../common/components/PageHeader'
import {Plan} from './Plan'

import css from './BillingPlans.less'

export class BillingPlans extends Component {
    static propTypes = {
        currentPlan: PropTypes.object.isRequired,
        isAllowedToChangePlan: PropTypes.func.isRequired,
        isTrialing: PropTypes.bool.isRequired,
        notify: PropTypes.func.isRequired,
        plans: PropTypes.object.isRequired,
        subscription: PropTypes.object,
        shouldPayWithShopify: PropTypes.bool.isRequired,
        updateSubscription: PropTypes.func.isRequired,
    }

    state = {
        isUpdating: false
    }

    _updateSubscription = (planId) => {
        if (!this.props.isAllowedToChangePlan(planId)) {
            this.props.notify({
                status: 'error',
                message: 'You cannot change your current plan because you have too many active integrations. ' +
                'Delete or deactivate a few integrations and try again.'
            })
            return
        }

        this.setState({isUpdating: true})

        this.props.updateSubscription({
            plan: planId
        }).then(() => {
            this.setState({isUpdating: false})

            if (this.props.isTrialing) {
                if (this.props.shouldPayWithShopify) {
                    browserHistory.push('/app/settings/billing')
                } else {
                    browserHistory.push('/app/settings/billing/add-credit-card')
                }
            }
        })
    }

    _renderFAQ = () => (
        <div style={{maxWidth: 900}}>
            <h3 className="mb-4">Frequently asked questions</h3>
            <Row className={css.faq}>
                <Col sm={6}>
                    <dl>
                        <dt>What's a ticket?</dt>
                        <dd>
                            A ticket is a conversation with a customer, on any channel. It can be on email, phone,
                            chat, etc.
                            <br/>
                            Usage only includes tickets that contain a response sent from Gorgias.
                        </dd>

                        <dt>Do I need to pay for all tickets received?</dt>
                        <dd>
                            No! You only pay for tickets that contain a response sent from Gorgias.
                        </dd>

                        <dt>Do I need to pay extra for chat?</dt>
                        <dd>
                            No, all channels are included. You can connect as many chat widgets, facebook pages,
                            and email addresses as you want.
                        </dd>
                    </dl>
                </Col>
                <Col sm={6}>
                    <dl>
                        <dt>I don’t know how many tickets I get per month. Can you help?</dt>
                        <dd>
                            Sure. You probably receive about 1,000 tickets for each agent in your team.
                            So if you’re paying for 5 seats with your current helpdesk, you’d pay for 5,000 tickets
                            with Gorgias.
                        </dd>

                        <dt>What level of support is included in my plan?</dt>
                        <dd>
                            We provide all our customers with the same level of support.
                            We're available 9am-7pm PST, over live chat & email.
                        </dd>

                        <dt>I need help integrating an app with Gorgias. Is that included in my plan?</dt>
                        <dd>
                            Yes. We're happy to help you add your own integrations at no additional cost.
                        </dd>
                    </dl>
                </Col>
            </Row>
        </div>
    )

    render() {
        const {currentPlan, subscription} = this.props
        const isCustomPlan = currentPlan.get('custom', false)
        let plans = this.props.plans.filter((plan) => plan.get('public') && !plan.get('custom'))
        let i = 0

        if (isCustomPlan) {
            plans = this.props.plans.filter((plan, planId) => planId === subscription.get('plan'))
        }

        const enterprisePlan = fromJS({
            name: 'Enterprise',
        })

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link className="section" to="/app/settings/billing">Billing & Usage</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>Plans</BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container fluid className="page-container">
                    <CardDeck className="mb-5">
                        {plans.map((plan, planId) => {
                            ++i
                            return (
                                <Plan
                                    key={i}
                                    plan={plan}
                                    isCurrentPlan={planId === subscription.get('plan')}
                                    isUpdating={this.state.isUpdating}
                                    isTrialing={this.props.isTrialing}
                                    isFeatured={i === 2}
                                    onClick={() => this._updateSubscription(planId)}
                                />
                            )
                        }).toList()}
                        {isCustomPlan || (
                            <Plan
                                plan={enterprisePlan}
                                features={(
                                    <ul>
                                        <li>
                                            <i className="material-icons feature-icon">
                                                all_inclusive
                                            </i>
                                            {' '}
                                            <strong>Unlimited</strong> agents
                                        </li>
                                        <li>
                                            <i className="material-icons feature-icon">
                                                arrow_downward
                                            </i>
                                            {' '}
                                            Discounted prices for volumes of<strong>10, 000+</strong> tickets
                                        </li>
                                        <li>
                                            <i className="material-icons feature-icon">
                                                beach_access
                                            </i>
                                            {' '}
                                            Premium support
                                        </li>
                                    </ul>
                                )}
                                callToAction={(
                                    <Button
                                        color="link"
                                        onClick={openChat}>
                                        Contact Us
                                    </Button>
                                )}
                            />
                        )}
                    </CardDeck>
                    {this._renderFAQ()}
                </Container>
            </div>
        )
    }
}

export default connect((state) => {
    const subscription = currentAccountSelectors.getCurrentSubscription(state)

    return {
        currentPlan: billingSelectors.getPlan(subscription.get('plan'))(state),
        isAllowedToChangePlan: billingSelectors.makeIsAllowedToChangePlan(state),
        isTrialing: currentAccountSelectors.isTrialing(state),
        plans: billingSelectors.plans(state),
        shouldPayWithShopify: currentAccountSelectors.shouldPayWithShopify(state),
        subscription,
    }
}, {notify, updateSubscription})(BillingPlans)
