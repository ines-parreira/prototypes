import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'

import {StoreDispatch, StoreState} from 'state/types'
import {EditableUserProfile, User, UserSetting} from 'config/types/user'
import {submitSetting, updateCurrentUser} from 'state/currentUser/actions'
import {getPreferences} from 'state/currentUser/selectors'

import YourProfileView from './components/YourProfileView'

type Props = ConnectedProps<typeof connector>

class YourProfileContainer extends Component<Props> {
    componentWillReceiveProps(nextProps: Props) {
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
                updateCurrentUser={
                    this.props.updateCurrentUser as unknown as (
                        object: Partial<EditableUserProfile>
                    ) => Promise<User>
                }
                submitSetting={
                    this.props.submitSetting as unknown as (
                        object: UserSetting,
                        notification: boolean
                    ) => Promise<unknown>
                }
                preferences={this.props.preferences}
            />
        )
    }
}

function mapStateToProps(state: StoreState) {
    return {
        currentUser: state.currentUser,
        preferences: getPreferences(state),
    }
}

function mapDispatchToProps(dispatch: StoreDispatch) {
    return {
        updateCurrentUser: bindActionCreators(updateCurrentUser, dispatch),
        submitSetting: bindActionCreators(submitSetting, dispatch),
    }
}

const connector = connect(mapStateToProps, mapDispatchToProps)

export default connector(YourProfileContainer)
