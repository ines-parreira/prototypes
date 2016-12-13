import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import * as WidgetsActions from '../../../state/widgets/actions'
import * as UsersActions from '../../../state/users/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'

import {getActiveUser, getActiveUserId} from '../../../state/users/selectors'

class UserSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.users.fetchUser(params.userId)
    }

    render() {
        const {
            widgets,
            actions,
            activeUser,
            activeUserId,
        } = this.props

        if (!activeUserId) {
            return null
        }

        const identifier = activeUserId.toString()

        const sources = fromJS({
            user: activeUser,
        })

        return (
            <SourceWrapper
                context="user"
                identifier={identifier}
                sources={sources}
                widgets={widgets}
                actions={actions}
            />
        )
    }
}

UserSourceContainer.propTypes = {
    params: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    activeUser: PropTypes.object.isRequired,
    activeUserId: PropTypes.number,
}

function mapStateToProps(state) {
    return {
        widgets: state.widgets,
        activeUser: getActiveUser(state),
        activeUserId: getActiveUserId(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            users: bindActionCreators(UsersActions, dispatch),
            widgets: bindActionCreators(WidgetsActions, dispatch)
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSourceContainer)
