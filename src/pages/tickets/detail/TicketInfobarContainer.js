import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {withRouter} from 'react-router-dom'

import Infobar from '../../common/components/infobar/Infobar'

import * as WidgetActions from '../../../state/widgets/actions.ts'
import * as InfobarActions from '../../../state/infobar/actions.ts'
import {getSourcesWithCustomer} from '../../../state/widgets/selectors.ts'

export class TicketInfobarContainer extends React.Component {
    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('ticket')
        actions.widgets.fetchWidgets()
    }

    render() {
        const {
            actions,
            widgets,
            isEditingWidgets,
            infobar,
            ticket,
            sources,
            match: {params},
        } = this.props

        // the || is used to replace null
        const customer = sources.getIn(['ticket', 'customer']) || fromJS({})

        return (
            <Infobar
                actions={actions}
                infobar={infobar}
                sources={sources}
                isRouteEditingWidgets={!!isEditingWidgets}
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
    isEditingWidgets: PropTypes.bool,
    ticket: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    sources: PropTypes.object.isRequired,

    // react-router
    match: PropTypes.object.isRequired,
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
