import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import _isArray from 'lodash/isArray'
import {getFormValues} from 'redux-form'

export const getIntegrationsState = state => state.integrations || fromJS({})

export const getIntegrations = createSelector(
    [getIntegrationsState],
    state => state.get('integrations', fromJS([]))
)

export const getIntegrationsByTypes = types => createSelector(
    [getIntegrations],
    (integrations) => {
        if (!_isArray(types)) {
            types = [types]
        }

        return integrations.filter(integration => types.includes(integration.get('type')))
    }
)

export const getEmailIntegrations = createSelector(
    [getIntegrations],
    state => state.filter(inte => ['email', 'gmail'].includes(inte.get('type', '')))
)

// return email and gmail integrations formatted as channel
export const getChannels = createSelector(
    [getEmailIntegrations],
    state => state.map(inte => {
        let type = inte.get('type')

        if (inte.get('type') === 'gmail') {
            type = 'email'
        }

        return fromJS({
            id: inte.get('id'),
            type,
            name: inte.get('name'),
            address: inte.getIn(['meta', 'address']),
            preferred: inte.getIn(['meta', 'preferred']),
        })
    })
)

export const getChannelsByType = type => createSelector(
    [getChannels],
    state => state.filter(inte => inte.get('type') === type)
)

export const getAuthData = type => createSelector(
    [getIntegrationsState],
    state => state.getIn(['authentication', type], fromJS({}))
)

export const getRedirectUri = type => createSelector(
    [getAuthData(type)],
    state => state.get('redirect_uri', '')
)

export const makeGetRedirectUri = state => type => getRedirectUri(type)(state)

export const makeGetFormValues = state => form => getFormValues(form)(state)
