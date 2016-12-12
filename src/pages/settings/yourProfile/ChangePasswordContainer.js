import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'

import * as CurrentUserActions from '../../../state/currentUser/actions'
import ChangePasswordView from './components/ChangePasswordView'


class ChangePasswordContainer extends React.Component {
    render() {
        return (
            <ChangePasswordView
                isLoading={this.props.currentUser.getIn(['_internal', 'loading'])}
                actions={this.props.actions}
            />
        )
    }
}

ChangePasswordContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(CurrentUserActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordContainer)
