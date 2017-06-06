import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'

export class BillingCurrentSubscription extends Component {
    static propTypes = {
        currentSubscription: PropTypes.object.isRequired,
    }

    render() {
        const {currentSubscription} = this.props
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
            </div>
        )
    }
}
export default connect((state) => {
    return {
        currentSubscription: currentAccountSelectors.getCurrentSubscription(state)
    }
})(BillingCurrentSubscription)
