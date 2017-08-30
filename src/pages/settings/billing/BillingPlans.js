import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Card, CardDeck, CardBlock, CardTitle, Row, Col, Button, UncontrolledTooltip} from 'reactstrap'
import {notify} from '../../../state/notifications/actions'
import {updateSubscription} from '../../../state/billing/actions'
import * as billingSelectors from '../../../state/billing/selectors'
import css from './BillingPlans.less'
import classnames from 'classnames'
import {openChat} from '../../../utils'

export class BillingPlans extends Component {
    static propTypes = {
        notify: PropTypes.func.isRequired,
        updateSubscription: PropTypes.func.isRequired,
        isAllowedToChangePlan: PropTypes.func.isRequired,
        currentPlanId: PropTypes.string.isRequired,
        plans: PropTypes.object.isRequired,
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
        })
    }

    render() {
        const {currentPlanId, plans} = this.props
        const {isUpdating} = this.state
        let i = 0

        return (
            <div className="mb-4">
                <h4>Plans</h4>
                <Row className="mb-3">
                    <Col sm="12">
                        <CardDeck>
                            {plans.map((plan, planId) => {
                                i++
                                if (!plan.get('public')) {
                                    return null
                                }
                                const isCurrentPlan = planId === currentPlanId
                                const costMultiplier = 100
                                const costPerTicket = plan.get('cost_per_ticket') * costMultiplier

                                return (
                                    <Card
                                        key={planId}
                                        className={classnames('text-center', css.plan, css[`plan-${i}`])}
                                        outline
                                    >
                                        <CardBlock>
                                            <CardTitle>{plan.get('name')}</CardTitle>
                                            <div className="mb-4 mt-3">
                                                <h3><em>{plan.get('currencySign')}{plan.get('amount')}</em></h3>
                                                per {plan.get('interval')}
                                            </div>
                                            <div><strong>Includes:</strong></div>
                                            <div>Unlimited agents</div>
                                            <div><strong>{plan.get('free_tickets')}</strong> tickets included</div>
                                            <div>
                                                <span>
                                                    <strong>
                                                        + {plan.get('currencySign')}{costPerTicket}
                                                    </strong> per {costMultiplier} tickets </span>
                                                <a id={`additional-tickets-tooltip-${planId}`}>
                                                    <i className="fa fa-question-circle"/>
                                                </a>
                                                <UncontrolledTooltip target={`additional-tickets-tooltip-${planId}`}>
                                                    If you reply to more tickets than included in your plan
                                                    this is the additional cost per 100 tickets.
                                                </UncontrolledTooltip>
                                            </div>
                                            <div className="mb-3">
                                                <strong>{plan.get('integrations')}</strong> integrations
                                            </div>
                                            <Button
                                                className={classnames({'btn-loading': isUpdating})}
                                                color={classnames({info: !isCurrentPlan, secondary: isCurrentPlan})}
                                                outline
                                                disabled={isCurrentPlan || isUpdating}
                                                onClick={() => this._updateSubscription(planId)}
                                            >
                                                {isCurrentPlan ? 'Your current plan' : `Switch to ${plan.get('name')}`}
                                            </Button>
                                        </CardBlock>
                                    </Card>
                                )
                            }).toList()}
                            <Card className={classnames('text-center', css.plan, css['plan-enterprise'])} outline>
                                <CardBlock>
                                    <CardTitle>Enterprise Plan</CardTitle>
                                    <div className="mb-4 mt-3">
                                        <h3>Contact us</h3>
                                        Billed annually

                                    </div>
                                    <div><strong>Includes:</strong></div>
                                    <div>Unlimited agents</div>
                                    <div>Discounted prices for volumes
                                        of <strong>10,000+</strong> tickets.
                                    </div>
                                    <div className="mb-3">Premium support</div>
                                    <Button
                                        color="info"
                                        outline
                                        onClick={openChat}>
                                        Contact Us
                                    </Button>
                                </CardBlock>
                            </Card>
                        </CardDeck>
                    </Col>
                </Row>

                <div>
                    <p>
                        <strong>Are all tickets counted? What about spam?</strong>
                    </p>

                    <p>
                        <span>
                            We bill for a ticket only if your team uses Gorgias to send replies to customers.
                            Specifically we bill you if the ticket:
                        </span>
                        <ul>
                            <li>Has at least 1 reply sent using the helpdesk by a team member (agent).</li>
                            <li>Or is sent using an automatic reply (using the Rules).</li>
                        </ul>
                    </p>

                    <p>
                        <strong>Note:</strong> Tickets that are imported into Gorgias from Facebook, Gmail, etc.. are
                        not billed.
                    </p>
                </div>
            </div>
        )
    }
}

export default connect((state) => {
    return {
        isAllowedToChangePlan: billingSelectors.makeIsAllowedToChangePlan(state),
        currentPlanId: billingSelectors.currentPlanId(state),
        plans: billingSelectors.plans(state),
    }
}, {notify, updateSubscription})(BillingPlans)
