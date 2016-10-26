import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Infobar from '../../common/components/infobar/Infobar'
import {fromJS} from 'immutable'

import * as WidgetActions from '../../../state/widgets/actions'
import * as InfobarActions from '../../../state/infobar/actions'

class TicketInfobarContainer extends React.Component {
    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('ticket')
        actions.widgets.fetchWidgets()
    }

    render() {
        const {
            actions,
            ticket,
            widgets,
            route,
            infobar
        } = this.props

        // the || is used to replace null
        const user = ticket.get('requester', fromJS({})) || fromJS({})

        const sources = fromJS({
            ticket
        })

        return (
            <Infobar
                actions={actions}
                infobar={infobar}
                sources={sources}
                isRouteEditingWidgets={!!route.isEditingWidgets}
                identifier={ticket.get('id', '').toString()}
                user={user}
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
    widgets: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        infobar: state.infobar,
        ticket: state.ticket,
        widgets: state.widgets
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            infobar: bindActionCreators(InfobarActions, dispatch),
            widgets: bindActionCreators(WidgetActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketInfobarContainer)
