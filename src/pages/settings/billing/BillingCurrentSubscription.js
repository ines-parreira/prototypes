import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import {Alert} from 'reactstrap'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as billingSelectors from '../../../state/billing/selectors'

export class BillingCurrentSubscription extends Component {
    static propTypes = {
        currentSubscription: PropTypes.object.isRequired,
        currentPlan: PropTypes.object.isRequired,
    }

    render() {
        const {currentSubscription, currentPlan} = this.props
        if (currentSubscription.isEmpty()) {
            return null
        }

        const currentSubscriptionCreated = moment(currentSubscription.get('created_datetime')).format('MMM DD YYYY')
        const currentSubscriptionTrialEnd = moment(currentSubscription.get('trial_end_datetime')).format('MMM DD')

        return (
            <div className="mb-4">
                <h5>
                <span>Your current subscription started on <strong>{currentSubscriptionCreated}</strong>.
                </span>
                    {currentSubscription.get('status') === 'trialing' && (
                        <span> Your free trial final day is on <strong>{currentSubscriptionTrialEnd}</strong>.
                    </span>
                    )}

                </h5>
                {currentPlan && currentPlan.get('public') === false && (
                    <Alert color="warning">
                        <i className="fa fa-info-circle"/> Your account is on a legacy plan: <strong>
                        {currentPlan.get('name')}</strong>{currentPlan.get('amount') !== 0 && (
                        ` (${currentPlan.get('currencySign')}${currentPlan.get('amount')}/${currentPlan.get('interval')})`
                    )}.
                        To upgrade to a newer plan choose one of the plans below (the charges are pro-rated).
                    </Alert>
                )}
            </div>
        )
    }
}

export default connect((state) => {
    return {
        currentSubscription: currentAccountSelectors.getCurrentSubscription(state),
        currentPlan: billingSelectors.currentPlan(state),
    }
})(BillingCurrentSubscription)
