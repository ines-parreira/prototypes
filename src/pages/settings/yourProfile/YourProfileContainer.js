import React from 'react'
import PropTypes from 'prop-types'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'

import {
    submitSetting,
    updateCurrentUser,
} from '../../../state/currentUser/actions'
import {getPreferences} from '../../../state/currentUser/selectors'

import YourProfileView from './components/YourProfileView'

class YourProfileContainer extends React.Component {
    componentWillReceiveProps(nextProps) {
        // Reload the page when modifying currentUser.language (e.g. the timeformat), to refresh all moment instances
        if (
            this.props.currentUser.get('language') !==
            nextProps.currentUser.get('language')
        ) {
            window.location.reload(false) // reload only from the cache; we just need all the `moment` objects to reinit
        }
    }

    render() {
        const {currentUser} = this.props
        let prunedCurrentUser = fromJS({})

        if (!currentUser.delete('_internal').isEmpty()) {
            prunedCurrentUser = fromJS(
                _pick(currentUser.toJS(), [
                    'name',
                    'email',
                    'bio',
                    'timezone',
                    'language',
                    'settings',
                    'meta',
                ])
            )
        }

        return (
            <YourProfileView
                currentUser={prunedCurrentUser}
                isLoading={currentUser.getIn([
                    '_internal',
                    'loading',
                    'currentUser',
                ])}
                updateCurrentUser={this.props.updateCurrentUser}
                submitSetting={this.props.submitSetting}
                preferences={this.props.preferences}
            />
        )
    }
}

YourProfileContainer.propTypes = {
    currentUser: PropTypes.object.isRequired,
    updateCurrentUser: PropTypes.func.isRequired,
    submitSetting: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        preferences: getPreferences(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateCurrentUser: bindActionCreators(updateCurrentUser, dispatch),
        submitSetting: bindActionCreators(submitSetting, dispatch),
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(YourProfileContainer)
