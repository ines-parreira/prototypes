import React, {Component, PropTypes} from 'react'
import {Table, Badge} from 'reactstrap'
import {connect} from 'react-redux'

import moment from 'moment'
import * as billingSelectors from '../../../state/billing/selectors'
import {fetchInvoices} from '../../../state/billing/actions'
import Loader from '../../common/components/Loader'

export class BillingInvoices extends Component {
    static propTypes = {
        fetchInvoices: PropTypes.func.isRequired,
        invoices: PropTypes.object.isRequired,
    }

    state = {
        isLoading: false,
    }

    componentWillMount() {
        this.setState({isLoading: true})
        this.props.fetchInvoices().then(() => {
            this.setState({isLoading: false})
        })
    }

    render() {
        const {invoices} = this.props
        if (this.state.isLoading) {
            return <Loader />
        }

        if (invoices.isEmpty()) {
            return null
        }

        return (
            <div>
                <h4>Invoice history</h4>
                <Table striped>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Tickets</th>
                        <th>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoices.map((invoice) => {
                        const paid = invoice.get('paid')
                        const tickets = invoice.getIn(['metadata', 'tickets'], '-')
                        return (
                            <tr key={invoice.get('id')}>
                                <td>{moment.unix(invoice.get('date')).format('LL')}</td>
                                <td>
                                    {paid ? (
                                        <Badge color="success">Paid</Badge>
                                    ) : (
                                        <Badge color="danger">Unpaid</Badge>
                                    )}
                                </td>
                                <td>{tickets} </td>
                                <td>{`$${invoice.get('amount_due') / 100}`} </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
            </div>
        )
    }
}
export default connect((state) => {
    return {
        invoices: billingSelectors.invoices(state),
    }
}, {fetchInvoices})(BillingInvoices)
