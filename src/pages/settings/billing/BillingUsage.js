import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import moment from 'moment'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'

import Loader from '../../common/components/Loader'
import {Button, Card, CardBody, CardGroup, Col, Progress, Row, UncontrolledTooltip} from 'reactstrap'
import {fetchCurrentUsage} from '../../../state/billing/actions'
import {openChat} from '../../../utils'
import * as integrationSelectors from '../../../state/integrations/selectors'
import * as billingSelectors from '../../../state/billing/selectors'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'

import css from './BillingUsage.less'

export class BillingUsage extends Component {
    static propTypes = {
        fetchCurrentUsage: PropTypes.func.isRequired,
        activeIntegrations: PropTypes.object.isRequired,
        currentUsage: PropTypes.object.isRequired,
        currentPlan: PropTypes.object.isRequired,
        currentSubscription: PropTypes.object.isRequired,
    }

    state = {
        isLoading: false,
    }

    componentWillMount() {
        this.setState({isLoading: true})
        this.props.fetchCurrentUsage().then(() => {
            this.setState({isLoading: false})
        })
    }

    _renderTicketUsage = () => {
        const {currentUsage, currentPlan} = this.props

        const dateFormat = 'MMM DD'
        const periodStart = moment(currentUsage.getIn(['meta', 'start_datetime'])).format(dateFormat)
        const periodEnd = moment(currentUsage.getIn(['meta', 'end_datetime'])).format(dateFormat)

        // tickets included/used + extra cost
        const includedTickets = currentPlan.get('free_tickets') || 0
        const usedTickets = currentUsage.getIn(['data', 'tickets']) || 0
        const extraCost = currentUsage.getIn(['data', 'cost']) || 0

        // percentage used/remaining (depends on extra usage)
        let percentUsed = 100
        let percentRemaining = 100
        let percentUsedColor = 'primary'
        let percentRemainingColor

        if (usedTickets && includedTickets) {
            if (usedTickets >= includedTickets) {
                percentUsed = Math.round(includedTickets * 100 / usedTickets)
                percentRemaining = 100 - percentUsed

                if (percentRemaining === 0) {
                    // means the account consumed all their ticket credits - we color the whole bar warning
                    percentUsedColor = 'warning'
                } else if (percentRemaining > 0 && percentRemaining < 20) {
                    // means the account surpassed their ticket credits and are now in extra usage - but not too much
                    percentRemainingColor = 'warning'
                } else if (percentRemaining >= 20) {
                    // means the account surpassed their ticket credits and are now in extra usage - a lot of extra usage
                    percentRemainingColor = 'danger'
                }
            } else {
                // we're still in the "no extra usage" zone of included tickets in the helpdesk
                percentUsed = Math.round(usedTickets * 100 / includedTickets)
                percentRemaining = 100 - percentUsed
            }
        }

        return (
            <div>
                <div className={css['usage-numbers']}>
                    {includedTickets}/{usedTickets} tickets
                    {' '}
                    <a id="current-period"><i className="material-icons text-muted">info_outline</i></a>
                </div>
                <UncontrolledTooltip target="current-period">
                    Number of tickets included in your current plan VS
                    total number of tickets used between:
                    <br/>
                    {periodStart} and {periodEnd}
                </UncontrolledTooltip>

                <Progress multi className={css['usage-progress']}>
                    <Progress bar value={percentUsed} color={percentUsedColor}/>
                    {percentRemainingColor && (
                        <Progress bar value={percentRemaining} color={percentRemainingColor}/>
                    )}
                </Progress>

                <div>${extraCost} extra cost</div>
            </div>
        )
    }

