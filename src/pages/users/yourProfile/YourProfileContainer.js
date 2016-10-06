import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {pick as _pick} from 'lodash'

import * as UserActions from '../../../state/users/actions'
import YourProfileView from './components/YourProfileView'


class YourProfileContainer extends React.Component {
    componentWillReceiveProps(nextProps) {
        // Reload the page when modifying currentUser.language (e.g. the timeformat), to refresh all moment instances
        if (this.props.currentUser.get('language') !== nextProps.currentUser.get('language')) {
            window.location.reload(false) // reload only from the cache; we just need all the `moment` objects to reinit
        }
    }

    render() {
        const {currentUser} = this.props
        let prunedCurrentUser = fromJS({})

        if (!currentUser.delete('_internal').isEmpty()) {
            prunedCurrentUser = fromJS(_pick(
                currentUser.toJS(), ['name', 'email', 'timezone', 'language', 'signature_text', 'signature_html']
            ))
        }

        return (
            <YourProfileView
                currentUser={prunedCurrentUser}
                isLoading={currentUser.getIn(['_internal', 'loading'])}
                actions={this.props.actions}
            />
        )
    }
}

YourProfileContainer.propTypes = {
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
        actions: bindActionCreators(UserActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(YourProfileContainer)
