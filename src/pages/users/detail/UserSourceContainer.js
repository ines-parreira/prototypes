import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import * as WidgetsActions from '../../../state/widgets/actions'
import * as UsersActions from '../../../state/users/actions'

import SourceWrapper from '../../common/components/sourceWidgets/SourceWrapper'

class UserSourceContainer extends React.Component {
    componentWillMount() {
        const {actions, params} = this.props
        actions.users.fetchUser(params.userId)
    }

    render() {
        const {
            users,
            widgets,
            actions
        } = this.props

        // the || is used to replace null
        const user = users.get('active', fromJS({})) || fromJS({})
        const identifier = user.get('id', '').toString()

        const sources = fromJS({
            user
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
    users: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        users: state.users,
        widgets: state.widgets
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
