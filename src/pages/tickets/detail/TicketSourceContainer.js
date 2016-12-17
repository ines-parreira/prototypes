import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import * as WidgetsActions from '../../../state/widgets/actions'
import * as TicketActions from '../../../state/ticket/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'
import {getSources} from '../../../state/widgets/selectors'

class TicketSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.ticket.fetchTicket(params.ticketId)
    }

    render() {
        const {
            ticket,
            widgets,
            actions,
            sources,
        } = this.props

        return (
            <SourceWrapper
                context="ticket"
                identifier={ticket.get('id', '').toString()}
                sources={sources}
                widgets={widgets}
                actions={actions}
            />
        )
    }
}

TicketSourceContainer.propTypes = {
    params: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        ticket: state.ticket,
        widgets: state.widgets,
        sources: getSources(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            widgets: bindActionCreators(WidgetsActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketSourceContainer)
