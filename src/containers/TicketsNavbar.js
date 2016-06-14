import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as ViewActions from '../actions/view'
import TicketsNavbarView from '../components/ticket/TicketsNavbarView'

class TicketsNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        this.props.actions.fetchViews(this.props.params.view)
    }

    render() {
        return (
            <TicketsNavbarView
                views={this.props.views}
                currentView={this.props.views.get('active')}
                setViewActive={this.props.actions.setViewActive}
            />
        )
    }
}

TicketsNavbarContainer.propTypes = {
    views: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        views: state.views
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ViewActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsNavbarContainer)
