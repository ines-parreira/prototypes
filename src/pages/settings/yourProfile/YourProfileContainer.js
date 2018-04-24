import React, {PropTypes} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import {pick as _pick} from 'lodash'

import * as UserActions from '../../../state/users/actions'
import {submitSetting} from '../../../state/currentUser/actions'
import YourProfileView from './components/YourProfileView'

import {getPreferences} from '../../../state/currentUser/selectors'


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
                currentUser.toJS(), ['name', 'email', 'bio', 'timezone', 'language', 'signature_text', 'signature_html', 'settings', 'meta']
            ))
        }

        return (
            <YourProfileView
                currentUser={prunedCurrentUser}
                isLoading={currentUser.getIn(['_internal', 'loading', 'currentUser'])}
                actions={this.props.actions}
                submitSetting={this.props.submitSetting}
                preferences={this.props.preferences}
            />
        )
    }
}

YourProfileContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    submitSetting: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        preferences: getPreferences(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(UserActions, dispatch),
        submitSetting: bindActionCreators(submitSetting, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(YourProfileContainer)
