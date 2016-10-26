import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Infobar from '../../common/components/infobar/Infobar'
import {fromJS} from 'immutable'

import * as WidgetActions from '../../../state/widgets/actions'
import * as InfobarActions from '../../../state/infobar/actions'

class UserInfobarContainer extends React.Component {
    componentWillMount() {
        const {actions} = this.props

        actions.widgets.selectContext('user')
        actions.widgets.fetchWidgets()
    }

    render() {
        const {
            actions,
            users,
            widgets,
            route,
            infobar
        } = this.props

        // the || is used to replace null
        const user = users.get('active', fromJS({})) || fromJS({})
        const identifier = user.get('id', '').toString()

        const sources = fromJS({
            user
        })

        return (
            <Infobar
                actions={actions}
                infobar={infobar}
                sources={sources}
                isRouteEditingWidgets={!!route.isEditingWidgets}
                identifier={identifier}
                user={user}
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
    users: PropTypes.object.isRequired,
    widgets: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        infobar: state.infobar,
        users: state.users,
        widgets: state.widgets
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
