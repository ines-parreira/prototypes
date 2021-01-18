import React from 'react'
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {parse} from 'query-string'

import * as widgetsActions from '../../../state/widgets/actions.ts'
import * as ticketActions from '../../../state/ticket/actions.ts'
import * as customersActions from '../../../state/customers/actions.ts'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors.ts'

class TicketSourceContainer extends React.Component {
    componentWillMount() {
        const {
            actions,
            match: {params},
            location,
            sources,
        } = this.props
        actions.ticket.fetchTicket(params.ticketId)
        const locationCustomerQuery = parse(location.search).customer

        // load customer
        if (locationCustomerQuery) {
            const customerId = parseInt(locationCustomerQuery)
            if (
                params.ticketId === 'new' &&
                locationCustomerQuery &&
                sources.getIn(['ticket', 'customer', 'id']) !== customerId
            ) {
                actions.customers.fetchCustomer(customerId)
            }
        }
    }

    render() {
        const {
            ticket,
            widgets,
            actions,
            sources,
            match: {params},
        } = this.props

        return (
            <SourceWrapper
                context="ticket"
                identifier={ticket.get('id', params.ticketId || '').toString()}
                sources={sources}
                widgets={widgets}
                actions={actions}
            />
        )
    }
}

TicketSourceContainer.propTypes = {
    ticket: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,

    // react-router
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        widgets: state.widgets,
        sources: getSourcesWithCustomer(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(ticketActions, dispatch),
            widgets: bindActionCreators(widgetsActions, dispatch),
            customers: bindActionCreators(customersActions, dispatch),
        },
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(TicketSourceContainer)
)
