import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as ViewsActions from '../../../state/views/actions'
import UsersNavbarView from './components/UsersNavbarView'
import Navbar from '../../common/components/Navbar'
import {fromJS} from 'immutable'

class UserNavbarContainer extends React.Component {
    componentWillMount() {
        // fetch the list view only
        const viewId = this.props.params.viewId ? this.props.params.viewId : this.props.location.query.viewId
        this.props.actions.fetchViews(viewId)
    }

    render() {
        return (
            <Navbar activeContent="users">
                <UsersNavbarView
                    settingType="user-views"
                    setting={this.props.setting}
                    isLoading={this.props.isLoading}
                    views={this.props.views}
                    currentView={this.props.views.get('active')}
                />
            </Navbar>
        )
    }
}

UserNavbarContainer.propTypes = {
    views: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object
    }),
    setting: PropTypes.object,
    isLoading: PropTypes.bool.isRequired
}

const mapStateToProps = (state) => {
    const setting = state.currentUser
        .get('settings', fromJS([]))
        .find((_setting) => _setting.get('type') === 'user-views')

    return {
        views: state.views,
        setting,
        isLoading: state.currentUser.getIn(['_internal', 'loading'], false)
    }
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(ViewsActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(UserNavbarContainer)
