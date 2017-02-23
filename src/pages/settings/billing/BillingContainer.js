import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {fromJS} from 'immutable'
import Billing from './components/Billing'
import {fetchCurrentUsage, fetchInvoices, fetchCreditCard} from '../../../state/billing/actions'
import {notify} from '../../../state/notifications/actions'
import * as currentAccountSelectors from './../../../state/currentAccount/selectors'

function mapStateToProps(state) {
    const billing = state.billing

    return {
        isFetchingCurrentUsage: billing.getIn(['_internal', 'loading', 'fetchCurrentUsage'], false),
        isFetchingCreditCard: billing.getIn(['_internal', 'loading', 'fetchCreditCard'], false),
        isFetchingInvoices: billing.getIn(['_internal', 'loading', 'fetchInvoices'], false),
        plan: billing.get('plan'),
        usage: billing.get('currentUsage', fromJS({})),
        creditCard: billing.get('creditCard', fromJS({})),
        // only give paid and unpaid invoices with at least one attempt of payment
        invoices: billing.get('invoices', fromJS([]))
            .filter((invoice) => invoice.get('attempted') && invoice.get('amount_due') > 0),
        paymentMethod: currentAccountSelectors.paymentMethod(state),
        paymentIsActive: currentAccountSelectors.paymentIsActive(state),
    }
}

export default withRouter(connect(mapStateToProps, {
    fetchCurrentUsage,
    fetchInvoices,
    fetchCreditCard,
    notify
})(Billing))
