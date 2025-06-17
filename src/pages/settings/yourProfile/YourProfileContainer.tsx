import { useMemo } from 'react'

import { fromJS } from 'immutable'
import _pick from 'lodash/pick'
import { connect, ConnectedProps } from 'react-redux'

import { UserRole } from 'config/types/user'
import { getPreferences } from 'state/currentUser/selectors'
import { StoreState } from 'state/types'

import { YourProfileView } from './components/YourProfileView'

function mapStateToProps(state: StoreState) {
    return {
        currentUser: state.currentUser,
        preferences: getPreferences(state),
    }
}

const connector = connect(mapStateToProps)

type YourProfileContainerProps = ConnectedProps<typeof connector>

function YourProfileContainer({
    currentUser,
    preferences,
}: YourProfileContainerProps) {
    const isGorgiasAgent = useMemo(() => {
        return currentUser.getIn(['role', 'name']) === UserRole.GorgiasAgent
    }, [currentUser])

    const prunedCurrentUser = useMemo(() => {
        if (!currentUser.delete('_internal').isEmpty()) {
            return fromJS(
                _pick(currentUser.toJS(), [
                    'name',
                    'email',
                    'bio',
                    'timezone',
                    'language',
                    'settings',
                    'meta',
                ]),
            )
        }
        return fromJS({})
    }, [currentUser])

    return (
        <YourProfileView
            currentUser={prunedCurrentUser}
            preferences={preferences}
            isGorgiasAgent={isGorgiasAgent}
        />
    )
}

export default connector(YourProfileContainer)
