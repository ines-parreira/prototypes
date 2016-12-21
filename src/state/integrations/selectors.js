import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getIntegrationsState = state => state.integrations || fromJS({})

export const getAuthData = type => createSelector(
    [getIntegrationsState],
    state => state.getIn(['authentication', type], fromJS({}))
)

export const getRedirectUri = type => createSelector(
    [getAuthData(type)],
    state => state.get('redirect_uri', '')
)

export const makeGetRedirectUri = state => type => getRedirectUri(type)(state)
