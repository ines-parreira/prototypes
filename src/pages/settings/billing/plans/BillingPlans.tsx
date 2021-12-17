import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'
import {Map} from 'immutable'

import * as currentAccountSelectors from '../../../../state/currentAccount/selectors'
import PageHeader from '../../../common/components/PageHeader'
import history from '../../../history'
import {RootState} from '../../../../state/types'

import css from './BillingPlans.less'
import BillingPlansComparison from './BillingPlansComparison'

type Props = ConnectedProps<typeof connector> &
    RouteComponentProps<
        any,
        any,
        // TODO[COR-1569]: There should be a single source of truth for the state
        {isAutomationAddOnChecked?: boolean; openedPlanModal?: string}
    >

class BillingPlans extends React.Component<Props> {
    constructor(props: Props) {
        super(props)
        window.history.replaceState({}, '')
    }

    handleSubscriptionChanged = (prevSubscription: Map<any, any>) => {
        const {isTrialing, shouldPayWithShopify} = this.props
        if (!prevSubscription.get('status') || isTrialing) {
            if (shouldPayWithShopify) {
                history.push('/app/settings/billing')
            } else {
                history.push('/app/settings/billing/add-payment-method')
            }
        }
    }

    render() {
        const {
            location: {state},
        } = this.props
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
                <BillingPlansComparison
                    isAutomationAddOnChecked={state?.isAutomationAddOnChecked}
                    openedPlanModal={state?.openedPlanModal}
                    onSubscriptionChanged={this.handleSubscriptionChanged}
                />
                <Container fluid className="page-container">
                    <div>
                        <h3 className="mb-4">Frequently asked questions</h3>
                        <Row className={css.faq}>
                            <Col sm={6}>
                                <dl>
                                    <dt>What's a ticket?</dt>
                                    <dd>
                                        A ticket is a conversation with a
                                        customer. It can be either an email
                                        thread, a chat, or Messenger
                                        conversation.
                                    </dd>

                                    <dt>
                                        Do I have to pay for all tickets
                                        received?
                                    </dt>
                                    <dd>
                                        No. You only pay for tickets that
                                        contain a response sent from Gorgias.
                                        Think of each ticket as a conversation.
                                    </dd>

                                    <dt>Do I need to pay for live chat?</dt>
                                    <dd>
                                        No, all channels, including live chat
                                        are included. You can connect as many
                                        chat widgets, Facebook pages, and email
                                        addresses as you want.
                                    </dd>
                                </dl>
                            </Col>
                            <Col sm={6}>
                                <dl>
                                    <dt>
                                        How many tickets a month will I have?
                                    </dt>
                                    <dd>
                                        As a general guideline, most stores can
                                        expect the number of tickets to be 0.25%
                                        - 0.5% of all orders.
                                    </dd>

                                    <dt>
                                        What level of support is included in my
                                        plan?
                                    </dt>
                                    <dd>
                                        We provide all our customers with the
                                        same level of support. We’re available
                                        24/7, over chat and email. You can also
                                        join our
                                        <a
                                            href="https://www.facebook.com/groups/customersupportgroup/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {' '}
                                            Facebook community{' '}
                                        </a>
                                        to chat with our team.
                                    </dd>

                                    <dt>
                                        How many tickets a day can a rep handle?
                                    </dt>
                                    <dd>
                                        Top reps using built-in automations and
                                        macros close out 100-200 tickets per
                                        day.
                                    </dd>
                                </dl>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </div>
        )
    }
}

const connector = connect((state: RootState) => {
    return {
        isTrialing: currentAccountSelectors.isTrialing(state),
        shouldPayWithShopify:
            currentAccountSelectors.shouldPayWithShopify(state),
        subscription: currentAccountSelectors.getCurrentSubscription(state),
    }
}, {})

export default withRouter(connector(BillingPlans))
