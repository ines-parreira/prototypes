import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as ViewActions from '../../../state/view/actions'
import TicketsNavbarView from './components/TicketsNavbarView'
import ActivityWidget from '../../common/components/ActivityWidget'
import Navbar from '../../common/components/Navbar'

class TicketNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        const viewSlug = this.props.params.view ? this.props.params.view : this.props.location.query.view
        this.props.actions.fetchViews(viewSlug)
    }

    render() {
        return (
            <Navbar currentUser={this.props.currentUser} activeContent="tickets">
                <ActivityWidget activity={this.props.activity} />
                <TicketsNavbarView
                    views={this.props.views}
                    currentView={this.props.views.get('active')}
                    setViewActive={this.props.actions.setViewActive}
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
        actions: bindActionCreators(ViewActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketNavbarContainer)
