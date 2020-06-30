import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import * as ViewsActions from '../../../state/views/actions'
import RecentChats from '../../common/components/RecentChats'
import Navbar from '../../common/components/Navbar'

import TicketsNavbarView from './components/TicketsNavbarView'

class TicketNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        const viewId = this.props.params.viewId
            ? this.props.params.viewId
            : this.props.location.query.viewId
        this.props.actions.fetchViews(viewId)
    }

    render() {
        return (
            <Navbar activeContent="tickets">
                <RecentChats />
                <TicketsNavbarView
                    settingType="ticket-views"
                    isLoading={this.props.isLoading}
                />
            </Navbar>
        )
    }
}

TicketNavbarContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object,
    }),
    setting: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
}

const mapStateToProps = (state) => {
    return {
        isLoading: state.currentUser.getIn(
            ['_internal', 'loading', 'settings', 'ticket-views'],
            false
        ),
    }
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ViewsActions, dispatch),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TicketNavbarContainer)
