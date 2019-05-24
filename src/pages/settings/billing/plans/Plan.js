// @flow

import classnames from 'classnames'
import React, {type Node} from 'react'
import {Button, Card, CardBody, CardFooter, CardHeader} from 'reactstrap'

import Tooltip from '../../../common/components/Tooltip'
import './Plan.less'

type Props = {
    plan: Object,
    callToAction?: Node,
    features?: Node,
    isCurrentPlan?: boolean,
    isFeatured?: boolean,
    isTrialing?: boolean,
    isUpdating?: boolean,
    showFooter?: boolean,
    onClick?: Function,
}

export class Plan extends React.Component<Props> {
    static defaultProps = {
        isCurrentPlan: false,
        isFeatured: false,
        isTrialing: false,
        isUpdating: false,
        showFooter: true,
    }

    render() {
        const {plan, isUpdating, isCurrentPlan, isTrialing, isFeatured, features, showFooter, callToAction} = this.props
        const planSentencePrefix = isTrialing ? 'Choose' : 'Switch to'
        const costMultiplier = 100
        const costPerTicket = (plan.get('cost_per_ticket') * costMultiplier).toFixed(2)
        const planName = plan.get('name')
        const planInterval = plan.get('interval') === 'month' ? 'mo' : 'yr'
        const tooltipId = `additional-tickets-tooltip-${planName.replace(/\s/g, '')}`

        return (
            <Card
                className={classnames('plan', `plan-${planName}`, {featured: isFeatured})}
                outline
            >
                <CardHeader className={classnames('plan-header', {'featured-header': isFeatured})}>
                    {isFeatured && (
                        <div className="featured-header-title">Recommended Plan</div>
                    )}
                    <div className="header-text">
                        <strong>{planName}</strong>

                        {plan.get('amount') && (
                            <span className="float-right">
                                {plan.get('currencySign')}{plan.get('amount')}/{planInterval}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardBody>
                    {features ? features : (
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
                                    playlist_add_check
                                </i>
                                {' '}
                                <strong>{plan.get('free_tickets')}</strong> tickets included
                            </li>
                            <li>
                                <i className="material-icons feature-icon">
                                    playlist_add
                                </i>
                                {' '}
                                <strong>
                                    + {plan.get('currencySign')}{costPerTicket}
                                </strong> per {costMultiplier} tickets
                                {' '}
                                <a id={tooltipId}>
                                    <i className="material-icons text-muted">info_outline</i>
                                </a>
                                <Tooltip target={tooltipId}>
                                    If you reply to more tickets than included in your plan
                                    this is the additional cost per 100 tickets.
                                </Tooltip>
                            </li>
                            <li>
                                <i className="material-icons feature-icon">
                                    extension
                                </i>
                                {' '}
                                <strong>{plan.get('integrations')}</strong> integrations
                            </li>
                        </ul>
                    )}
                </CardBody>
                {showFooter && (
                    <CardFooter>
                        {callToAction ? callToAction : (
                            <Button
                                className={classnames({'btn-loading': isUpdating})}
                                color='link'
                                disabled={!isTrialing && (isCurrentPlan || isUpdating)}
                                onClick={this.props.onClick}
                            >
                                {isTrialing ? (
                                    `Choose ${plan.get('name')} plan`
                                ) : (
                                    isCurrentPlan ? 'Your current plan' : `${planSentencePrefix} ${plan.get('name')} plan`
                                )}
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        )
    }
}
