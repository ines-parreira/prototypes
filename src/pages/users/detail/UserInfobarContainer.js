import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Infobar from '../../common/components/infobar/Infobar'
import {fromJS} from 'immutable'

import * as WidgetActions from '../../../state/widgets/actions'
import * as InfobarActions from '../../../state/infobar/actions'

import {getActiveUser, getActiveUserId} from '../../../state/users/selectors'

class UserInfobarContainer extends React.Component {
    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('user')
        actions.widgets.fetchWidgets()
    }

    render() {
        const {
            actions,
            widgets,
            route,
            infobar,
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
            <Infobar
                actions={actions}
                infobar={infobar}
                sources={sources}
                isRouteEditingWidgets={!!route.isEditingWidgets}
                identifier={identifier}
                user={activeUser}
                widgets={widgets}
                context="user"
            />
        )
    }
}

UserInfobarContainer.propTypes = {
    actions: PropTypes.object.isRequired,
    infobar: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    activeUser: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired,
    activeUserId: PropTypes.number,
}

function mapStateToProps(state) {
    return {
        infobar: state.infobar,
        widgets: state.widgets,
        activeUser: getActiveUser(state),
        activeUserId: getActiveUserId(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(UserInfobarContainer)