    _renderIntegrationUsage = () => {
        // integrations included/used
        const {currentPlan, activeIntegrations} = this.props
        const includedIntegrations = currentPlan.get('integrations')
        const usedIntegrations = activeIntegrations ? activeIntegrations.size : 0

        let percentUsed = 100
        let percentRemaining = 100

        if (includedIntegrations && usedIntegrations) {
            // percentage used/remaining
            percentUsed = Math.round(usedIntegrations * 100 / includedIntegrations)
            percentRemaining = 100 - percentUsed
        }


        return (
            <div>
                <div className={css['usage-numbers']}>
                    {usedIntegrations}/{includedIntegrations}
                    {' '}
                    <Link to="/app/settings/integrations">integrations</Link>{' '}
                    <a id="integrations-consumed">
                        <i className="material-icons text-muted">
                            info_outline
                        </i>
                    </a>
                    <UncontrolledTooltip target="integrations-consumed">
                        Number of integrations used VS total number of integrations
                        available for your current plan.
                    </UncontrolledTooltip>
                </div>
                <Progress multi className={css['usage-numbers']}>
                    <Progress bar value={percentUsed} color="primary"/>
                    {percentRemaining < 30 && percentRemaining >= 20 && (
                        <Progress bar value={percentRemaining} color="warning"/>
                    )}
                    {percentRemaining < 20 && (
                        <Progress bar value={percentRemaining} color="danger"/>
                    )}
                </Progress>
            </div>
        )
    }


    render() {
        const {currentUsage, currentSubscription, currentPlan} = this.props
        if (this.state.isLoading) {
            return <Loader/>
        }

        const dateFormat = 'MMM DD'

        const isTrialing = currentSubscription.get('status') === 'trialing'
        const planName = isTrialing ? 'Free' : currentPlan.get('name')
        const planTitle = isTrialing ? 'Free Trial' : `${planName} Plan`

        const currentSubscriptionCreated = moment(currentSubscription.get('created_datetime')).format(dateFormat)
        const currentSubscriptionTrialStart = moment(currentSubscription.get('trial_start_datetime')).format(dateFormat)
        const currentSubscriptionTrialEnd = moment(currentSubscription.get('trial_end_datetime')).format(dateFormat)
        const periodEnd = moment(currentUsage.getIn(['meta', 'end_datetime'])).format(dateFormat)


        return (
            <div className="mb-5">
                <h4>
                    <i className="material-icons">insert_chart</i> Usage & Plans
                </h4>

                <CardGroup className="mb-2">
                    <Card className={classnames(css['current-plan'], css[planName])}>
                        <CardBody>
                            <h4>{planTitle}</h4>
                            {isTrialing ? (
                                <div>
                                    Your free trial started on <strong>{currentSubscriptionTrialStart}</strong> and
                                    {' '}
                                    will expire on <strong>{currentSubscriptionTrialEnd}</strong>
                                </div>
                            ) : (
                                <div>
                                    Your current subscription started on <strong>{currentSubscriptionCreated}</strong>.
                                </div>
                            )}
                        </CardBody>
                    </Card>
                    <Card className="text-center">
                        <CardBody>
                            <Row>
                                <Col sm="3">{this._renderTicketUsage()}</Col>
                                <Col sm="3">{this._renderIntegrationUsage()}</Col>
                                <Col sm="3" className={css['plan-usage-reset']}>
                                    <div><strong>Usage reset on:</strong></div>
                                    <div>{periodEnd}</div>
                                </Col>
                                <Col sm="3" className={css['plan-button']}>
                                    <Button
                                        color={isTrialing ? 'primary' : 'secondary'}
                                        onClick={() => {
                                            browserHistory.push('/app/settings/billing/plans')
                                        }}
                                    >
                                        {isTrialing ? 'Choose plan' : 'Update plan'}
                                    </Button>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </CardGroup>
                <p>
                    If you have any questions or if you want to unsubscribe, please
                    contact us at <a href="mailto:support@gorgias.io">support@gorgias.io</a> or
                    {' '}
                    <a href="" onClick={openChat}>Live Chat</a>.
                </p>
            </div>
        )
    }
}

export default connect((state) => {
    const currentSubscription = currentAccountSelectors.getCurrentSubscription(state)
    return {
        currentSubscription,
        activeIntegrations: integrationSelectors.getActiveIntegrations(state),
        currentPlan: billingSelectors.getPlan(currentSubscription.get('plan'))(state),
        currentUsage: billingSelectors.currentUsage(state),
    }
}, {fetchCurrentUsage})(BillingUsage)
