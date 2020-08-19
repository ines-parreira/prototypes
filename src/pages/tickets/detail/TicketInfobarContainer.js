import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {withRouter} from 'react-router'

import Infobar from '../../common/components/infobar/Infobar'

import * as WidgetActions from '../../../state/widgets/actions'
import * as InfobarActions from '../../../state/infobar/actions.ts'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors'

class TicketInfobarContainer extends React.Component {
    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('ticket')
        actions.widgets.fetchWidgets()
    }

    render() {
        const {
            actions,
            widgets,
            route,
            infobar,
            ticket,
            sources,
            params,
        } = this.props

        // the || is used to replace null
        const customer = sources.getIn(['ticket', 'customer']) || fromJS({})

        return (
            <Infobar
                actions={actions}
                infobar={infobar}
                sources={sources}
                isRouteEditingWidgets={!!route.isEditingWidgets}
                identifier={ticket.get('id', params.ticketId || '').toString()}
                customer={customer}
                widgets={widgets}
                context="ticket"
            />
        )
    }
}

TicketInfobarContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    infobar: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,

    // react-router
    params: PropTypes.shape({
        ticketId: PropTypes.string,
    }).isRequired,
}

function mapStateToProps(state) {
    return {
        infobar: state.infobar,
        ticket: state.ticket,
        widgets: state.widgets,
        sources: getSourcesWithCustomer(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            infobar: bindActionCreators(InfobarActions, dispatch),
            widgets: bindActionCreators(WidgetActions, dispatch),
        },
    }
}

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(TicketInfobarContainer)
)
