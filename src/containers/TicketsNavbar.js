import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as ViewActions from '../actions/view'
import Navbar from '../components/Navbar'
import { DEFAULT_VIEW } from '../constants'

class TicketsNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        this.props.actions.fetchViews('/api/views/', {
            type: 'ticket-list'
        })
    }

    getViewSlug = (props) => {
        // TODO: Use reselect for this
        const usedProps = props || this.props
        const { params } = usedProps
        return params ? params.view : DEFAULT_VIEW
    }

    render() {
        return (
            <Navbar views={this.props.views}
                    currentViewSlug={this.getViewSlug()}
                    currentUser={this.props.currentUser}
            />
        )
    }
}

TicketsNavbarContainer.propTypes = {
    views: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        views: state.views,
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(ViewActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketsNavbarContainer)
