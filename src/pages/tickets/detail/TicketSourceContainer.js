import React from 'react'
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import * as widgetsActions from '../../../state/widgets/actions.ts'
import * as ticketActions from '../../../state/ticket/actions.ts'
import * as customersActions from '../../../state/customers/actions.ts'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors.ts'

class TicketSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params, location, sources} = this.props
        actions.ticket.fetchTicket(params.ticketId)

        // load customer
        if (location.query.customer) {
            const customerId = parseInt(location.query.customer)
            if (
                params.ticketId === 'new' &&
                location.query.customer &&
                sources.getIn(['ticket', 'customer', 'id']) !== customerId
            ) {
                actions.customers.fetchCustomer(customerId)
            }
        }
    }

    render() {
        const {ticket, widgets, actions, sources, params} = this.props

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
    params: PropTypes.object.isRequired,
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TicketSourceContainer)
