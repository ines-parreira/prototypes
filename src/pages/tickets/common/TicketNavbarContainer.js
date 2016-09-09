import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as ViewActions from '../../../state/views/actions'
import * as TicketsActions from '../../../state/tickets/actions'
import TicketsNavbarView from './components/TicketsNavbarView'
import ActivityWidget from '../../common/components/ActivityWidget'
import Navbar from '../../common/components/Navbar'

class TicketNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        const viewId = this.props.params.viewId ? this.props.params.viewId : this.props.location.query.viewId
        this.props.actions.views.fetchViews(viewId)
    }

    render() {
        return (
            <Navbar currentUser={this.props.currentUser} activeContent="tickets">
                <ActivityWidget activity={this.props.activity} />
                <TicketsNavbarView
                    views={this.props.views}
                    currentView={this.props.views.get('active')}
                    setViewActive={this.props.actions.views.setViewActive}
                    fetchTickets={this.props.actions.tickets.fetchTicketsPage}
                />
            </Navbar>
        )
    }
}

TicketNavbarContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
    views: PropTypes.object.isRequired,
    activity: PropTypes.object,
    actions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object
    })
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        activity: state.activity,
        views: state.views
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(ViewActions, dispatch),
            tickets: bindActionCreators(TicketsActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketNavbarContainer)
