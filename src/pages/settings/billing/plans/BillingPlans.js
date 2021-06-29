//@flow

import React from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router-dom'

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

import {notify} from '../../../../state/notifications/actions.ts'
import {updateSubscription} from '../../../../state/currentAccount/actions.ts'
import * as billingSelectors from '../../../../state/billing/selectors.ts'
import * as currentAccountSelectors from '../../../../state/currentAccount/selectors.ts'
import PageHeader from '../../../common/components/PageHeader.tsx'
import {setFutureSubscriptionPlan} from '../../../../state/billing/actions.ts'
import history from '../../../history.ts'
import {openChat} from '../../../../utils.ts'

import css from './BillingPlans.less'
import {getEnterprisePlanCardFeatures} from './billingPlanFeatures.tsx'
import PlanCard, {PlanCardTheme} from './PlanCard.tsx'
import BillingComparisonPlanCard from './BillingComparisonPlanCard.tsx'

type Props = {
    currentPlan: Object,
    plans: Object,
    subscription: Object,
    shouldPayWithShopify: boolean,
    isTrialing: boolean,
    accountHasLegacyPlan: boolean,
    notify: Function,
    isAllowedToChangePlan: Function,
    updateSubscription: Function,
    setFutureSubscriptionPlan: (string) => void,
    location: Object,
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
        window.history.replaceState({}, '')
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
                    history.push('/app/settings/billing')
                } else {
                    history.push('/app/settings/billing/add-credit-card')
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
            <div>
                <h3 className="mb-4">Frequently asked questions</h3>
                <Row className={css.faq}>
                    <Col sm={6}>
                        <dl>
                            <dt>What's a ticket?</dt>
                            <dd>
                                A ticket is a conversation with a customer. It
                                can be either an email thread, a chat, or
                                Messenger conversation.
                            </dd>

                            <dt>Do I have to pay for all tickets received?</dt>
                            <dd>
                                No. You only pay for tickets that contain a
                                response sent from Gorgias. Think of each ticket
                                as a conversation.
                            </dd>

                            <dt>Do I need to pay for live chat?</dt>
                            <dd>
                                No, all channels, including live chat are
                                included. You can connect as many chat widgets,
                                Facebook pages, and email addresses as you want.
                            </dd>
                        </dl>
                    </Col>
                    <Col sm={6}>
                        <dl>
                            <dt>How many tickets a month will I have?</dt>
                            <dd>
                                As a general guideline, most stores can expect
                                the number of tickets to be 0.25% - 0.5% of all
                                orders.
                            </dd>

                            <dt>
                                What level of support is included in my plan?
                            </dt>
                            <dd>
                                We provide all our customers with the same level
                                of support. We're available 9am-7pm PST, over
                                chat, email & phone. You can also join our Slack
                                community to chat with our team.
                            </dd>

                            <dt>How many tickets a day can a rep handle?</dt>
                            <dd>
                                Top reps using built-in automations and macros
                                close out 100-200 tickets per day.
                            </dd>
                        </dl>
                    </Col>
                </Row>
            </div>
        </Container>
    )

    _renderPlans = () => {
        const {
            currentPlan,
            location: {state},
            plans,
            accountHasLegacyPlan,
        } = this.props

        const {selectedInterval} = this.state
        const isCustomPlan = currentPlan.get('custom', false)
        let availablePlans = isCustomPlan
            ? plans.filter((plan) => plan.get('id') === currentPlan.get('id'))
            : plans.filter(
                  (plan) =>
                      plan.get('interval') === selectedInterval &&
                      plan.get('public')
              )

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
                    <>
                        {accountHasLegacyPlan && (
                            <BillingComparisonPlanCard
                                className="mt-4"
                                plan={currentPlan.toJS()}
                                isCurrentPlan
                                isUpdating={this.state.isUpdating}
                            />
                        )}
                        {availablePlans
                            .mapEntries(([planId, plan]) => {
                                const isCurrentPlan =
                                    !accountHasLegacyPlan &&
                                    plan.get('id') === currentPlan.get('id')
                                return [
                                    planId,
                                    <BillingComparisonPlanCard
                                        key={planId.split('-')[0]}
                                        className="mt-4"
                                        plan={plan.toJS()}
                                        isCurrentPlan={isCurrentPlan}
                                        isUpdating={this.state.isUpdating}
                                        onPlanChange={() => {
                                            this._updateSubscription(planId)
                                        }}
                                        defaultIsPlanChangeConfirmationOpen={
                                            state &&
                                            state.openedPlanPopover ===
                                                plan.get('name')
                                        }
                                    />,
                                ]
                            })
                            .toList()}
                    </>
                    {!isCustomPlan && (
                        <PlanCard
                            className="mt-4"
                            planName="Enterprise"
                            theme={PlanCardTheme.Gold}
                            price="Custom price"
                            features={getEnterprisePlanCardFeatures()}
                            footer={
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

export default withRouter(
    connect(
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
                subscription: currentAccountSelectors.getCurrentSubscription(
                    state
                ),
                accountHasLegacyPlan: billingSelectors.hasLegacyPlan(state),
            }
        },
        {notify, updateSubscription, setFutureSubscriptionPlan}
    )(BillingPlans)
)
