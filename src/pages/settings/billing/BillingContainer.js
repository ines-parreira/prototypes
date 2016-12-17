import {connect} from 'react-redux'
import {fetchCurrentUsage, fetchInvoices, fetchCreditCard} from '../../../state/billing/actions'
import Billing from './components/Billing'
import {fromJS} from 'immutable'

function mapStateToProps(state) {
    const billing = state.billing
    return {
        isFetchingCurrentUsage: billing.getIn(['_internal', 'loading', 'fetchCurrentUsage'], false),
        isFetchingCreditCard: billing.getIn(['_internal', 'loading', 'fetchCreditCard'], false),
        isFetchingInvoices: billing.getIn(['_internal', 'loading', 'fetchInvoices'], false),
        plan: billing.get('plan'),
        usage: billing.get('currentUsage', fromJS({})),
        creditCard: billing.get('creditCard', fromJS({})),
        // only give paid and unpaid invoices with almost one attempt of payment
        invoices: billing.get('invoices', fromJS([]))
            .filter((invoice) => invoice.get('attempted') && invoice.get('amount_due') > 0)
    }
}

export default connect(mapStateToProps, {
    fetchCurrentUsage,
    fetchInvoices,
    fetchCreditCard
})(Billing)
