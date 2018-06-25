import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as WidgetsActions from '../../../state/widgets/actions'
import * as TicketActions from '../../../state/ticket/actions'
import * as UserActions from '../../../state/users/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors'

class TicketSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params, location, sources} = this.props
        actions.ticket.fetchTicket(params.ticketId)

        // load customer
        if (location.query.customer) {
            const userId = parseInt(location.query.customer)
            if (
                params.ticketId === 'new' &&
                location.query.customer &&
                sources.getIn(['ticket', 'customer', 'id']) !== userId
            ) {
                actions.user.fetchUser(userId)
            }
        }
    }

    render() {
        const {
            ticket,
            widgets,
            actions,
            sources,
            params,
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
            ticket: bindActionCreators(TicketActions, dispatch),
            widgets: bindActionCreators(WidgetsActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketSourceContainer)
