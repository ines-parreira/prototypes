import React, {Component} from 'react'
import PropTypes from 'prop-types'
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
            return <Loader/>
        }

        if (invoices.isEmpty()) {
            return null
        }

        return (
            <div>
                <h4>
                    <i className="material-icons">receipt</i> Payment history
                </h4>
                <p>
                    The account owner will receive an invoice by email at the start of each billing period.
                    <br/>
                    <strong>Note:</strong> PDF invoices will soon be added to this list and the ability to change the
                    billing email address.
                </p>
                <Table striped>
                    <thead>
                    <tr>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoices.map((invoice) => {
                        const paid = invoice.get('paid')
                        return (
                            <tr key={invoice.get('id')}>
                                <td>
                                    {paid ? (
                                        <Badge color="success">Paid</Badge>
                                    ) : (
                                        <Badge color="danger">Unpaid</Badge>
                                    )}
                                </td>
                                <td>{moment.unix(invoice.get('date')).format('LL')}</td>
                                <td>{`$${invoice.get('amount_due') / 100}`} </td>
                                <td>{invoice.get('description') || '-'} </td>
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
